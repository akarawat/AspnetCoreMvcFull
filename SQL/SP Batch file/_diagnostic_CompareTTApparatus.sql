-- ============================================================
-- Diagnostic (one-time, not a stored procedure): เทียบ DB1 (หลัง dedupe
-- ด้วย logic เดียวกับ SP_BATLNK_MigTTApparatus ที่แก้แล้ว) กับ DB2
-- (mig_ThreadTensionApparatus) แบบ apples-to-apples
--
-- ใช้ช่วงเวลาเดียวกับที่ SP จริงใช้ตอนนี้ (rolling window จาก "วันนี้" ตอนรัน
-- สคริปต์นี้ ไม่ใช่วันที่ตายตัว) — ป้องกันปัญหาพิมพ์ปี/วันที่ผิดแบบที่เจอมาก่อน
--
-- parameterId ที่ถูกต้องของ MigTTApparatus (ไม่ใช่ Offset):
--   CDPdiff    = 1533
--   CDPlower   = 1571
--   CDPhigher  = 1564
--   CDPhighest = 1567
-- ============================================================
DECLARE @fromDate VARCHAR(15) = FORMAT(DATEADD(DAY, -7, CONVERT(DATE, GETDATE())), 'yyyy-MM-dd');
DECLARE @toDateExclusive VARCHAR(15) = FORMAT(GETDATE(), 'yyyy-MM-dd');

;WITH db1_raw AS (
    SELECT
        SEW.serial     COLLATE DATABASE_DEFAULT AS serial,
        SEW.productionDate,
        MCType.series  COLLATE DATABASE_DEFAULT AS series,
        MCType.name    COLLATE DATABASE_DEFAULT AS mc_name,
        TEXEC.id       AS mig_id,
        CDPdiff.longValue    AS CDPdiff,
        CDPlower.longValue   AS CDPlower,
        CDPhigher.longValue  AS CDPhigher,
        CDPhighest.longValue AS CDPhighest
    FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine SEW
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType MCType ON MCType.id = SEW.machineTypeId
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun TRUN ON TRUN.machineId = SEW.id
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testExecution TEXEC ON TEXEC.testRunId = TRUN.id
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPdiff ON CDPdiff.testExecutionId = TEXEC.id AND CDPdiff.parameterId IN ('1533')
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPlower ON CDPlower.testExecutionId = TEXEC.id AND CDPlower.parameterId IN ('1571')
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPhigher ON CDPhigher.testExecutionId = TEXEC.id AND CDPhigher.parameterId IN ('1564')
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter CDPhighest ON CDPhighest.testExecutionId = TEXEC.id AND CDPhighest.parameterId IN ('1567')
    WHERE MCType.series IN ('4','5','7','9')
      AND (SEW.productionDate >= @fromDate AND SEW.productionDate < @toDateExclusive)
),
db1_dedup AS (
    SELECT serial, productionDate, series, mc_name, mig_id, CDPdiff, CDPlower, CDPhigher, CDPhighest,
           ROW_NUMBER() OVER (PARTITION BY serial, productionDate ORDER BY mig_id DESC) AS rn
    FROM db1_raw
)

-- 1) มีใน DB1 (หลัง dedupe) แต่ไม่มี/ไม่ตรงใน DB2
(
    SELECT 'Missing or mismatched in DB2' AS diff_type, serial, productionDate, series, mc_name AS name, mig_id, CDPdiff, CDPlower, CDPhigher, CDPhighest
    FROM db1_dedup WHERE rn = 1
    EXCEPT
    SELECT 'Missing or mismatched in DB2', serial, productionDate, series, [name], mig_id, CDPdiff, CDPlower, CDPhigher, CDPhighest
    FROM dbo.mig_ThreadTensionApparatus
    WHERE productionDate BETWEEN @fromDate AND @toDateExclusive
)

UNION ALL

-- 2) มีใน DB2 แต่ไม่มี/ไม่ตรงใน DB1 → แถวเก่าค้าง (ไม่ควรเกิดถ้า sync ปกติ)
(
    SELECT 'Stale or mismatched in DB2 (not in DB1)', serial, productionDate, series, [name], mig_id, CDPdiff, CDPlower, CDPhigher, CDPhighest
    FROM dbo.mig_ThreadTensionApparatus
    WHERE productionDate BETWEEN @fromDate AND @toDateExclusive
    EXCEPT
    SELECT 'Stale or mismatched in DB2 (not in DB1)', serial, productionDate, series, mc_name, mig_id, CDPdiff, CDPlower, CDPhigher, CDPhighest
    FROM db1_dedup WHERE rn = 1
);
