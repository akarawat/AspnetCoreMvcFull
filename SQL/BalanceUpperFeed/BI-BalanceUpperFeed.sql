USE [pamtesterdb];
-- # Daniel SQL: https://bernina.sharepoint.com/sites/BI_PRJ_P0447_ProductionDataUtilization/Shared Documents/General/PAM tester SQL queries with Visual Studio Code/PAM tester SQL queries/Balance Adjustment?csf=1&web=1&e=kWOlCt
-->
SELECT TOP(10000)
   testExecution.id,
   sewingMachine.serial,
   sewingMachine.productionDate,
   machineType.series,
   machineType.name,
   testExecution.testDefinitionId,
   bal.doubleValue AS 'Balance',
   balup.doubleValue AS 'Balance Upper Feed'

FROM sewingMachine
   JOIN machineType on machineType.id = sewingMachine.machineTypeId
   JOIN testRun ON testRun.machineId = sewingMachine.id
   JOIN testExecution ON testExecution.testRunId = testRun.id
   JOIN checkoutDataParameter bal on bal.machineId = sewingMachine.id AND bal.parameterId IN ('1405')
   JOIN checkoutDataParameter balup on balup.machineId = sewingMachine.id AND balup.parameterId IN ('1512')

WHERE machineType.series IN ('9') AND testExecution.testDefinitionId IN ('1')
ORDER BY sewingMachine.productionDate DESC, testExecution.id DESC
--<
--> With date range
-- #Manual Migrate
DECLARE @series VARCHAR(15) = '9';
DECLARE @fromDate VARCHAR(30) = '2026-06-01';
DECLARE @toDateExclusive VARCHAR(30) = '2026-12-31 23:59:59';
SELECT TOP(10000)
   testExecution.id,
   sewingMachine.serial,
   sewingMachine.productionDate,
   machineType.series,
   machineType.name,
   testExecution.testDefinitionId,
   bal.doubleValue AS 'Balance',
   balup.doubleValue AS 'Balance Upper Feed'

FROM sewingMachine
   JOIN machineType on machineType.id = sewingMachine.machineTypeId
   JOIN testRun ON testRun.machineId = sewingMachine.id
   JOIN testExecution ON testExecution.testRunId = testRun.id
   JOIN checkoutDataParameter bal on bal.machineId = sewingMachine.id AND bal.parameterId IN ('1405')
   JOIN checkoutDataParameter balup on balup.machineId = sewingMachine.id AND balup.parameterId IN ('1512')

WHERE machineType.series IN (@series) AND testExecution.testDefinitionId IN ('1')
AND (sewingMachine.productionDate >= @fromDate AND sewingMachine.productionDate < @toDateExclusive)
ORDER BY sewingMachine.productionDate DESC, testExecution.id DESC
--<
