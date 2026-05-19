namespace AspnetCoreMvcFull.Models
{
  // Query 1: Start/End/Power Reduction per machine
  public class PowerConsumptionModel
  {
    public int id { get; set; }
    public string serial { get; set; }
    public DateTime productionDate { get; set; }
    public string productionDate_txt { get; set; }
    public string series { get; set; }
    public string prdname { get; set; }
    public decimal start_power { get; set; }
    public decimal end_power { get; set; }
    public decimal power_reduct { get; set; }
  }

  // Query 2: Power over time for each machine
  public class PowerConsumptionTimeModel
  {
    public int id { get; set; }
    public string serial { get; set; }
    public DateTime productionDate { get; set; }
    public string productionDate_txt { get; set; }
    public string series { get; set; }
    public string prdname { get; set; }
    public int timesec { get; set; }
    public decimal powerwatt { get; set; }
  }
}
