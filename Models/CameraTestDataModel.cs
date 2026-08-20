namespace AspnetCoreMvcFull.Models
{
  // #PDU-Web — Camera Test Data dashboard row, from SP_GetCameraTestData (reads dbo.mig_CameraTestData)
  public class CameraTestDataModel
  {
    public string serial { get; set; }
    public DateTime productionDate { get; set; }
    public string productionDate_txt { get; set; }
    public long productionDate_ts { get; set; }
    public string series { get; set; }
    public string name { get; set; }
    public string testDefinitionId { get; set; }
    public double? focus { get; set; }
    public double? needleXPosition { get; set; }
    public double? needleYPosition { get; set; }
  }
}
