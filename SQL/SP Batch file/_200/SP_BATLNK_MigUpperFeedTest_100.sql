USE [BTBIDataUtilize]
GO
/****** Object:  StoredProcedure [dbo].[SP_BATLNK_MigUpperFeedTest]    Script Date: 21-08-2026 9:27:55 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:  <Sakulchai.P>
-- Create date: <19/08/2026>
-- Description: Migrate "Upper Feed Test Result" (Balance + Balance Upper
--       Feed)  DB1 (pamtesterdb)  DB2 (mig_UpperFeedTest)
--       Key: serial + productionDate + testDefinitionId
-- =============================================
ALTER PROCEDURE [dbo].[SP_BATLNK_MigUpperFeedTest]
    @series VARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;

    -- #Daily Migrate
    DECLARE @fromDate VARCHAR(15) = FORMAT(DATEADD(DAY, -7, CONVERT(DATE, GETDATE())), 'yyyy-MM-dd'); -- 3  00:00
    DECLARE @toDateExclusive VARCHAR(15) = FORMAT(GETDATE(), 'yyyy-MM-dd');
    -- #Manual Migrate
    --DECLARE @fromDate VARCHAR(30) = '2025-01-01';
    --DECLARE @toDateExclusive VARCHAR(30) = '2025-01-31 23:59:59';

    ;WITH raw AS (
        SELECT TOP(10000)
            sewingMachine.serial,
            sewingMachine.productionDate,
            machineType.series,
            machineType.name,
            testExecution.testDefinitionId,
            testExecution.id AS mig_id,
            bal.doubleValue   AS Balance,
            balup.doubleValue AS BalanceUpperFeed

        FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine sewingMachine
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType machineType ON machineType.id = sewingMachine.machineTypeId
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testRun testRun ON testRun.machineId = sewingMachine.id
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].testExecution testExecution ON testExecution.testRunId = testRun.id
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter bal ON bal.machineId = sewingMachine.id AND bal.parameterId IN ('1405')
        JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter balup ON balup.machineId = sewingMachine.id AND balup.parameterId IN ('1512')

        WHERE machineType.series IN (@series)
          AND testExecution.testDefinitionId IN ('1')
          AND (sewingMachine.productionDate >= @fromDate AND sewingMachine.productionDate < @toDateExclusive)
        ORDER BY sewingMachine.productionDate DESC, testExecution.id DESC
    ),
    -- Dedupe: testExecution (testDefinitionId ) 
    -- 1 Balance/BalanceUpperFeed  —
    src AS (
        SELECT serial, productionDate, series, [name], testDefinitionId, mig_id, Balance, BalanceUpperFeed
        FROM (
            SELECT r.*,
                   ROW_NUMBER() OVER (PARTITION BY r.serial, r.productionDate, r.testDefinitionId ORDER BY r.mig_id DESC) AS rn
            FROM raw r
        ) dedup
        WHERE rn = 1
    )

    MERGE dbo.mig_UpperFeedTest AS tgt
    USING src AS s
        ON  tgt.serial COLLATE DATABASE_DEFAULT = s.serial COLLATE DATABASE_DEFAULT
        AND tgt.productionDate                  = s.productionDate
        AND tgt.testDefinitionId                = s.testDefinitionId
    WHEN MATCHED THEN
        UPDATE SET
            tgt.series           = s.series,
            tgt.[name]           = s.[name],
            tgt.mig_id           = s.mig_id,
            tgt.Balance          = s.Balance,
            tgt.BalanceUpperFeed = s.BalanceUpperFeed
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (serial, productionDate, series, [name], testDefinitionId, mig_id, Balance, BalanceUpperFeed)
        VALUES (s.serial, s.productionDate, s.series, s.[name], s.testDefinitionId, s.mig_id, s.Balance, s.BalanceUpperFeed);

END
