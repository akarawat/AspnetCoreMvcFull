using AspnetCoreMvcFull.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace AspnetCoreMvcFull.Controllers;

public class PowerConsumptionController : Controller
{
  private readonly ILogger<PowerConsumptionController> _logger;
  private readonly IConfiguration _configuration;

  public PowerConsumptionController(ILogger<PowerConsumptionController> logger, IConfiguration configuration)
  {
    _logger = logger;
    _configuration = configuration;
  }

  // -----------------------------------------------------------------------
  // GET /PowerConsumption?series=7&fullscreen=true
  // -----------------------------------------------------------------------
  public IActionResult Index(string? series, string? fullscreen)
  {
    // Default series to '7' when not supplied or invalid
    string[] validSeries = { "3", "4", "5", "7", "9" };
    string activeSeries  = validSeries.Contains(series) ? series : "7";
    ViewData["ActiveSeries"] = activeSeries;

    // Fullscreen layout — mirrors the pattern used in BalanceAdjustController
    bool isFullscreen = fullscreen?.ToLower() == "true";
    ViewData["isFullscreen"] = isFullscreen;
    ViewData["isMenu"]       = !isFullscreen;
    ViewData["isNavbar"]     = !isFullscreen;
    ViewData["menuFixed"]    = isFullscreen ? "" : "menu-fixed";
    ViewData["navbarType"]   = isFullscreen ? "layout-navbar-hidden" : "layout-navbar-fixed";

    return View();
  }

  // -----------------------------------------------------------------------
  // GET /PowerConsumption/GetPowerConsumption?series=7&flagrange=W
  // Query 1 — Start power, End power, Power reduction per machine
  // Stored Procedure: SP_GetPowerConsumption
  //   @series    VARCHAR  : '3' | '7'
  //   @flagrange VARCHAR  : 'W' = 7 days | 'M' = 30 days | 'Y' = 365 days
  // -----------------------------------------------------------------------
  [HttpGet]
  public JsonResult GetPowerConsumption(string? series, string? flagrange)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    List<PowerConsumptionModel> result = new List<PowerConsumptionModel>();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetPowerConsumption", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series",    SqlDbType.VarChar).Value = series    ?? (object)DBNull.Value;
      cmd.Parameters.AddWithValue("@flagrange", SqlDbType.VarChar).Value = flagrange ?? (object)DBNull.Value;

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new PowerConsumptionModel
        {
          id                 = Convert.ToInt32(rdr["id"]),
          serial             = rdr["serial"]?.ToString(),
          productionDate     = Convert.ToDateTime(rdr["productionDate"]),
          productionDate_txt = Convert.ToDateTime(rdr["productionDate"]).ToString("dd-MM-yyyy HH:mm"),
          series             = rdr["series"]?.ToString(),
          prdname            = rdr["prdname"]?.ToString(),
          start_power        = rdr["start_power"]  == DBNull.Value ? 0 : Convert.ToDecimal(rdr["start_power"]),
          end_power          = rdr["end_power"]    == DBNull.Value ? 0 : Convert.ToDecimal(rdr["end_power"]),
          power_reduct       = rdr["power_reduct"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["power_reduct"])
        });
      }
      conn.Close();
    }
    return Json(result);
  }

  // -----------------------------------------------------------------------
  // GET /PowerConsumption/GetPowerConsumptionTime?serial=790 66101127&series=7&flagrange=W
  // Query 2 — Power vs. Time for one machine (burn-in profile)
  // Stored Procedure: SP_GetPowerConsumptionTime
  //   @serial    VARCHAR  : machine serial number
  //   @series    VARCHAR  : '3' | '7'
  //   @flagrange VARCHAR  : 'W' | 'M' | 'Y'
  // -----------------------------------------------------------------------
  [HttpGet]
  public JsonResult GetPowerConsumptionTime(string? serial, string? series, string? flagrange)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    List<PowerConsumptionTimeModel> result = new List<PowerConsumptionTimeModel>();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetPowerConsumptionTime", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@serial",    SqlDbType.VarChar).Value = serial    ?? (object)DBNull.Value;
      cmd.Parameters.AddWithValue("@series",    SqlDbType.VarChar).Value = series    ?? (object)DBNull.Value;
      cmd.Parameters.AddWithValue("@flagrange", SqlDbType.VarChar).Value = flagrange ?? (object)DBNull.Value;

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new PowerConsumptionTimeModel
        {
          id                 = Convert.ToInt32(rdr["id"]),
          serial             = rdr["serial"]?.ToString(),
          productionDate     = Convert.ToDateTime(rdr["productionDate"]),
          productionDate_txt = Convert.ToDateTime(rdr["productionDate"]).ToString("dd-MM-yyyy HH:mm"),
          series             = rdr["series"]?.ToString(),
          prdname            = rdr["prdname"]?.ToString(),
          timesec            = rdr["timesec"]  == DBNull.Value ? 0 : Convert.ToInt32(rdr["timesec"]),
          powerwatt          = rdr["powerwatt"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["powerwatt"])
        });
      }
      conn.Close();
    }
    return Json(result);
  }
}
