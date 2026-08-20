-- ============================================================
-- Migration: Create table mig_CameraTestData
-- Purpose  : เก็บผล "Camera Test Data" (Focus + Needle X/Y Position)
--            migrate มาจาก DB1 (pamtesterdb) ผ่าน SP_BATLNK_MigCameraTestData
--
--   Key: serial + productionDate + testDefinitionId
--   mig_id เก็บ testExecution.id ต้นทาง ไว้ retrace + ใช้เป็นตัวเลือกผลทดสอบ
--   ล่าสุดตอน dedupe (เครื่องเดียวกันอาจมี testExecution ที่ testDefinitionId
--   เดียวกันมากกว่า 1 ครั้งในวันเดียว)
-- ============================================================

USE [BTBIDataUtilize]
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.tables WHERE name = 'mig_CameraTestData' AND type = 'U'
)
BEGIN
    CREATE TABLE [dbo].[mig_CameraTestData] (
        [id]                 BIGINT IDENTITY(1,1) NOT NULL,
        [serial]             VARCHAR(50)    NOT NULL,
        [productionDate]     DATETIME       NOT NULL,
        [series]             VARCHAR(20)    NOT NULL,
        [name]               VARCHAR(100)   NULL,
        [testDefinitionId]   VARCHAR(10)    NOT NULL,
        [mig_id]             BIGINT         NOT NULL,   -- testExecution.id ต้นทาง
        [Focus]              FLOAT          NULL,
        [NeedleXPosition]    FLOAT          NULL,
        [NeedleYPosition]    FLOAT          NULL,

        CONSTRAINT PK_mig_CameraTestData PRIMARY KEY CLUSTERED ([id] ASC)
    );

    -- Key สำหรับ MERGE (dedupe แล้วเหลือ 1 แถวต่อ key)
    CREATE UNIQUE NONCLUSTERED INDEX UX_mig_CameraTestData_Key
        ON [dbo].[mig_CameraTestData] ([serial], [productionDate], [testDefinitionId]);

    -- Index สำหรับ query ตามช่วงวันที่ + series
    CREATE NONCLUSTERED INDEX IX_mig_CameraTestData_DateSeries
        ON [dbo].[mig_CameraTestData] ([productionDate] DESC, [series]);

    PRINT 'Table [mig_CameraTestData] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [mig_CameraTestData] already exists — skipped.';
END
GO
