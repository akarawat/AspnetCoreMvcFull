-- =============================================
-- Author:  <Sakulchai.P>
-- Create date: <11/03/2024>
-- Description: <Select user Windows Authen>
-- V100 17-02-2026 Sakulchai.P  Transform via SP_BATLNK_MigButtonFoot3a for B4-5-7-9 Only
-- V101 04-08-2026  แปลง INSERT-if-not-exists เป็น MERGE (Insert/Update)
--       เพื่อรองรับ Windows Scheduler ที่เปลี่ยนจากวันละ 1 ครั้ง เป็นทุกชั่วโมง —
--       ถ้าค่าใน pamtesterdb ถูกแก้ไขย้อนหลัง ค่าฝั่ง BTBIDataUtilize จะอัพเดทตามด้วย
--       Key: serial + startDate (ตารางเดียวกับ SP_BATLNK_MigButtonFoot3a — แยกกันด้วย series)
-- =============================================
ALTER PROCEDURE [dbo].[SP_BATLNK_MigButtonFoot3aB4579]
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
 --DECLARE @fromDate VARCHAR(30) = '2026-02-01';
 --DECLARE @toDateExclusive VARCHAR(30) = '2026-03-01 23:59:59';

    ;WITH src AS (

  SELECT TOP(10000)
    testExecution.startDate,
    sewingMachine.serial,
    sewingMachine.productionDate,
    machineType.series,
    testExecution.testDefinitionId,
    tst.valueA,
    tst.valueB,
    sewingMachine.id AS sm_id,
    testExecution.id AS te_id,
    testExecution.testRunId AS tr_id,
    testRun.operator,
    testRun.testerVersion,
    testRun.windowsPcName,
    testRun.powersupply,
    testRun.modulprint,
    testRun.baseprint
   FROM
    [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine sewingMachine
   JOIN
    [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType machineType on machineType.id = sewingMachine.machineTypeId
   JOIN
      [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun testRun ON testRun.machineId = sewingMachine.id
   JOIN
      [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testExecution testExecution ON testExecution.testRunId = testRun.id
   JOIN
      [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testDataButtonhole tst on tst.testExecutionId = testExecution.id

  WHERE (testExecution.testDefinitionId IN ('7') AND machineType.series IN ('4','5','7','9'))
    AND
   (testExecution.startDate >= @fromDate
   AND testExecution.startDate <  @toDateExclusive)

    )

    MERGE dbo.mig_ButtonHoldfoot3a AS tgt
    USING src AS s
        ON  tgt.serial COLLATE DATABASE_DEFAULT = s.serial COLLATE DATABASE_DEFAULT
        AND tgt.startDate                       = s.startDate
    WHEN MATCHED THEN
        UPDATE SET
            tgt.valueA         = s.valueA,
            tgt.valueB         = s.valueB,
            tgt.sm_id          = s.sm_id,
            tgt.productionDate = s.productionDate,
            tgt.te_id          = s.te_id,
            tgt.tr_id          = s.tr_id,
            tgt.[operator]     = s.[operator],
            tgt.testerVersion  = s.testerVersion,
            tgt.windowsPcName  = s.windowsPcName,
            tgt.powersupply    = s.powersupply,
            tgt.modulprint     = s.modulprint,
            tgt.baseprint      = s.baseprint
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (serial, startDate, valueA, valueB, sm_id, productionDate, te_id, tr_id,
                [operator], testerVersion, windowsPcName, powersupply, modulprint, baseprint)
        VALUES (s.serial, s.startDate, s.valueA, s.valueB, s.sm_id, s.productionDate, s.te_id, s.tr_id,
                s.[operator], s.testerVersion, s.windowsPcName, s.powersupply, s.modulprint, s.baseprint);

END
