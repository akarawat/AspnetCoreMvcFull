-- =============================================
-- Author:  <Sakulchai.P>
-- Create date: <19/08/2026>
-- Description: Migrate "Camera Test Data" (Focus + Needle X/Y Position)
--       จาก DB1 (pamtesterdb) มาที่ DB2 (mig_CameraTestData)
--       ใช้ MERGE (Insert/Update) ตั้งแต่เริ่มสร้าง — focus/needlex/needley
--       (checkoutDataParameter) join กับ sewingMachine.id ตรงๆ (ค่าระดับ
--       เครื่อง) แต่ testExecution join ผ่าน testRun โดยไม่ผูกกับ
--       testExecution เฉพาะตัว ถ้าเครื่องมี testExecution ที่
--       testDefinitionId เดียวกันมากกว่า 1 ครั้ง จะได้ค่าซ้ำ (พบจริงในข้อมูล
--       ตัวอย่าง: เครื่อง 66200564 ซ้ำ 2 กลุ่ม id x 8 แถว) จึงใส่ dedupe ด้วย
--       ROW_NUMBER() เลือกผลทดสอบล่าสุด (testExecution.id สูงสุด) ต่อ
--       serial+productionDate+testDefinitionId ไปตั้งแต่ต้น
--       Key: serial + productionDate + testDefinitionId
-- =============================================
CREATE PROCEDURE [dbo].[SP_BATLNK_MigCameraTestData]
    @series VARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;

    -- ช่วงเวลา: ย้อน 7 วันจนถึงก่อนวันนี้ (exclusive)
    -- #Daily Migrate
    DECLARE @fromDate VARCHAR(15) = FORMAT(DATEADD(DAY, -7, CONVERT(DATE, GETDATE())), 'yyyy-MM-dd'); -- 7 วันก่อน 00:00
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
            focus.doubleValue   AS Focus,
            needlex.doubleValue AS NeedleXPosition,
            needley.doubleValue AS NeedleYPosition

        FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine sewingMachine
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType machineType ON machineType.id = sewingMachine.machineTypeId
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun testRun ON testRun.machineId = sewingMachine.id
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testExecution testExecution ON testExecution.testRunId = testRun.id
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter focus ON focus.machineId = sewingMachine.id AND focus.parameterId IN ('1314')
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter needlex ON needlex.machineId = sewingMachine.id AND needlex.parameterId IN ('1315')
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter needley ON needley.machineId = sewingMachine.id AND needley.parameterId IN ('1316')

        WHERE machineType.series IN (@series)
          AND testExecution.testDefinitionId IN ('1')
          AND (sewingMachine.productionDate >= @fromDate AND sewingMachine.productionDate < @toDateExclusive)
        ORDER BY sewingMachine.productionDate DESC, testExecution.id DESC
    ),
    -- Dedupe: เครื่องเดียวกันอาจมี testExecution (testDefinitionId เดียวกัน) มากกว่า
    -- 1 ครั้งในวันเดียว ทำให้ Focus/NeedleXPosition/NeedleYPosition (ค่าระดับเครื่อง)
    -- ซ้ำกันได้ — เก็บเฉพาะผลทดสอบล่าสุด (mig_id สูงสุด) ต่อ key
    src AS (
        SELECT serial, productionDate, series, [name], testDefinitionId, mig_id, Focus, NeedleXPosition, NeedleYPosition
        FROM (
            SELECT r.*,
                   ROW_NUMBER() OVER (PARTITION BY r.serial, r.productionDate, r.testDefinitionId ORDER BY r.mig_id DESC) AS rn
            FROM raw r
        ) dedup
        WHERE rn = 1
    )

    MERGE dbo.mig_CameraTestData AS tgt
    USING src AS s
        ON  tgt.serial COLLATE DATABASE_DEFAULT = s.serial COLLATE DATABASE_DEFAULT
        AND tgt.productionDate                  = s.productionDate
        AND tgt.testDefinitionId                = s.testDefinitionId
    WHEN MATCHED THEN
        UPDATE SET
            tgt.series           = s.series,
            tgt.[name]           = s.[name],
            tgt.mig_id           = s.mig_id,
            tgt.Focus            = s.Focus,
            tgt.NeedleXPosition  = s.NeedleXPosition,
            tgt.NeedleYPosition  = s.NeedleYPosition
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (serial, productionDate, series, [name], testDefinitionId, mig_id, Focus, NeedleXPosition, NeedleYPosition)
        VALUES (s.serial, s.productionDate, s.series, s.[name], s.testDefinitionId, s.mig_id, s.Focus, s.NeedleXPosition, s.NeedleYPosition);

END

--select * from mig_CameraTestData
--TRUNCATE TABLE dbo.mig_CameraTestData;
--SELECT IDENT_CURRENT('dbo.mig_CameraTestData') AS next_identity;
-- ควรได้ 1 (แถวแรกที่ insert ใหม่จะได้ id = 1)
