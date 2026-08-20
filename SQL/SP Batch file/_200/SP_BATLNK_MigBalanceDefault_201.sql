USE [BTBIDataUtilize]
GO
/****** Object:  StoredProcedure [dbo].[SP_BATLNK_MigBalanceDefault]    Script Date: 06-08-2026 11:36:00 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:  <Sakulchai.P>
-- Create date: <11/03/2024>
-- Description: <Select user Windows Authen>
-- V100  Sakulchai.P  ดึงข้อมูลทีละ 1 part tools พอ
-- V102  Sakulchai.P  ดึงข้อมูลตาม Hook Step 0/1 แยกเป็น Model และ RPM
-- V103  04-08-2026  แปลง INSERT-if-not-exists เป็น MERGE (Insert/Update)
--       เพื่อรองรับ Windows Scheduler ที่เปลี่ยนจากวันละ 1 ครั้ง เป็นทุกชั่วโมง —
--       ถ้าค่าใน pamtesterdb ถูกแก้ไขย้อนหลัง ค่าฝั่ง BTBIDataUtilize จะอัพเดทตามด้วย
--       Key: serial + productionDate
-- V201  06-08-2026  แก้ Msg 8672 "MERGE attempted to UPDATE ... same row more
--       than once" — สาเหตุคือ JOIN ไป testRun TR โดยไม่ได้ใช้คอลัมน์ไหนของ TR เลย
--       (ไม่ SELECT ไม่ filter) ถ้าเครื่องมี testRun มากกว่า 1 แถว query จะคูณแถว
--       ซ้ำตามจำนวน testRun ทันที (พบจริง: เครื่อง 66002818 มี testRun 4 รอบ ได้
--       ผลลัพธ์ซ้ำ 4 แถวเป๊ะ) แก้โดยเปลี่ยนเป็น EXISTS (คงเงื่อนไข "ต้องเคยทดสอบ" ไว้
--       เหมือนเดิม แต่ไม่คูณแถว) และเพิ่ม ROW_NUMBER() dedupe เป็น safety-net อีกชั้น
--       ป้องกันปัญหาแบบเดียวกันจาก join อื่นในอนาคต
-- =============================================
ALTER PROCEDURE [dbo].[SP_BATLNK_MigBalanceDefault]
AS
BEGIN
    SET NOCOUNT ON;

    -- ช่วงเวลา: ย้อน 3 วันจนถึงก่อนวันนี้ (exclusive)
    --DECLARE @fromDate        DATETIME = CONVERT(DATETIME, DATEADD(DAY, -3, CONVERT(DATE, GETDATE()))); -- 3 วันก่อน 00:00
    --DECLARE @toDateExclusive DATETIME = CONVERT(DATETIME, CONVERT(DATE, GETDATE()));                    -- วันนี้ 00:00
 -- #Daily Migrate
 DECLARE @fromDate VARCHAR(15) = FORMAT(DATEADD(DAY, -3, CONVERT(DATE, GETDATE())), 'yyyy-MM-dd'); -- 3 วันก่อน 00:00
 DECLARE @toDateExclusive VARCHAR(15) = FORMAT(GETDATE(), 'yyyy-MM-dd');
 -- #Manual Migrate
 --DECLARE @fromDate VARCHAR(30) = '2025-11-28';
 --DECLARE @toDateExclusive VARCHAR(30) = '2025-11-30 23:59:59';

    ;WITH raw AS (

  SELECT top(10000)

  SM.serial,
  SM.productionDate,
  MCT.series,
  MCT.name,
  bal.longValue AS 'balance'
  FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine SM
   JOIN    [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType MCT on MCT.id = SM.machineTypeId
   JOIN    [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter bal on bal.machineId = SM.id
     AND bal.parameterId IN ('1405')
  WHERE MCT.series IN ('3','4','5','7','9')
  AND SM.productionDate BETWEEN @fromDate AND @toDateExclusive
  AND EXISTS (
      SELECT 1
      FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun TR
      WHERE TR.machineId = SM.id
  )
  ORDER BY SM.productionDate DESC

    ),
    -- Safety-net dedupe: การันตีเหลือ 1 แถวต่อ (serial, productionDate) ก่อนเข้า MERGE
    -- เผื่อมี fan-out จากแหล่งอื่นที่ยังไม่เจอในตอนนี้
    src AS (
        SELECT serial, productionDate, series, [name], balance
        FROM (
            SELECT r.*,
                   ROW_NUMBER() OVER (PARTITION BY r.serial, r.productionDate ORDER BY r.balance) AS rn
            FROM raw r
        ) dedup
        WHERE rn = 1
    )

    MERGE dbo.mig_BalanceAdjust AS tgt
    USING src AS s
        ON  tgt.serial COLLATE DATABASE_DEFAULT = s.serial COLLATE DATABASE_DEFAULT
        AND tgt.productionDate                  = s.productionDate
    WHEN MATCHED THEN
        UPDATE SET
            tgt.series  = s.series,
            tgt.[name]  = s.[name],
            tgt.balance = s.balance
    WHEN NOT MATCHED BY TARGET THEN
        INSERT ([serial],[productionDate],[series],[name],[balance])
        VALUES (s.serial, s.productionDate, s.series, s.[name], s.balance);

END

