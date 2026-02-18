using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.Identity.Client;
using Microsoft.VisualBasic;
using Newtonsoft.Json.Linq;
using System.Diagnostics.Metrics;

namespace AspnetCoreMvcFull.Models
{
  public class ThreadCutModel
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
  public class RequestParamModel
  {
    public string txtStDate {  get; set; }
    public string txtEnDate {  get; set; }
  }
  public class DataItem
  {
      public string snlabel { get; set; }
      public string method { get; set; }
      public double value { get; set; }
  }
  public class CurrentData
  {
      public string Serial { get; set; }
      public DateTime StartDate { get; set; }
      public double Current_0_100 { get; set; }
      public double Current_0_900 { get; set; }
      public double Current_0_1200 { get; set; }
      public double Current_1_100 { get; set; }
      public double Current_1_900 { get; set; }
      public double Current_1_1200 { get; set; }
  }

  public class MaxCutDataModel
  {
    public Decimal cutter { get; set; }
    public Decimal normal { get; set; }
    public Decimal maxCurrentCutter { get; set; }
    public Decimal maxCurrentNormal { get; set; }
    public  string serial { get; set; }
    public string startDate { get; set; }
  }
  public class ThreadCutterModel
  {
    public DateTime productionDate { get; set; }
    public string serial { get; set; }
    public decimal maxCurrentCutter { get; set; }
    public decimal maxCurrentNormal { get; set; }
    public decimal ToleranceCutter { get; set; }
    public decimal ToleranceNormal { get; set; }
    public decimal CloseToCutter { get; set; }
    public DateTime? fromDateOut { get; set; }
    public DateTime? toDateOut { get; set; }
    public int totalTest { get; set; }
    public int totalCloseCut { get; set; }
    public int totalMaxCut { get; set; }
    public int totalNormalCut { get; set; }
    public string productionDate_txt { get; set; }
  }
  public class BoxplotStat
  {
    public string metric { get; set; }
    public double min { get; set; }
    public double q1 { get; set; }
    public double median { get; set; }
    public double q3 { get; set; }
    public double max { get; set; }
  }
  public class KPIItem
  {
    public string Title { get; set; }
    public double Value { get; set; }
    public double Average { get; set; }
    public double StdDev { get; set; }
    public string Status { get; set; } // OK, WARNING, PROBLEM
    public string Direction { get; set; } // "up", "down", "right"
  }
  public class KPIThreadCut
  {
    public int TotalTests { get; set; }
    public int DefectCutterCount { get; set; }
    public int DefectNormalCount { get; set; }
    public int TotalDefects { get; set; }
    public double OutputPercent { get; set; }
  }
  public class KPIFoot3AModel
  {
    public string serial { get; set; }
    public DateTime? startDate { get; set; }
    public string startDate_txt { get; set; }
    public double valueA { get; set; }
    public double valueB { get; set; }
    public int minVal { get; set; }
    public int maxVal { get; set; }
    public string emp_operator { get; set; }
    public string windowsPcName { get; set; }
    public string testerVersion { get; set; }
    public string powersupply { get; set; }
    public string modulprint { get; set; }
    public string baseprint { get; set; }
  }
  public class KPIItem2
  {
    public string title { get; set; }
    public double currentValue { get; set; }
    public double lastDay { get; set; }
    public double last2Weeks { get; set; }
    public double last6Months { get; set; }
    public string status { get; set; }

    // client-side helpers
    public string statusIcon { get; set; }
    public string statusColor { get; set; }
  }
  public class KPIItemBak
  {
    public string Title { get; set; }
    public double CurrentValue { get; set; }
    public double LastDayMean { get; set; }
    public double Last2WeeksMean { get; set; }
    public double Last6MonthsMean { get; set; }
    public string Status { get; set; }
  }
  public class KPIItem2Bak
  {
    public string Title { get; set; }
    public double CurrentValue { get; set; }
    public double LastDayMean { get; set; }
    public double Last2WeeksMean { get; set; }
    public double Last6MonthsMean { get; set; }
    public string Status { get; set; }
  }
  public class TopviewCfgModel
  {
    public int id { get; set; }
    public string param_code { get; set; }
    public string param_func { get; set; }
    public string mc_model { get; set; }
    public string param_1 { get; set; }
    public string param_2 { get; set; }
    public string param_3 { get; set; }
    public string param_4 { get; set; }
    public string param_5 { get; set; }
    public string param_6 { get; set; }
    public string param_7 { get; set; }
    public string remarks { get; set; }
  }
  public class KpiParamsModel
  {
    public int id { get; set; }
    public string lineid { get; set; }
    public int view1 { get; set; }
    public int view2 { get; set; }
    public int view3 { get; set; }
    public int view4 { get; set; }
    public int view5 { get; set; }
    public int view6 { get; set; }
    public int view7 { get; set; }
    public int view8 { get; set; }
    public int view9 { get; set; }
    public int view91 { get; set; }
    public int view92 { get; set; }
    public int view10 { get; set; }
  }
  public class TopViewModel
  {
    public string lineid { get; set; }
    public int status { get; set; }
    public string viewno { get; set; }
  }
  public class BoxPlotModel
  {
    public string criteria { get; set; }
    public string? flagrange { get; set; }
    public DateTime? fromDate { get; set; }
    public DateTime? toDate { get; set; }
  }
}

