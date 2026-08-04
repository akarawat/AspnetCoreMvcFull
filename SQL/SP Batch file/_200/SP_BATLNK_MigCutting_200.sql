-- =============================================
-- Author:  <Sakulchai.P>
-- Create date: <11/03/2024>
-- Description: <Select user Windows Authen>
-- V100  Sakulchai.P  ดึงข้อมูลทีละ 1 part tools พอ
-- V200  04-08-2026  แปลง INSERT-if-not-exists เป็น MERGE (Insert/Update)
--       เพื่อรองรับ Windows Scheduler ที่เปลี่ยนจากวันละ 1 ครั้ง เป็นทุกชั่วโมง —
--       ถ้าค่าใน pamtesterdb ถูกแก้ไขย้อนหลัง ค่าฝั่ง BTBIDataUtilize จะอัพเดทตามด้วย
--       Key: serial + productionDate
-- =============================================
ALTER PROCEDURE [dbo].[SP_BATLNK_MigCutting]
AS
BEGIN
    SET NOCOUNT ON;


    -- กำหนดช่วงเวลา: ย้อนหลัง 3 วัน จนถึงเมื่อวาน
    --DECLARE @fromDate DATETIME;
    --DECLARE @toDate   DATETIME;
    --SET @fromDate = DATEADD(DAY, -3, CONVERT(DATE, GETDATE()));      -- 3 วันย้อนหลัง 00:00
    --SET @toDate   = DATEADD(SECOND, -1, CONVERT(DATE, GETDATE()));   -- เมื่อวาน 23:59:59

 DECLARE @fromDate VARCHAR(15) = FORMAT(DATEADD(DAY, -3, CONVERT(DATE, GETDATE())), 'yyyy-MM-dd'); -- 3 วันก่อน 00:00
 DECLARE @toDate VARCHAR(15) = FORMAT(GETDATE(), 'yyyy-MM-dd');
 -- #Manual Migrate
 --DECLARE @fromDate VARCHAR(30) = '2025-01-01';
 --DECLARE @toDate VARCHAR(30) = '2025-01-31 23:59:59';

    ;WITH src AS (
        SELECT  TOP (7000)
            sm.serial,
            te.startDate      AS productionDate,
            cut.maxCurrentCutter as maxCurrentCutter,
            cut.maxCurrentNormal as maxCurrentNormal
        FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine sm
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType mt
             ON mt.id = sm.machineTypeId
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun tr
             ON tr.machineId = sm.id
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testExecution te
             ON te.testRunId = tr.id
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testDataCutter cut
             ON cut.testExecutionId = te.id
        WHERE te.startDate BETWEEN @fromDate AND @toDate
    )
    MERGE dbo.dummy_testDataCutter_threadcutt AS tgt
    USING src AS s
        ON  tgt.serial COLLATE Thai_CI_AS = s.serial COLLATE Thai_CI_AS
        AND tgt.productionDate            = s.productionDate
    WHEN MATCHED THEN
        UPDATE SET
            tgt.maxCurrentCutter = s.maxCurrentCutter,
            tgt.maxCurrentNormal = s.maxCurrentNormal
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (serial, productionDate, maxCurrentCutter, maxCurrentNormal)
        VALUES (s.serial, s.productionDate, s.maxCurrentCutter, s.maxCurrentNormal);

END
