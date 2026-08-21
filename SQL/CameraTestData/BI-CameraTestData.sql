USE [pamtesterdb];
-- # Daniel SQL: https://bernina.sharepoint.com/sites/BI_PRJ_P0447_ProductionDataUtilization/Shared Documents/General/PAM tester SQL queries with Visual Studio Code/PAM tester SQL queries/Camera Calibration?csf=1&web=1&e=2q0cua
-->
SELECT TOP(10000)
   testExecution.id,
   sewingMachine.serial,
   sewingMachine.productionDate,
   machineType.series,
   machineType.name,
   testExecution.testDefinitionId,
   focus.doubleValue AS 'Focus',
   needlex.doubleValue AS 'Needle X Position',
   needley.doubleValue AS 'Needle Y Position'

FROM sewingMachine
   JOIN machineType on machineType.id = sewingMachine.machineTypeId
   JOIN testRun ON testRun.machineId = sewingMachine.id
   JOIN testExecution ON testExecution.testRunId = testRun.id
   JOIN checkoutDataParameter focus on focus.machineId = sewingMachine.id AND focus.parameterId IN ('1314')
   JOIN checkoutDataParameter needlex on needlex.machineId = sewingMachine.id AND needlex.parameterId IN ('1315')
   JOIN checkoutDataParameter needley on needley.machineId = sewingMachine.id AND needley.parameterId IN ('1316')

WHERE machineType.series IN ('9') AND testExecution.testDefinitionId IN ('1')
ORDER BY sewingMachine.productionDate DESC, testExecution.id DESC
--<
--> With Date range
DECLARE @fromDate VARCHAR(30) = '2026-08-19';
DECLARE @toDateExclusive VARCHAR(30) = '2026-08-19 23:59:59';
SELECT TOP(10000)
   testExecution.id,
   sewingMachine.serial,
   sewingMachine.productionDate,
   machineType.series,
   machineType.name,
   testExecution.testDefinitionId,
   focus.doubleValue AS 'Focus',
   needlex.doubleValue AS 'Needle X Position',
   needley.doubleValue AS 'Needle Y Position'

FROM sewingMachine
   JOIN machineType on machineType.id = sewingMachine.machineTypeId
   JOIN testRun ON testRun.machineId = sewingMachine.id
   JOIN testExecution ON testExecution.testRunId = testRun.id
   JOIN checkoutDataParameter focus on focus.machineId = sewingMachine.id AND focus.parameterId IN ('1314')
   JOIN checkoutDataParameter needlex on needlex.machineId = sewingMachine.id AND needlex.parameterId IN ('1315')
   JOIN checkoutDataParameter needley on needley.machineId = sewingMachine.id AND needley.parameterId IN ('1316')

WHERE machineType.series IN ('9') AND testExecution.testDefinitionId IN ('1')
AND (sewingMachine.productionDate >= @fromDate AND sewingMachine.productionDate < @toDateExclusive)
ORDER BY sewingMachine.productionDate DESC, testExecution.id DESC
--<
