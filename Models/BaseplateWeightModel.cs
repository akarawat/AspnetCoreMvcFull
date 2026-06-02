namespace AspnetCoreMvcFull.Models
{
  public class BaseplateWeightModel
  {
    public int     id                { get; set; }
    public string  logDate_txt       { get; set; }   // "30-05-2026"
    public string  logTime_txt       { get; set; }   // "14:44:31"
    public string  logDateTime_txt   { get; set; }   // "30-05-2026 14:44" for display
    public long    logDateTime_ts    { get; set; }   // Unix ms timestamp for chart X-axis
    public string  seriesNo          { get; set; }   // "790/66101401"
    public string  userCode          { get; set; }
    public decimal calMP1            { get; set; }
    public decimal calMP4            { get; set; }
    public decimal mp1               { get; set; }
    public decimal mp4               { get; set; }
    public decimal diffMP1to4        { get; set; }   // Y-axis value
    public string  sourceFile        { get; set; }
  }
}
