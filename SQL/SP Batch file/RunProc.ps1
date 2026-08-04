try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_MigCutting" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop
    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_MigButtonFoot3a" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_MigButtonFoot3aB4579" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_MigTTApparatus" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}


try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_MigBalanceDefault" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_MigTTApparatusOffset" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_Top10Tailed '3'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}
try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_Top10Tailed '4'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}
try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_Top10Tailed '5'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}
try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_Top10Tailed '7'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}
try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_Top10Tailed '9'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_DailyProduction '3'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}
try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_DailyProduction '4'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}
try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_DailyProduction '5'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}
try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_DailyProduction '7'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_DailyProduction '9'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}


try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_AccumPassFailByLineId '3'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_AccumPassFailByLineId '4'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_AccumPassFailByLineId '5'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_AccumPassFailByLineId '7'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_AccumPassFailByLineId '9'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_MigDataPowerConsumtion '7'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_MigDataPowerConsumtion '3'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_MigDataPowerConsumtionTime '7'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

try {
    Invoke-Sqlcmd -ServerInstance "BTDB04" -Database "BTBIDataUtilize" `
      -Query "EXEC dbo.SP_BATLNK_MigDataPowerConsumtionTime '3'" -Username "batchuser" -Password "!Qaz@Wsx#Edc4r" `
      -Encrypt Optional -TrustServerCertificate -ErrorAction Stop

    Write-Host "Both stored procedures executed successfully!"
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}

