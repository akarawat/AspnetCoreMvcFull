-- =============================================
-- Author:  <Sakulchai.P>
-- Create date: <19/08/2026>
-- Description: Migrate "Upper Feed Test Result" (Balance + Balance Upper
--       Feed) จาก DB1 (pamtesterdb) มาที่ DB2 (mig_UpperFeedTest)
--       ใช้ MERGE (Insert/Update) ตั้งแต่เริ่มสร้าง — bal/balup
--       (checkoutDataParameter) join กับ sewingMachine.id ตรงๆ (ค่าระดับ
--       เครื่อง) แต่ testExecution join ผ่าน testRun โดยไม่ผูกกับ
--       testExecution เฉพาะตัว ถ้าเครื่องมี testExecution ที่
--       testDefinitionId เดียวกันมากกว่า 1 ครั้ง จะได้ค่าซ้ำ (พบจริงในข้อมูล
--       ตัวอย่าง: เครื่อง 66200564 ซ้ำ 8 แถว) จึงใส่ dedupe ด้วย
--       ROW_NUMBER() เลือกผลทดสอบล่าสุด (testExecution.id สูงสุด) ต่อ
--       serial+productionDate+testDefinitionId ไปตั้งแต่ต้น
--       Key: serial + productionDate + testDefinitionId
-- =============================================
CREATE PROCEDURE [dbo].[SP_BATLNK_MigUpperFeedTest]
    @series VARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;

    -- ช่วงเวลา: ย้อน 3 วันจนถึงก่อนวันนี้ (exclusive)
    -- #Daily Migrate
    DECLARE @fromDate VARCHAR(15) = FORMAT(DATEADD(DAY, -7, CONVERT(DATE, GETDATE())), 'yyyy-MM-dd'); -- 3 วันก่อน 00:00
    DECLARE @toDateExclusive VARCHAR(15) = FORMAT(GETDATE(), 'yyyy-MM-dd');
    -- #Manual Migrate
    DECLARE @series VARCHAR(15) = '9';
    DECLARE @fromDate VARCHAR(30) = '2026-06-01';
    DECLARE @toDateExclusive VARCHAR(30) = '2026-12-31 23:59:59';

    ;WITH raw AS (
        SELECT TOP(10000)
            sewingMachine.serial,
            sewingMachine.productionDate,
            machineType.series,
            machineType.name,
            testExecution.testDefinitionId,
            testExecution.id AS mig_id,
            bal.doubleValue   AS Balance,
            balup.doubleValue AS BalanceUpperFeed

        FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine sewingMachine
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType machineType ON machineType.id = sewingMachine.machineTypeId
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun testRun ON testRun.machineId = sewingMachine.id
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testExecution testExecution ON testExecution.testRunId = testRun.id
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter bal ON bal.machineId = sewingMachine.id AND bal.parameterId IN ('1405')
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter balup ON balup.machineId = sewingMachine.id AND balup.parameterId IN ('1512')

        WHERE machineType.series IN (@series)
          AND testExecution.testDefinitionId IN ('1')
          AND (sewingMachine.productionDate >= @fromDate AND sewingMachine.productionDate < @toDateExclusive)
        ORDER BY sewingMachine.productionDate DESC, testExecution.id DESC
    ),
    -- Dedupe: เครื่องเดียวกันอาจมี testExecution (testDefinitionId เดียวกัน) มากกว่า
    -- 1 ครั้งในวันเดียว ทำให้ Balance/BalanceUpperFeed (ค่าระดับเครื่อง) ซ้ำกันได้ —
    -- เก็บเฉพาะผลทดสอบล่าสุด (mig_id สูงสุด) ต่อ key
    src AS (
        SELECT serial, productionDate, series, [name], testDefinitionId, mig_id, Balance, BalanceUpperFeed
        FROM (
            SELECT r.*,
                   ROW_NUMBER() OVER (PARTITION BY r.serial, r.productionDate, r.testDefinitionId ORDER BY r.mig_id DESC) AS rn
            FROM raw r
        ) dedup
        WHERE rn = 1
    )

    MERGE dbo.mig_UpperFeedTest AS tgt
    USING src AS s
        ON  tgt.serial COLLATE DATABASE_DEFAULT = s.serial COLLATE DATABASE_DEFAULT
        AND tgt.productionDate                  = s.productionDate
        AND tgt.testDefinitionId                = s.testDefinitionId
    WHEN MATCHED THEN
        UPDATE SET
            tgt.series           = s.series,
            tgt.[name]           = s.[name],
            tgt.mig_id           = s.mig_id,
            tgt.Balance          = s.Balance,
            tgt.BalanceUpperFeed = s.BalanceUpperFeed
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (serial, productionDate, series, [name], testDefinitionId, mig_id, Balance, BalanceUpperFeed)
        VALUES (s.serial, s.productionDate, s.series, s.[name], s.testDefinitionId, s.mig_id, s.Balance, s.BalanceUpperFeed);

END
