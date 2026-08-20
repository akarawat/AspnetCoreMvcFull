-- ============================================================
-- Diagnostic (one-time, not a stored procedure): เทียบ DB1 (หลัง dedupe
-- ด้วย logic เดียวกับ SP_BATLNK_MigTTApparatusOffset ที่แก้แล้ว) กับ DB2
-- (mig_ThreadTensionAppOffset) แบบ apples-to-apples
--
-- หมายเหตุ: ใช้ parameterId ที่ถูกต้องของ Offset เท่านั้น
--   OFSLow     = 1572
--   OFShigher  = 1565
--   OFShighest = 1568
-- (ไม่ใช่ 1533/1571/1564/1567 ซึ่งเป็นของ SP_BATLNK_MigTTApparatus)
-- ============================================================
DECLARE @fromDate VARCHAR(15) = FORMAT(DATEADD(DAY, -7, CONVERT(DATE, GETDATE())), 'yyyy-MM-dd');
DECLARE @toDateExclusive VARCHAR(15) = FORMAT(GETDATE(), 'yyyy-MM-dd');

;WITH db1_raw AS (
    SELECT
        sewingMachine.serial    COLLATE DATABASE_DEFAULT AS serial,
        sewingMachine.productionDate,
        machineType.series      COLLATE DATABASE_DEFAULT AS series,
        machineType.name        COLLATE DATABASE_DEFAULT AS name,
        testExecution.id        AS mig_id,
        testRun.startDate,
        CDPlower.longValue      AS OFSLow,
        CDPhigher.longValue     AS OFShigher,
        CDPhighest.longValue    AS OFShighest
    FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine sewingMachine
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType machineType ON machineType.id = sewingMachine.machineTypeId
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun testRun ON testRun.machineId = sewingMachine.id
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testExecution testExecution ON testExecution.testRunId = testRun.id
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPlower ON CDPlower.testExecutionId = testExecution.id AND CDPlower.parameterId IN ('1572')
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPhigher ON CDPhigher.testExecutionId = testExecution.id AND CDPhigher.parameterId IN ('1565')
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPhighest ON CDPhighest.testExecutionId = testExecution.id AND CDPhighest.parameterId IN ('1568')
    WHERE machineType.series IN ('4','5','7','9')
      AND (sewingMachine.productionDate >= @fromDate AND sewingMachine.productionDate < @toDateExclusive)
),
db1_dedup AS (
    SELECT serial, productionDate, series, name, mig_id, startDate, OFSLow, OFShigher, OFShighest,
           ROW_NUMBER() OVER (PARTITION BY serial, productionDate ORDER BY mig_id DESC) AS rn
    FROM db1_raw
)

-- 1) มีใน DB1 (หลัง dedupe) แต่ไม่มี/ไม่ตรงใน DB2
(
    SELECT 'Missing or mismatched in DB2' AS diff_type, serial, productionDate, series, name, mig_id AS idref, startDate, OFSLow, OFShigher, OFShighest
    FROM db1_dedup WHERE rn = 1
    EXCEPT
    SELECT 'Missing or mismatched in DB2', serial, productionDate, series, name, idref, StartDate, OFSLow, OFShigher, OFShighest
    FROM dbo.mig_ThreadTensionAppOffset
    WHERE productionDate BETWEEN @fromDate AND @toDateExclusive
)

UNION ALL

-- 2) มีใน DB2 แต่ไม่มี/ไม่ตรงใน DB1 → แถวเก่าค้าง (ไม่ควรเกิดถ้า sync ปกติ)
(
    SELECT 'Stale or mismatched in DB2 (not in DB1)', serial, productionDate, series, name, idref, StartDate, OFSLow, OFShigher, OFShighest
    FROM dbo.mig_ThreadTensionAppOffset
    WHERE productionDate BETWEEN @fromDate AND @toDateExclusive
    EXCEPT
    SELECT 'Stale or mismatched in DB2 (not in DB1)', serial, productionDate, series, name, mig_id, startDate, OFSLow, OFShigher, OFShighest
    FROM db1_dedup WHERE rn = 1
);
