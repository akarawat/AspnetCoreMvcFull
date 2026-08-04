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
-- =============================================
ALTER   PROCEDURE [dbo].[SP_BATLNK_MigDataPowerConsumtion]
 @series varchar(30) = NULL
AS
BEGIN
    SET NOCOUNT ON;


    -- กำหนดช่วงเวลา: ย้อนหลัง 3 วัน จนถึงเมื่อวาน
    --DECLARE @fromDate DATETIME;
    --DECLARE @toDate   DATETIME;
    --SET @fromDate = DATEADD(DAY, -3, CONVERT(DATE, GETDATE()));      -- 3 วันย้อนหลัง 00:00
    --SET @toDate   = DATEADD(SECOND, -1, CONVERT(DATE, GETDATE()));   -- เมื่อวาน 23:59:59

 -- #Daily Migrate
 DECLARE @fromDate VARCHAR(15) = FORMAT(DATEADD(DAY, -2, CONVERT(DATE, GETDATE())), 'yyyy-MM-dd'); -- 3 วันก่อน 00:00
 DECLARE @toDate VARCHAR(15) = FORMAT(GETDATE(), 'yyyy-MM-dd');
 -- #Manual Migrate
 --DECLARE @fromDate VARCHAR(30) = '2025-01-01';
 --DECLARE @toDate VARCHAR(30) = '2025-01-31 23:59:59';

    ;WITH src AS (
  SELECT  TOP (10000)
   sewingMachine.serial AS serial,
   sewingMachine.productionDate AS productionDate,
   machineType.series AS series,
   machineType.name AS prdname,
   ROUND(testDataBurninRun.startPower,2) AS 'start_power',
   ROUND(testDataBurninRun.endPower,2) AS 'end_power',
   ROUND(testDataBurninRun.endPower - testDataBurninRun.startPower,2) AS 'power_reduct'

  FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine sewingMachine

   JOIN   [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType machineType ON machineType.id = sewingMachine.machineTypeId
   JOIN   [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun testRun ON testRun.machineId = sewingMachine.id
   JOIN   [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testExecution testExecution ON testExecution.testRunId = testRun.id
   JOIN   [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testDataBurninRun testDataBurninRun ON testDataBurninRun.testExecutionId = testExecution.id

  WHERE machineType.series = @series
   AND productionDate BETWEEN @fromDate AND @toDate
  ORDER BY sewingMachine.productionDate DESC
    )
    MERGE dbo.mig_DataPowerConsumtion AS tgt
    USING src AS s
        ON  tgt.serial COLLATE Thai_CI_AS = s.serial COLLATE Thai_CI_AS
        AND tgt.productionDate            = s.productionDate
    WHEN MATCHED THEN
        UPDATE SET
            tgt.series       = s.series,
            tgt.prdname      = s.prdname,
            tgt.start_power  = s.start_power,
            tgt.end_power    = s.end_power,
            tgt.power_reduct = s.power_reduct
    WHEN NOT MATCHED BY TARGET THEN
        INSERT ([serial], [productionDate], [series], [prdname], [start_power], [end_power], [power_reduct])
        VALUES (s.serial, s.productionDate, s.series, s.prdname, s.start_power, s.end_power, s.power_reduct);

END
