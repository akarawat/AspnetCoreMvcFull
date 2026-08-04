-- =============================================
-- Author:  <Sakulchai.P>
-- Create date: <11/03/2024>
-- Description: <Select user Windows Authen>
-- V100  Sakulchai.P  ดึงข้อมูลทีละ 1 part tools พอ
-- V200  04-08-2026  แปลง INSERT-if-not-exists เป็น MERGE (Insert/Update)
--       เพื่อรองรับ Windows Scheduler ที่เปลี่ยนจากวันละ 1 ครั้ง เป็นทุกชั่วโมง —
--       MachineCount ของ "วันนี้" จะนับเพิ่มขึ้นเรื่อยๆ ระหว่างวัน ถ้าเป็น INSERT-only
--       แบบเดิม ค่าจะค้างตามรอบแรกที่ insert เท่านั้น ตอนนี้จะอัพเดทค่าล่าสุดทุกครั้งที่รัน
--       Key: monitor_dt + series + displayName
-- V201  04-08-2026  ลดช่วงดึงข้อมูลจาก DB1 จาก 7 วัน เหลือ 3 วันย้อนหลัง + วันนี้ (รวม 4 วัน)
--       เพราะ DB1 มีการแก้ไขข้อมูลย้อนหลังได้ไม่เกิน 3 วัน (ตกลงกับทีม DB1 แล้ว) —
--       ลดโหลดต่อรอบตอนรันทุกชั่วโมง โดยยังครอบคลุมช่วงที่ข้อมูลอาจถูกแก้ไขย้อนหลังครบ
--       ใช้ CONVERT(DATE, GETDATE()) ก่อนลบวัน (ตัดเวลาให้เป็นเที่ยงคืน) ไม่งั้นขอบวันแรก
--       ของช่วง (3 วันก่อน) จะถูกตัดข้อมูลก่อนเวลาปัจจุบันของวันนั้นทิ้งไปครึ่งวัน
-- =============================================
ALTER PROCEDURE [dbo].[SP_BATLNK_DailyProduction]
 @series VARCHAR(25)
AS
BEGIN
    SET NOCOUNT ON;
 --DECLARE @MONITOR_DT DATE = convert(date, dateadd(day, -1, getdate()));
 --DECLARE @series VARCHAR(25) = '4';
 --DECLARE @MONITOR_DT DATE = '2026-02-07';

 DECLARE @tabMast table (
  monitor_dt date null,
  series VARCHAR(25) null,
  displayName varchar(512) null,
  MachineCount int not null default 0
  );
 INSERT INTO @tabMast (monitor_dt, series, displayName, MachineCount)
  SELECT
   CONVERT(date, sewingMachine.productionDate) AS [Day],
   machineType.series,
   machineType.displayName,
   COUNT(DISTINCT sewingMachine.id) AS MachineCount
  FROM [pamtesterdb.bernina.com].[pamtesterdb].[dbo].sewingMachine sewingMachine
   JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].machineType machineType ON sewingMachine.machineTypeId = machineType.id
   JOIN [pamtesterdb.bernina.com].[pamtesterdb].[dbo].checkoutDataParameter checkoutDataParameter on checkoutDataParameter.machineId = sewingMachine.id AND checkoutDataParameter.parameterId IN ('1574')
  WHERE sewingMachine.productionDate >= DATEADD(DAY, -3, CONVERT(DATE, GETDATE())) AND machineType.series IN (@series)
   GROUP BY CONVERT(date, sewingMachine.productionDate), machineType.series, machineType.displayName;
 ------------------------
 ----- # MERGE INTO BT. DB (Insert/Update) # -----
 MERGE RPTDailyProduction AS tgt
 USING @tabMast AS t
     ON  tgt.monitor_dt  = t.monitor_dt
     AND tgt.series       = t.series
     AND tgt.displayName  = t.displayName
 WHEN MATCHED THEN
     UPDATE SET
         tgt.MachineCount = t.MachineCount
 WHEN NOT MATCHED BY TARGET THEN
     INSERT (monitor_dt, series, displayName, MachineCount)
     VALUES (t.monitor_dt, t.series, t.displayName, t.MachineCount);

END
