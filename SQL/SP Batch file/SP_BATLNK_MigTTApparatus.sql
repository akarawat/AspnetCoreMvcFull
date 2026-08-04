-- =============================================
-- Author:  <Sakulchai.P>
-- Create date: <11/03/2024>
-- Description: Get data Thread Tension Apparatus from BI to BT
-- V100  Sakulchai.P  ดึงข้อมูลทีละ 1 part tools พอ
-- V102  Sakulchai.P  ดึงข้อมูลตาม Hook Step 0/1 แยกเป็น Model และ RPM
-- V103  04-08-2026  แก้ syntax error (CTE ไม่ปิดวงเล็บก่อน INSERT) และแปลง
--       INSERT-if-not-exists เป็น MERGE (Insert/Update) เพื่อรองรับ Windows
--       Scheduler ที่เปลี่ยนจากวันละ 1 ครั้ง เป็นทุกชั่วโมง — Key: serial + productionDate
-- =============================================
ALTER PROCEDURE [dbo].[SP_BATLNK_MigTTApparatus]

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
 --DECLARE @fromDate VARCHAR(30) = '2025-09-22';
 --DECLARE @toDateExclusive VARCHAR(30) = '2025-09-22 23:59:59';

    ;WITH src AS (

  SELECT TOP(15000)
   SEW.serial,
   SEW.productionDate,
   MCType.series,
   MCType.name as 'mc_name',
   TEXEC.id AS 'mig_id',
   CDPdiff.longValue AS 'CDPdiff',
   CDPlower.longValue AS 'CDPlower',
   CDPhigher.longValue AS 'CDPhigher',
   CDPhighest.longValue AS 'CDPhighest'

  FROM  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine SEW
     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType MCType on MCType.id = SEW.machineTypeId
     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun TRUN ON TRUN.machineId = SEW.id
     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testExecution TEXEC ON TEXEC.testRunId = TRUN.id

     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPdiff ON CDPdiff.testExecutionId = TEXEC.id AND CDPdiff.parameterId IN ('1533')
     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPlower ON CDPlower.testExecutionId = TEXEC.id AND CDPlower.parameterId IN ('1571')
     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPhigher ON CDPhigher.testExecutionId = TEXEC.id AND CDPhigher.parameterId IN ('1564')
     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPhighest ON CDPhighest.testExecutionId = TEXEC.id AND CDPhighest.parameterId IN ('1567')
  WHERE MCType.series IN ('4','5','7','9')
  AND (SEW.productionDate >= @fromDate AND SEW.productionDate < @toDateExclusive)
  ORDER BY SEW.productionDate DESC, TEXEC.id DESC

    )

    MERGE dbo.mig_ThreadTensionApparatus AS tgt
    USING src AS s
        ON  tgt.serial COLLATE DATABASE_DEFAULT = s.serial COLLATE DATABASE_DEFAULT
        AND tgt.productionDate                  = s.productionDate
    WHEN MATCHED THEN
        UPDATE SET
            tgt.series     = s.series,
            tgt.[name]     = s.mc_name,
            tgt.mig_id     = s.mig_id,
            tgt.CDPdiff    = s.CDPdiff,
            tgt.CDPlower   = s.CDPlower,
            tgt.CDPhigher  = s.CDPhigher,
            tgt.CDPhighest = s.CDPhighest
    WHEN NOT MATCHED BY TARGET THEN
        INSERT ([serial], [productionDate], [series], [name], [mig_id], [CDPdiff], [CDPlower], [CDPhigher], [CDPhighest])
        VALUES (s.[serial], s.[productionDate], s.[series], s.mc_name, s.[mig_id], s.[CDPdiff], s.[CDPlower], s.[CDPhigher], s.[CDPhighest]);

END
