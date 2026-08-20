-- ============================================================
-- Diagnostic (one-time, not a stored procedure): เทียบ DB1 (หลัง dedupe
-- ด้วย logic เดียวกับ SP ที่แก้แล้ว) กับ DB2 (mig_BalanceAdjust) แบบ
-- apples-to-apples เพื่อหาว่ามีแถวไหนจริงๆ ที่ขาด/เกิน
-- ============================================================
DECLARE @fromDate VARCHAR(15) = FORMAT(DATEADD(DAY, -3, CONVERT(DATE, GETDATE())), 'yyyy-MM-dd');
DECLARE @toDateExclusive VARCHAR(15) = FORMAT(GETDATE(), 'yyyy-MM-dd');

;WITH db1_raw AS (
    SELECT
        SM.serial    COLLATE DATABASE_DEFAULT AS serial,
        SM.productionDate,
        MCT.series   COLLATE DATABASE_DEFAULT AS series,
        MCT.name     COLLATE DATABASE_DEFAULT AS name,
        bal.longValue AS balance
    FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine SM
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType MCT ON MCT.id = SM.machineTypeId
    JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter bal ON bal.machineId = SM.id AND bal.parameterId IN ('1405')
    WHERE MCT.series IN ('3','4','5','7','9')
      AND SM.productionDate BETWEEN @fromDate AND @toDateExclusive
      AND EXISTS (
          SELECT 1 FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun TR WHERE TR.machineId = SM.id
      )
),
db1_dedup AS (
    SELECT serial, productionDate, series, name, balance,
           ROW_NUMBER() OVER (PARTITION BY serial, productionDate ORDER BY balance) AS rn
    FROM db1_raw
)

-- 1) มีใน DB1 (หลัง dedupe) แต่ไม่มี/ไม่ตรงใน DB2 → แถวที่ SP ยังไม่ได้ insert/update
(
    SELECT 'Missing or mismatched in DB2' AS diff_type, serial, productionDate, series, name, balance
    FROM db1_dedup WHERE rn = 1
    EXCEPT
    SELECT 'Missing or mismatched in DB2', serial, productionDate, series, name, balance
    FROM dbo.mig_BalanceAdjust
    WHERE productionDate BETWEEN @fromDate AND @toDateExclusive
)

UNION ALL

-- 2) มีใน DB2 แต่ไม่มี/ไม่ตรงใน DB1 → แถวเก่าค้าง (ไม่ควรเกิดถ้า sync ปกติ)
(
    SELECT 'Stale or mismatched in DB2 (not in DB1)', serial, productionDate, series, name, balance
    FROM dbo.mig_BalanceAdjust
    WHERE productionDate BETWEEN @fromDate AND @toDateExclusive
    EXCEPT
    SELECT 'Stale or mismatched in DB2 (not in DB1)', serial, productionDate, series, name, balance
    FROM db1_dedup WHERE rn = 1
);
