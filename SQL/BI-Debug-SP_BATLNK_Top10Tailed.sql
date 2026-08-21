USE [pamtesterdb] GO
/****** Object:  StoredProcedure [dbo].[SP_BATLNK_Top10Tailed]    Script Date: 04-08-2026 9:05:06 AM ******/
DECLARE	@series VARCHAR(25) = '9';
SELECT TOP(1000) 
			testDefinition.testName AS Test,    
			COUNT(DISTINCT CASE WHEN testExecution.result = '0' THEN sewingMachine.id END) AS failed_machines,
			CONVERT(varchar(20), CAST( 100.0 * NULLIF(COUNT(DISTINCT CASE WHEN testExecution.result = '0' THEN sewingMachine.id END),0) / NULLIF(COUNT(DISTINCT sewingMachine.id), 0) AS decimal(10,1))) + ' %' AS machine_ratio,
			COUNT(CASE WHEN testExecution.result = '0' THEN 1 END) AS failed_tests,
			CONVERT(varchar(20), CAST(100.0 * NULLIF(COUNT(CASE WHEN testExecution.result = '0' THEN 1 END), 0) / NULLIF(COUNT(*), 0) AS decimal(10,1))) + ' %' AS test_ratio

		FROM [dbo].sewingMachine sewingMachine 
		JOIN [dbo].machineType machineType ON machineType.id = sewingMachine.machineTypeId
		JOIN [dbo].testRun testRun ON testRun.machineId = sewingMachine.id
		JOIN [dbo].testExecution testExecution ON testExecution.testRunId = testRun.id
		JOIN [dbo].testDefinition testDefinition ON testDefinition.id = testExecution.testDefinitionId

		WHERE testExecution.startDate >= DATEADD(DAY, -7, GETDATE()) AND machineType.series IN (@series)
		GROUP BY testDefinition.testName
		HAVING COUNT(CASE WHEN testExecution.result = '0' THEN 1 END) > 0
		ORDER BY COUNT(DISTINCT CASE WHEN testExecution.result = '0' THEN sewingMachine.id END) DESC


