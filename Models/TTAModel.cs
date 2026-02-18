using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.Identity.Client;
using Microsoft.VisualBasic;
using Newtonsoft.Json.Linq;
using System.Diagnostics.Metrics;

namespace AspnetCoreMvcFull.Models
{
  public class TTAModel
  {
    //[dtstamp], [bfodata], [aftdata], [nordata]
    public string id { get; set; }
    public DateTime? dtstamp { get; set; }
    public string dtstamptxt { get; set; }
    public decimal bfodata { get; set; }
    public decimal aftdata { get; set; }
    public decimal nordata { get; set; }
    public int rpm { get; set; }
  }
  public class TTADataModel
  {
    public int id { get; set; }
    public string serial { get; set; }
    public DateTime productionDate { get; set; }
    public string productionDate_txt { get; set; }
    public string series { get; set; }
    public string modelname { get; set; }
    public int mig_id { get; set; }
    public int CDPdiff { get; set; }
    public int CDPlower { get; set; }
    public int CDPhigher { get; set; }
    public int CDPhighest { get; set; }
  }
  public class TTAOffsetDataModel
  {
    public int id { get; set; }
    public string serial { get; set; }
    public DateTime productionDate { get; set; }
    public string productionDate_txt { get; set; }
    public string series { get; set; }
    public string modelname { get; set; }
    public int idref { get; set; }
    public int OFSLow { get; set; }
    public int OFShigher { get; set; }
    public int OFShighest { get; set; }
  }
  public class RemarkModel
  {
    public string trid { get; set; }
    public string menuno { get; set; }
    public string series { get; set; }
    public string remarks { get; set; }
    public DateTime create_dt { get; set; }
    public string create_dt_txt { get; set; }

  }
  public class Top10Model
  {
    public string Test { get; set; }
    public int fails { get; set; }
    public string ratio { get; set; }

  }
  public class DailyProdModel
  {
    public string monitor_dt { get; set; }
    public string Day { get; set; }
    public string series { get; set; }
    public string displayName { get; set; }
    public int MachineCount { get; set; }

  }

}
