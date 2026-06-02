namespace AspnetCoreMvcFull.Models
{
  public class Top10FailedModel
  {
    public string monitor_dt_txt { get; set; }   // "16-05" for heatmap X label
    public string series          { get; set; }
    public string test            { get; set; }
    public int    fails           { get; set; }
    public decimal ratio_val      { get; set; }   // numeric, e.g. 14.0
    public string ratio_txt       { get; set; }   // display, e.g. "14.0 %"
  }
}
