USE [BTBIDataUtilize]
GO
/****** Object:  StoredProcedure [dbo].[SP_GetPowerConsumption]    Script Date: 01-07-2026 9:44:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ============================================================
-- SP_GetPowerConsumption
-- Query 1 : Start power, End power, Power reduction per machine
-- Source   : mig_DataPowerConsumtion
--
-- @series    VARCHAR(20)  : '3' (B3) | '7' (B7)
-- @flagrange VARCHAR(5)   : 'W' = last 7 days  (default)
--                           'M' = last 30 days
--                           'Y' = last 365 days
--                           'D' = custom date range (@dt_from / @dt_to)
-- @dt_from   VARCHAR(10)  : 'YYYY-MM-DD'  (ใช้เมื่อ @flagrange = 'D')
-- @dt_to     VARCHAR(10)  : 'YYYY-MM-DD'  (ใช้เมื่อ @flagrange = 'D')
-- ============================================================
ALTER   PROCEDURE [dbo].[SP_GetPowerConsumption]
  @series    VARCHAR(20) = NULL,
  @flagrange VARCHAR(5)  = 'W',
  @dt_from   VARCHAR(10) = NULL,
  @dt_to     VARCHAR(10) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @dtFrom DATETIME;
  DECLARE @dtTo   DATETIME;

  IF @flagrange = 'D' AND @dt_from IS NOT NULL AND @dt_to IS NOT NULL
  BEGIN
    SET @dtFrom = CAST(@dt_from AS DATETIME);
    SET @dtTo   = DATEADD(SECOND, 86399, CAST(@dt_to AS DATETIME));  -- ครอบคลุมถึง 23:59:59 ของวัน To
  END
  ELSE
  BEGIN
    SET @dtFrom =
      CASE @flagrange
        WHEN 'M' THEN DATEADD(DAY, -30,  GETDATE())
        WHEN 'Y' THEN DATEADD(DAY, -365, GETDATE())
        ELSE           DATEADD(DAY, -7,   GETDATE())   -- 'W' default
      END;
    SET @dtTo = GETDATE();
  END;

  SELECT
    id,
    serial,
    productionDate,
    series,
    prdname,
    start_power,
    end_power,
    power_reduct

  FROM mig_DataPowerConsumtion

  WHERE series = @series
    AND productionDate >= @dtFrom
    AND productionDate <= @dtTo

  ORDER BY productionDate DESC;
END;
