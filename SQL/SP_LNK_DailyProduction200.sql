USE [BTBIDataUtilize]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:  <Sakulchai.P>
-- Create date: <10/09/2026>
-- Description: สำเนาแยกจาก SP_LNK_DailyProduction (ต้นฉบับ Production ไม่ถูกแตะต้อง)
--       เพิ่ม @dtstart/@dtend (Date range From-To) สำหรับหน้า KPIs/Index —
--       Daily Production widget ให้เลือกช่วงวันที่เองได้ (เดิมมีแค่ @flagrange
--       W/M/HY) ส่วน ELSE branch ที่ตั้งใจรองรับช่วงวันที่กำหนดเองมีอยู่แล้วใน
--       ต้นฉบับ แต่ไม่เคยถูกเรียกใช้ได้จริง เพราะ @StartDate/@EndDate เป็นแค่
--       local variable ไม่มี parameter รับค่าเข้ามา — เพิ่ม @dtstart/@dtend เป็น
--       parameter จริง แล้ว map เข้า @StartDate/@EndDate ก่อนเข้า branch เดิม
--       ลำดับความสำคัญ: @flagrange (ถ้าส่งมา) > @dtstart/@dtend (ถ้าส่งมาทั้งคู่)
--       > default ย้อนหลัง 7 วันจนถึงเมื่อวาน (พฤติกรรมเดิมตอนไม่ส่งอะไรมาเลย)
-- =============================================
CREATE PROCEDURE [dbo].[SP_LNK_DailyProduction200]
 @series VARCHAR(25),
 @flagrange varchar(5) = null,
 @dtstart DATETIME = NULL,
 @dtend DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
 DECLARE @EndDate DATE;
    DECLARE @StartDate DATE;

 -- รับค่าจาก Date range (From-To) ถ้ามีส่งมา — ใช้ก่อนเข้า branch เดิมด้านล่าง
 IF @dtstart IS NOT NULL SET @StartDate = CAST(@dtstart AS DATE);
 IF @dtend   IS NOT NULL SET @EndDate   = CAST(@dtend   AS DATE);

 -- กำหนดช่วงวันที่
 IF @flagrange IS NOT NULL AND @flagrange != ''
 BEGIN
  IF @flagrange = 'W' BEGIN SET @StartDate = DATEADD(DAY, -6, GETDATE()); END
  ELSE IF @flagrange = 'M' BEGIN SET @StartDate = DATEADD(DAY, -31, GETDATE()); END
  ELSE IF @flagrange = 'HY' BEGIN SET @StartDate = DATEADD(DAY, -183, GETDATE()); END
  ELSE BEGIN SET @StartDate = DATEADD(DAY, -1, GETDATE()); END
  SET @EndDate = FORMAT(GETDATE(), 'yyyy-MM-dd 23:59:59');
 END
 ELSE IF @StartDate IS NULL OR @EndDate IS NULL
 BEGIN
  --SET @StartDate = FORMAT(DATEADD(DAY, -7, GETDATE()), 'yyyy-MM-dd 00:00:00');
  --SET @EndDate = FORMAT(GETDATE(), 'yyyy-MM-dd 23:59:59');

  SET @EndDate = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE);
  SET @StartDate = DATEADD(DAY, -6, @EndDate);

 END
 ELSE
 BEGIN
  SET @StartDate = FORMAT(CONVERT(datetime, @StartDate), 'yyyy-MM-dd 00:00');
  SET @EndDate = FORMAT(CONVERT(datetime, @EndDate), 'yyyy-MM-dd 23:59:59');
 END

    ;WITH DateRange AS
    (
        SELECT @StartDate AS [Day]
        UNION ALL
        SELECT DATEADD(DAY, 1, [Day])
        FROM DateRange
        WHERE [Day] < @EndDate
    ),
    ProdData AS
    (
        SELECT
            CAST(monitor_dt AS DATE) AS [Day],
            series,
            REPLACE(displayName, 'Bernina', 'B') AS displayName,
            SUM(MachineCount) AS MachineCount
        FROM RPTDailyProduction
        WHERE series = @series
          AND monitor_dt >= @StartDate
          AND monitor_dt < DATEADD(DAY, 1, @EndDate)
        GROUP BY
            CAST(monitor_dt AS DATE),
            series,
            REPLACE(displayName, 'Bernina', 'B')
    ),
    DistinctModels AS
    (
        SELECT DISTINCT
            REPLACE(displayName, 'Bernina', 'B') AS displayName
        FROM RPTDailyProduction
        WHERE series = @series
    )

    SELECT
  format(d.[Day], 'yyyy-MM-dd') AS monitor_dt,
        d.[Day],
        @series AS series,
        m.displayName,
        ISNULL(p.MachineCount, 0) AS MachineCount
    FROM DateRange d
    CROSS JOIN DistinctModels m
    LEFT JOIN ProdData p
        ON p.[Day] = d.[Day]
        AND p.displayName = m.displayName
    ORDER BY d.[Day] DESC, m.displayName
    OPTION (MAXRECURSION 0);

END
