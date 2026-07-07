namespace AspnetCoreMvcFull.Models
{
  // Daily aggregate row — from SP_GetUttcDwDailySummary
  public class UttcDwDailySummaryModel
  {
    public string monitor_dt { get; set; }
    public string monitor_dt_txt { get; set; }
    public string series { get; set; }
    public string testtype { get; set; }
    public int testedSerials { get; set; }
    public int failedSerials { get; set; }
    public int failFiles { get; set; }
    public int totalFiles { get; set; }
    public decimal failRatioPct { get; set; }
  }

  // Drill-down serial row — from SP_GetUttcDwSerialList
  public class UttcDwSerialModel
  {
    public string serial { get; set; }
    public string series { get; set; }
    public string modelName { get; set; }
    public string testtype { get; set; }
    public string testDate_txt { get; set; }
    public bool isFail { get; set; }
    public int fileCount { get; set; }
    public string firstTestTime { get; set; }
    public string lastTestTime { get; set; }
  }

  // Deepest drill-down: one raw log file — from SP_GetUttcDwFileList
  public class UttcDwFileModel
  {
    public string fileName { get; set; }
    public string displayPath { get; set; }
    public bool hasFullPath { get; set; }
    public string testTime { get; set; }
    public bool isFail { get; set; }
  }
}
