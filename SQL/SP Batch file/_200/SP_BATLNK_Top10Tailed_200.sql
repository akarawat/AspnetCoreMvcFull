-- =============================================
-- Author:  <Sakulchai.P>
-- Create date: <11/03/2024>
-- Description: <Select user Windows Authen>
-- V100  Sakulchai.P  ดึงข้อมูลทีละ 1 
-- V200  04-08-2026  แปลง INSERT-if-not-exists เป็น MERGE (Insert/Update)
--       เพื่อรองรับ Windows Scheduler ที่เปลี่ยนจากวันละ 1 ครั้ง เป็นทุกชั่วโมง —
--       ถ้าค่าใน pamtesterdb ถูกแก้ไขย้อนหลัง ค่าฝั่ง BTBIDataUtilize จะอัพเดทตามด้วย
--       Key: serial + productionDate
/****** Object:  StoredProcedure [dbo].[SP_BATLNK_Top10Tailed]    Script Date: 04-08-2026 9:05:06 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_BATLNK_Top10Tailed] 	
	@series VARCHAR(25)
AS
BEGIN
    SET NOCOUNT ON;
	DECLARE @MONITOR_DT DATETIME = convert(date, dateadd(day, -1, getdate()));
	DECLARE @tabMast table (
		monitor_dt datetime, 
		series VARCHAR(25) null, 
		Test varchar(512) null, 
		fails int not null default 0, 
		ratio varchar(20) null,
		fails_test int not null default 0, 
		testratio varchar(20) null
		);
	INSERT INTO @tabMast (monitor_dt, series, Test, fails, ratio, fails_test, testratio) 
		SELECT TOP(10) 
			@MONITOR_DT, 
			@series, 
			testDefinition.testName AS Test,    
			COUNT(DISTINCT CASE WHEN testExecution.result = '0' THEN sewingMachine.id END) AS failed_machines,
			CONVERT(varchar(20), CAST( 100.0 * NULLIF(COUNT(DISTINCT CASE WHEN testExecution.result = '0' THEN sewingMachine.id END),0) / NULLIF(COUNT(DISTINCT sewingMachine.id), 0) AS decimal(10,1))) + ' %' AS machine_ratio,
			COUNT(CASE WHEN testExecution.result = '0' THEN 1 END) AS failed_tests,
			CONVERT(varchar(20), CAST(100.0 * NULLIF(COUNT(CASE WHEN testExecution.result = '0' THEN 1 END), 0) / NULLIF(COUNT(*), 0) AS decimal(10,1))) + ' %' AS test_ratio

		FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine sewingMachine 
		JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType machineType ON machineType.id = sewingMachine.machineTypeId
		JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun testRun ON testRun.machineId = sewingMachine.id
		JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testExecution testExecution ON testExecution.testRunId = testRun.id
		JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testDefinition testDefinition ON testDefinition.id = testExecution.testDefinitionId

		WHERE testExecution.startDate >= DATEADD(DAY, -7, GETDATE()) AND machineType.series IN (@series)
		GROUP BY testDefinition.testName
		HAVING COUNT(CASE WHEN testExecution.result = '0' THEN 1 END) > 0
		ORDER BY COUNT(DISTINCT CASE WHEN testExecution.result = '0' THEN sewingMachine.id END) DESC

	IF (SELECT COUNT(*) FROM @tabMast) > 0
	BEGIN
		DELETE FROM RPTTop10Daily
		WHERE monitor_dt = @MONITOR_DT AND series = @series;

		INSERT INTO RPTTop10Daily (monitor_dt, series, Test, fails, ratio, fails_test, test_ratio, testratio)
		SELECT t.monitor_dt, t.series, t.Test, t.fails, t.ratio, t.fails_test, NULL, t.testratio
		FROM @tabMast t;
	END

END
