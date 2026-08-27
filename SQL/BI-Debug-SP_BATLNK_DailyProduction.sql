USE [pamtesterdb];
DECLARE @series VARCHAR(25) = '5';
  SELECT
   CONVERT(date, sewingMachine.productionDate) AS [Day],
   machineType.series,
   machineType.displayName,
   COUNT(DISTINCT sewingMachine.id) AS MachineCount
  FROM [dbo].sewingMachine sewingMachine
   JOIN [dbo].machineType machineType ON sewingMachine.machineTypeId = machineType.id
   JOIN [dbo].checkoutDataParameter checkoutDataParameter on checkoutDataParameter.machineId = sewingMachine.id AND checkoutDataParameter.parameterId IN ('1574')
  WHERE sewingMachine.productionDate >= DATEADD(DAY, -7, CONVERT(DATE, GETDATE())) AND machineType.series IN (@series)
   GROUP BY CONVERT(date, sewingMachine.productionDate), machineType.series, machineType.displayName;
