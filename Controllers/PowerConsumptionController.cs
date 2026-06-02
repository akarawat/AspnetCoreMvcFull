using AspnetCoreMvcFull.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace AspnetCoreMvcFull.Controllers;

public class PowerConsumptionController : Controller
{
  private readonly ILogger<PowerConsumptionController> _logger;
  private readonly IConfiguration _configuration;

  // mnufunc คงที่สำหรับ Power Consumption
  private const string MNUFUNC_POWER = "1";

  // -----------------------------------------------------------------------
  // GET /PowerConsumption/GetPowerConsumptionKPI?series=7
  // KPI TopView Card — fail% summary สำหรับ 7 วันล่าสุด
  // SP: SP_GetPowerConsumptionKPI
  //   @series    VARCHAR : '3'|'4'|'5'|'7'|'9' (หรือ "9 PAM","9 Socle" → SP ใช้ LEFT 1 char)
  //   @flagrange VARCHAR : 'W' = last 7 days (default)
  // -----------------------------------------------------------------------
  [HttpGet]
  public JsonResult GetPowerConsumptionKPI(string? series, string? flagrange)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    object result  = new { total_count = 0, fail_count = 0, fail_pct = 0m,
                           max_fail = -1m, min_fail = -1m, has_limit = 0,
                           dt_from = "", dt_to = "", series = series ?? "" };

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetPowerConsumptionKPI", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series",    SqlDbType.VarChar).Value
        = series    ?? (object)DBNull.Value;
      cmd.Parameters.AddWithValue("@flagrange", SqlDbType.VarChar).Value
        = flagrange ?? "W";

      SqlDataReader rdr = cmd.ExecuteReader();
      if (rdr.Read())
      {
        result = new
        {
          series      = rdr["series"]?.ToString(),
          dt_from     = rdr["dt_from"]?.ToString(),
          dt_to       = rdr["dt_to"]?.ToString(),
          total_count = rdr["total_count"] == DBNull.Value ? 0 : Convert.ToInt32(rdr["total_count"]),
          fail_count  = rdr["fail_count"]  == DBNull.Value ? 0 : Convert.ToInt32(rdr["fail_count"]),
          fail_pct    = rdr["fail_pct"]    == DBNull.Value ? 0m : Convert.ToDecimal(rdr["fail_pct"]),
          max_fail    = rdr["max_fail"]    == DBNull.Value ? -1m : Convert.ToDecimal(rdr["max_fail"]),
          min_fail    = rdr["min_fail"]    == DBNull.Value ? -1m : Convert.ToDecimal(rdr["min_fail"]),
          has_limit   = rdr["has_limit"]   == DBNull.Value ? 0 : Convert.ToInt32(rdr["has_limit"])
        };
      }
      conn.Close();
    }
    return Json(result);
  }

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
    string[] validSeries = { "3", "4", "5", "7", "9" };
    string activeSeries  = validSeries.Contains(series) ? series : "7";
    ViewData["ActiveSeries"] = activeSeries;

    bool isFullscreen        = fullscreen?.ToLower() == "true";
    ViewData["isFullscreen"] = isFullscreen;
    ViewData["isMenu"]       = !isFullscreen;
    ViewData["isNavbar"]     = !isFullscreen;
    ViewData["menuFixed"]    = isFullscreen ? "" : "menu-fixed";
    ViewData["navbarType"]   = isFullscreen ? "layout-navbar-hidden" : "layout-navbar-fixed";

    return View();
  }

  // -----------------------------------------------------------------------
  // GET /PowerConsumption/GetPowerConsumption?series=7&flagrange=W
  // SP: SP_GetPowerConsumption
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
  // GET /PowerConsumption/GetPowerConsumptionTime
  // SP: SP_GetPowerConsumptionTime
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

  // -----------------------------------------------------------------------
  // GET /PowerConsumption/GetPassFailParam?series=7
  // SP: SP_GetPassFailParam  (@series, @mnufunc='1')
  // -----------------------------------------------------------------------
  [HttpGet]
  public JsonResult GetPassFailParam(string? series)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    PassFailParamModel? result = null;

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetPassFailParam", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series",  SqlDbType.VarChar).Value = series ?? (object)DBNull.Value;
      cmd.Parameters.AddWithValue("@mnufunc", SqlDbType.VarChar).Value = MNUFUNC_POWER;

      SqlDataReader rdr = cmd.ExecuteReader();
      if (rdr.Read())
      {
        result = new PassFailParamModel
        {
          id       = Convert.ToInt32(rdr["id"]),
          series   = rdr["series"]?.ToString(),
          mnufunc  = rdr["mnufunc"]?.ToString(),
          max_fail = rdr["max_fail"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["max_fail"]),
          min_fail = rdr["min_fail"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["min_fail"])
        };
      }
      conn.Close();
    }
    // คืน null-safe object — JS จะเช็ค null ก่อนวาดเส้น
    return Json(result);
  }

  // -----------------------------------------------------------------------
  // POST /PowerConsumption/UpdatePassFailParam
  // SP: SP_UpdatePassFailParam  (@series, @mnufunc, @max_fail, @min_fail)
  // -----------------------------------------------------------------------
  [HttpPost]
  public JsonResult UpdatePassFailParam(string series, string mnufunc, decimal max_fail, decimal min_fail)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    int affected   = 0;

    try
    {
      using (SqlConnection conn = new SqlConnection(connStr))
      {
        conn.Open();
        SqlCommand cmd = new SqlCommand("SP_UpdatePassFailParam", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@series",   SqlDbType.VarChar).Value  = series;
        cmd.Parameters.AddWithValue("@mnufunc",  SqlDbType.VarChar).Value  = mnufunc;
        cmd.Parameters.AddWithValue("@max_fail", SqlDbType.Decimal).Value  = max_fail;
        cmd.Parameters.AddWithValue("@min_fail", SqlDbType.Decimal).Value  = min_fail;

        SqlDataReader rdr = cmd.ExecuteReader();
        if (rdr.Read()) affected = Convert.ToInt32(rdr["affected_rows"]);
        conn.Close();
      }
      return Json(new { success = true, affected_rows = affected });
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "UpdatePassFailParam failed");
      return Json(new { success = false, message = ex.Message });
    }
  }
}
