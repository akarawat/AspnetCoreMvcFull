namespace AspnetCoreMvcFull.Models
{
  // #PDU-Web — Upper Feed Test dashboard row, from SP_GetUpperFeedTest (reads dbo.mig_UpperFeedTest)
  public class UpperFeedTestModel
  {
    public string serial { get; set; }
    public DateTime productionDate { get; set; }
    public string productionDate_txt { get; set; }
    public long productionDate_ts { get; set; }
    public string series { get; set; }
    public string name { get; set; }
    public string testDefinitionId { get; set; }
    public double? balance { get; set; }
    public double? balanceUpperFeed { get; set; }
  }
}
