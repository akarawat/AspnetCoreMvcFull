using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.Identity.Client;
using Microsoft.VisualBasic;
using Newtonsoft.Json.Linq;
using System.Diagnostics.Metrics;

namespace AspnetCoreMvcFull.Models
{
  public class BalanceAdjustModel
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
  public class BalanceAdjustModelDataModel
  {
    public int id { get; set; }
    public string serial { get; set; }
    public DateTime productionDate { get; set; }
    public string productionDate_txt { get; set; }
    public string series { get; set; }
    public string modelname { get; set; }
    public int balance { get; set; }
  }
  public class BalanceAdjustBubbleModelDataModel
  {
    public DateTime productionDate { get; set; }
    //public string productionDate { get; set; }
    public string productionDate_txt { get; set; }
    public string series { get; set; }
    public int balance { get; set; }
    public int balance_total { get; set; }
  }
}
