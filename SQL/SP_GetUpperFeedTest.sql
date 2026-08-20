USE [BTBIDataUtilize]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ============================================================
-- SP_GetUpperFeedTest
-- Purpose : อ่านข้อมูล Upper Feed Test (Balance / Balance Upper Feed)
--           จากตาราง dbo.mig_UpperFeedTest สำหรับหน้า Dashboard /UpperFeedTest
--
-- @series      VARCHAR(20)  : '3' | '4' | '5' | '7' | '9'  (NULL = ทุก series)
-- @flagrange   VARCHAR(5)   : 'W' = 7 วัน (default) | 'M' = 30 วัน | 'H' = 180 วัน
--                              'D' = custom date range (@dt_from / @dt_to)
-- @dt_from     VARCHAR(10)  : 'YYYY-MM-DD' (ใช้เมื่อ @flagrange = 'D')
-- @dt_to       VARCHAR(10)  : 'YYYY-MM-DD' (ใช้เมื่อ @flagrange = 'D')
-- ============================================================
CREATE PROCEDURE [dbo].[SP_GetUpperFeedTest]
    @series      VARCHAR(20)  = NULL,
    @flagrange   VARCHAR(5)   = 'W',
    @dt_from     VARCHAR(10)  = NULL,
    @dt_to       VARCHAR(10)  = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @dtFrom DATETIME;
    DECLARE @dtTo   DATETIME;

    IF @flagrange = 'D' AND @dt_from IS NOT NULL AND @dt_to IS NOT NULL
    BEGIN
        SET @dtFrom = CAST(@dt_from AS DATETIME);
        SET @dtTo   = DATEADD(SECOND, 86399, CAST(@dt_to AS DATETIME)); -- ครอบคลุมถึง 23:59:59 ของวัน To
    END
    ELSE
    BEGIN
        SET @dtFrom =
            CASE @flagrange
                WHEN 'M' THEN DATEADD(DAY, -30,  GETDATE())
                WHEN 'H' THEN DATEADD(DAY, -180, GETDATE())
                ELSE               DATEADD(DAY, -7,   GETDATE())   -- 'W' default
            END;
        SET @dtTo = GETDATE();
    END;

    SELECT
        serial,
        productionDate,
        series,
        [name],
        testDefinitionId,
        Balance,
        BalanceUpperFeed

    FROM dbo.mig_UpperFeedTest

    WHERE (@series IS NULL OR series = @series)
      AND productionDate >= @dtFrom
      AND productionDate <= @dtTo

    ORDER BY productionDate DESC;
END
GO

PRINT 'Stored Procedure [SP_GetUpperFeedTest] created successfully.';
GO
