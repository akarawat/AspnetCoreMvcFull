-- ============================================================
-- Migration: Create table mig_UpperFeedTest
-- Purpose  : เก็บผล "Upper Feed Test Result" (Balance + Balance Upper Feed)
--            migrate มาจาก DB1 (pamtesterdb) ผ่าน SP_BATLNK_MigUpperFeedTest
--
--   Key: serial + productionDate + testDefinitionId
--   mig_id เก็บ testExecution.id ต้นทาง ไว้ retrace + ใช้เป็นตัวเลือกผลทดสอบ
--   ล่าสุดตอน dedupe (เครื่องเดียวกันอาจมี testExecution ที่ testDefinitionId
--   เดียวกันมากกว่า 1 ครั้งในวันเดียว)
-- ============================================================

USE [BTBIDataUtilize]
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.tables WHERE name = 'mig_UpperFeedTest' AND type = 'U'
)
BEGIN
    CREATE TABLE [dbo].[mig_UpperFeedTest] (
        [id]                BIGINT IDENTITY(1,1) NOT NULL,
        [serial]            VARCHAR(50)    NOT NULL,
        [productionDate]    DATETIME       NOT NULL,
        [series]            VARCHAR(20)    NOT NULL,
        [name]              VARCHAR(100)   NULL,
        [testDefinitionId]  VARCHAR(10)    NOT NULL,
        [mig_id]            BIGINT         NOT NULL,   -- testExecution.id ต้นทาง
        [Balance]           FLOAT          NULL,
        [BalanceUpperFeed]  FLOAT          NULL,

        CONSTRAINT PK_mig_UpperFeedTest PRIMARY KEY CLUSTERED ([id] ASC)
    );

    -- Key สำหรับ MERGE (dedupe แล้วเหลือ 1 แถวต่อ key)
    CREATE UNIQUE NONCLUSTERED INDEX UX_mig_UpperFeedTest_Key
        ON [dbo].[mig_UpperFeedTest] ([serial], [productionDate], [testDefinitionId]);

    -- Index สำหรับ query ตามช่วงวันที่ + series
    CREATE NONCLUSTERED INDEX IX_mig_UpperFeedTest_DateSeries
        ON [dbo].[mig_UpperFeedTest] ([productionDate] DESC, [series]);

    PRINT 'Table [mig_UpperFeedTest] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [mig_UpperFeedTest] already exists — skipped.';
END
GO
