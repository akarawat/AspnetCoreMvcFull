USE [BTBIDataUtilize]
GO
/****** Object:  StoredProcedure [dbo].[SP_GetPassFailParam]    Script Date: 03-07-2026 2:44:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ============================================================
-- SP_GetPassFailParam
-- ดึง Limit (max_fail, min_fail) สำหรับ series + mnufunc
--
-- @series    VARCHAR : '3' | '4' | '5' | '7' | '9'
-- @mnufunc   VARCHAR : '1' (Power Consumption fixed)
-- ============================================================
ALTER   PROCEDURE [dbo].[SP_GetPassFailParam]
  @series  VARCHAR(20) = NULL,
  @mnufunc VARCHAR(20) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    id,
    series,
    mnufunc,
    max_fail,
    min_fail
  FROM [BTBIDataUtilize].[dbo].[passfail_param]
  WHERE series  = @series
    AND mnufunc = @mnufunc;
END;
