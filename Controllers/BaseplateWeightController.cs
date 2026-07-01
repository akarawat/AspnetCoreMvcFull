using AspnetCoreMvcFull.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace AspnetCoreMvcFull.Controllers;

public class BaseplateWeightController : Controller
{
  private readonly ILogger<BaseplateWeightController> _logger;
  private readonly IConfiguration _configuration;

  // mnufunc คงที่สำหรับ Baseplate Weight
  private const string MNUFUNC_BASEPLATE = "10";

  public BaseplateWeightController(
    ILogger<BaseplateWeightController> logger,
    IConfiguration configuration)
  {
    _logger = logger;
    _configuration = configuration;
  }

  // -----------------------------------------------------------------------
  // GET /BaseplateWeight?series=7&fullscreen=true
  // -----------------------------------------------------------------------
  public IActionResult Index(string? series, string? fullscreen)
  {
    // Validate series — default '7'
    string[] validSeries = { "3", "4", "5", "7", "9" };
    string activeSeries = validSeries.Contains(series) ? series : "7";
    ViewData["ActiveSeries"] = activeSeries;

    // Fullscreen layout
    bool isFullscreen = fullscreen?.ToLower() == "true";
    ViewData["isFullscreen"] = isFullscreen;
    ViewData["isMenu"] = !isFullscreen;
    ViewData["isNavbar"] = !isFullscreen;
    ViewData["menuFixed"] = isFullscreen ? "" : "menu-fixed";
    ViewData["navbarType"] = isFullscreen ? "layout-navbar-hidden" : "layout-navbar-fixed";

    return View();
  }

  // -----------------------------------------------------------------------
  // GET /BaseplateWeight/GetBaseplateWeight?series=7&flagrange=W
  // Stored Procedure : SP_GetBaseplateWeight
  //   @series    VARCHAR : '3' | '4' | '5' | '7' | '9'
  //                        (matches LEFT(SeriesNo,1) — e.g. "790/..." → '7')
  //   @flagrange VARCHAR : 'W' = 7 days | 'M' = 30 days | 'H' = 180 days
  // -----------------------------------------------------------------------
  [HttpGet]
  public JsonResult GetBaseplateWeight(string? series, string? flagrange)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    var result = new List<BaseplateWeightModel>();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetBaseplateWeight", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value
        = series ?? (object)DBNull.Value;
      cmd.Parameters.AddWithValue("@flagrange", SqlDbType.VarChar).Value
        = flagrange ?? (object)DBNull.Value;

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        // Combine LogDate + LogTime → DateTime
        DateTime logDate = Convert.ToDateTime(rdr["LogDate"]);
        TimeSpan logTime = TimeSpan.Parse(rdr["LogTime"].ToString());
        DateTime logDT = logDate.Date + logTime;

        // Unix timestamp (ms) for ApexCharts datetime axis
        long ts = new DateTimeOffset(logDT).ToUnixTimeMilliseconds();

        result.Add(new BaseplateWeightModel
        {
          id = Convert.ToInt32(rdr["ID"]),
          logDate_txt = logDate.ToString("dd-MM-yyyy"),
          logTime_txt = rdr["LogTime"].ToString(),
          logDateTime_txt = logDT.ToString("dd-MM-yyyy HH:mm"),
          logDateTime_ts = ts,
          seriesNo = rdr["SeriesNo"]?.ToString(),
          userCode = rdr["UserCode"]?.ToString(),
          calMP1 = rdr["CalMP1"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["CalMP1"]),
          calMP4 = rdr["CalMP4"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["CalMP4"]),
          mp1 = rdr["MP1"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["MP1"]),
          mp4 = rdr["MP4"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["MP4"]),
          diffMP1to4 = rdr["DiffMP1to4"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["DiffMP1to4"]),
          sourceFile = rdr["SourceFile"]?.ToString()
        });
      }
      conn.Close();
    }
    return Json(result);
  }

  // -----------------------------------------------------------------------
  // GET /BaseplateWeight/GetPassFailParam?series=7
  // SP: SP_GetPassFailParam  (@series, @mnufunc='10')
  // คืนค่า max_fail (USL) / min_fail (LSL) — null-safe ถ้า series ไม่มีข้อมูล
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
      cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = series ?? (object)DBNull.Value;
      cmd.Parameters.AddWithValue("@mnufunc", SqlDbType.VarChar).Value = MNUFUNC_BASEPLATE;

      SqlDataReader rdr = cmd.ExecuteReader();
      if (rdr.Read())
      {
        result = new PassFailParamModel
        {
          id = Convert.ToInt32(rdr["id"]),
          series = rdr["series"]?.ToString(),
          mnufunc = rdr["mnufunc"]?.ToString(),
          max_fail = rdr["max_fail"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["max_fail"]),
          min_fail = rdr["min_fail"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["min_fail"])
        };
      }
      conn.Close();
    }
    // คืน null ถ้า series นี้ยังไม่มี config — JS จะ fallback เป็นค่า default
    return Json(result);
  }

  // -----------------------------------------------------------------------
  // GET /BaseplateWeight/GetBaseplateWeightKPI?series=7
  // ใช้สำหรับ KPI card 10 บนหน้า KPIs/Index
  // คำนวณ total / outOfSpec / failRatio จาก flagrange='W' (7 วันล่าสุด)
  // -----------------------------------------------------------------------
  [HttpGet]
  public JsonResult GetBaseplateWeightKPI(string? series)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    // 1. โหลด USL / LSL จาก passfail_param
    decimal usl = 25, lsl = -25;
    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetPassFailParam", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = series ?? (object)DBNull.Value;
      cmd.Parameters.AddWithValue("@mnufunc", SqlDbType.VarChar).Value = MNUFUNC_BASEPLATE;
      SqlDataReader rdr = cmd.ExecuteReader();
      if (rdr.Read())
      {
        usl = rdr["max_fail"] == DBNull.Value ? usl : Convert.ToDecimal(rdr["max_fail"]);
        lsl = rdr["min_fail"] == DBNull.Value ? lsl : Convert.ToDecimal(rdr["min_fail"]);
      }
    }

    // 2. โหลดข้อมูล 7 วันล่าสุด
    int total = 0, outOfSpec = 0;
    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetBaseplateWeight", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = series ?? (object)DBNull.Value;
      cmd.Parameters.AddWithValue("@flagrange", SqlDbType.VarChar).Value = "W";
      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        decimal diff = rdr["DiffMP1to4"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["DiffMP1to4"]);
        total++;
        if (diff > usl || diff < lsl) outOfSpec++;
      }
    }

    // 3. คำนวณ fail ratio
    double ratio = total > 0 ? Math.Round((double)outOfSpec / total * 100, 1) : 0;

    // 4. status: green < 2%, yellow 2-5%, red > 5%
    string status = ratio < 2 ? "green" : ratio <= 5 ? "yellow" : "red";

    return Json(new { total, outOfSpec, ratio, status, usl, lsl });
  }

  // -----------------------------------------------------------------------
  // POST /BaseplateWeight/UpdatePassFailParam
  // SP: SP_UpdatePassFailParam  (@series, @mnufunc='10', @max_fail (USL), @min_fail (LSL))
  // -----------------------------------------------------------------------
  [HttpPost]
  public JsonResult UpdatePassFailParam(string series, decimal max_fail, decimal min_fail)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    int affected = 0;

    try
    {
      using (SqlConnection conn = new SqlConnection(connStr))
      {
        conn.Open();
        SqlCommand cmd = new SqlCommand("SP_UpdatePassFailParam", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = series;
        cmd.Parameters.AddWithValue("@mnufunc", SqlDbType.VarChar).Value = MNUFUNC_BASEPLATE;
        cmd.Parameters.AddWithValue("@max_fail", SqlDbType.Decimal).Value = max_fail;
        cmd.Parameters.AddWithValue("@min_fail", SqlDbType.Decimal).Value = min_fail;

        SqlDataReader rdr = cmd.ExecuteReader();
        if (rdr.Read()) affected = Convert.ToInt32(rdr["affected_rows"]);
        conn.Close();
      }
      return Json(new { success = true, affected_rows = affected });
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "UpdatePassFailParam (Baseplate) failed");
      return Json(new { success = false, message = ex.Message });
    }
  }
}
