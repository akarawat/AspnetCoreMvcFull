-- =============================================
-- Author:  <Sakulchai.P>
-- Create date: <11/03/2024>
-- Description: <Select user Windows Authen>
-- V100    Sakulchai.P  ดึงข้อมูลทีละ 1 part tools พอ
-- V102    Sakulchai.P  ดึงข้อมูลตาม Hook Step 0/1 แยกเป็น Model และ RPM
-- V103 17-02-2026 Sakulchai.P  B3 Only
-- V104 04-08-2026  แปลง INSERT-if-not-exists เป็น MERGE (Insert/Update)
--       เพื่อรองรับ Windows Scheduler ที่เปลี่ยนจากวันละ 1 ครั้ง เป็นทุกชั่วโมง —
--       ถ้าค่าใน pamtesterdb ถูกแก้ไขย้อนหลัง ค่าฝั่ง BTBIDataUtilize จะอัพเดทตามด้วย
--       Key: serial + startDate
-- =============================================
ALTER PROCEDURE [dbo].[SP_BATLNK_MigButtonFoot3a]
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

  SELECT top(10000)
    sm.serial,
    te.startDate,
    cdp.longValue as valueA,
    cdp2.longValue as valueB,
    sm.id              AS sm_id,
    sm.productionDate,
    te.id              AS te_id,
    tr.id              AS tr_id,
    tr.[operator],
    tr.testerVersion,
    tr.windowsPcName,
    tr.powersupply,
    tr.modulprint,
    tr.baseprint
  FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine      sm
  join [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType mt on mt.id = sm.machineTypeId
  join [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter cdp on cdp.machineId = sm.id and cdp.parameterId = 1517
  join [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter cdp2 on cdp2.machineId = sm.id and cdp2.parameterId = 1518
  JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun            tr ON tr.machineId   = sm.id
  JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testExecution      te ON te.testRunId   = tr.id
  WHERE
   mt.series = '3'
   AND (te.startDate >= @fromDate
   AND te.startDate <  @toDateExclusive)

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
