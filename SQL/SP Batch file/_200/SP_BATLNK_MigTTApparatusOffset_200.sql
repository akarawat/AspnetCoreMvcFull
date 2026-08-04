-- =============================================
-- Author:  <Sakulchai.P>
-- Create date: <11/03/2024>
-- Description: Get data Thread Tension Apparatus from BI to BT
-- V100  Sakulchai.P  ดึงข้อมูลทีละ 1 part tools พอ
-- V200  04-08-2026  แก้ syntax error (CTE ไม่ปิดวงเล็บก่อน INSERT) และแปลง
--       INSERT-if-not-exists เป็น MERGE (Insert/Update) เพื่อรองรับ Windows
--       Scheduler ที่เปลี่ยนจากวันละ 1 ครั้ง เป็นทุกชั่วโมง — Key: serial + productionDate
-- =============================================
ALTER   PROCEDURE [dbo].[SP_BATLNK_MigTTApparatusOffset]

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
 --DECLARE @fromDate VARCHAR(30) = '2026-01-01';
 --DECLARE @toDateExclusive VARCHAR(30) = '2026-01-25 23:59:59';

 -- Query from Daniel
    ;WITH src AS (

  SELECT TOP(10000)
   sewingMachine.serial,
   sewingMachine.productionDate,
   machineType.series,
   machineType.name,
   testExecution.id,
   testRun.startDate,
   CDPlower.longValue AS OFSLow,
   CDPhigher.longValue AS OFShigher,
   CDPhighest.longValue AS OFShighest

  FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine sewingMachine
     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType machineType on machineType.id = sewingMachine.machineTypeId
     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun testRun ON testRun.machineId = sewingMachine.id
     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testExecution testExecution ON testExecution.testRunId = testRun.id
     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPlower ON CDPlower.testExecutionId = testExecution.id AND CDPlower.parameterId IN ('1572')
     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPhigher ON CDPhigher.testExecutionId = testExecution.id AND CDPhigher.parameterId IN ('1565')
     JOIN  [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPhighest ON CDPhighest.testExecutionId = testExecution.id AND CDPhighest.parameterId IN ('1568')
  WHERE machineType.series IN ('4','5','7','9')
  AND (sewingMachine.productionDate >= @fromDate AND sewingMachine.productionDate < @toDateExclusive)
  ORDER BY sewingMachine.productionDate DESC, testExecution.id DESC

    )

    MERGE dbo.mig_ThreadTensionAppOffset AS tgt
    USING src AS s
        ON  tgt.serial COLLATE DATABASE_DEFAULT = s.serial COLLATE DATABASE_DEFAULT
        AND tgt.productionDate                  = s.productionDate
    WHEN MATCHED THEN
        UPDATE SET
            tgt.series      = s.series,
            tgt.[name]      = s.[name],
            tgt.idref       = s.id,
            tgt.StartDate   = s.startDate,
            tgt.OFSLow      = s.OFSLow,
            tgt.OFShigher   = s.OFShigher,
            tgt.OFShighest  = s.OFShighest
    WHEN NOT MATCHED BY TARGET THEN
        INSERT ([serial], [productionDate], [series], [name], [idref], [StartDate], [OFSLow], [OFShigher], [OFShighest])
        VALUES (s.serial, s.productionDate, s.series, s.[name], s.id, s.startDate, s.OFSLow, s.OFShigher, s.OFShighest);

END
