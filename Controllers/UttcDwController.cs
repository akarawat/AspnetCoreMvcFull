using AspnetCoreMvcFull.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace AspnetCoreMvcFull.Controllers;

// #PDU-UttcDw — Drill-down dashboard for UTTC/DW test log data
// collected by the UttcDwLogMonitor background service.
public class UttcDwController : Controller
{
  private readonly ILogger<UttcDwController> _logger;
  private readonly IConfiguration _configuration;

  public UttcDwController(
    ILogger<UttcDwController> logger,
    IConfiguration configuration)
  {
    _logger = logger;
    _configuration = configuration;
  }

  // -----------------------------------------------------------------------
  // GET /UttcDw?series=7&fullscreen=true
  // -----------------------------------------------------------------------
  public IActionResult Index(string? series, string? fullscreen)
  {
    // Default series — "" means "All"
    string[] validSeries = { "4", "5", "7", "9" };
    string activeSeries = validSeries.Contains(series) ? series : "";
    ViewData["ActiveSeries"] = activeSeries;

    //bool isFullscreen = fullscreen?.ToLower() == "true";
    //ViewData["isFullscreen"] = isFullscreen;
    //ViewData["isMenu"] = !isFullscreen;
    //ViewData["isNavbar"] = !isFullscreen;
    //ViewData["menuFixed"] = isFullscreen ? "" : "menu-fixed";
    //ViewData["navbarType"] = isFullscreen ? "layout-navbar-hidden" : "layout-navbar-fixed";

    string isFullscreen = Request.Query["fullscreen"]; // หรือ TempData
    if (isFullscreen == null)
    {
      ViewData["isFullscreen"] = "false";
    }
    else
    {
      ViewData["isFullscreen"] = isFullscreen.ToString().ToLower();
    }

    return View();
  }

  // -----------------------------------------------------------------------
  // GET /UttcDw/GetDailySummary?series=&testtype=&dt_from=&dt_to=
  // SP: usp_GetUttcDwDailySummary
  // -----------------------------------------------------------------------
  [HttpGet]
  public JsonResult GetDailySummary(string? series, string? testtype, string? dt_from, string? dt_to)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    var result = new List<UttcDwDailySummaryModel>();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("usp_GetUttcDwDailySummary", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", string.IsNullOrEmpty(series) ? (object)DBNull.Value : series);
      cmd.Parameters.AddWithValue("@testtype", string.IsNullOrEmpty(testtype) ? (object)DBNull.Value : testtype);
      cmd.Parameters.AddWithValue("@dt_from", string.IsNullOrEmpty(dt_from) ? (object)DBNull.Value : Convert.ToDateTime(dt_from));
      cmd.Parameters.AddWithValue("@dt_to", string.IsNullOrEmpty(dt_to) ? (object)DBNull.Value : Convert.ToDateTime(dt_to));

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        var testDate = Convert.ToDateTime(rdr["TestDate"]);
        result.Add(new UttcDwDailySummaryModel
        {
          monitor_dt = testDate.ToString("yyyy-MM-dd"),
          monitor_dt_txt = testDate.ToString("dd-MMM-yyyy"),
          series = rdr["Series"].ToString(),
          testtype = rdr["TestType"].ToString(),
          testedSerials = Convert.ToInt32(rdr["TestedSerials"]),
          failedSerials = Convert.ToInt32(rdr["FailedSerials"]),
          failFiles = Convert.ToInt32(rdr["FailFiles"]),
          totalFiles = Convert.ToInt32(rdr["TotalFiles"]),
          failRatioPct = rdr["FailRatioPct"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["FailRatioPct"])
        });
      }
      conn.Close();
    }
    return Json(result);
  }

  // -----------------------------------------------------------------------
  // GET /UttcDw/GetSerialList?series=&testtype=&dt_from=&dt_to=&failonly=
  // SP: usp_GetUttcDwSerialList
  // -----------------------------------------------------------------------
  [HttpGet]
  public JsonResult GetSerialList(string? series, string? testtype, string? dt_from, string? dt_to, bool failonly = false)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    var result = new List<UttcDwSerialModel>();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("usp_GetUttcDwSerialList", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", string.IsNullOrEmpty(series) ? (object)DBNull.Value : series);
      cmd.Parameters.AddWithValue("@testtype", string.IsNullOrEmpty(testtype) ? (object)DBNull.Value : testtype);
      cmd.Parameters.AddWithValue("@dt_from", string.IsNullOrEmpty(dt_from) ? (object)DBNull.Value : Convert.ToDateTime(dt_from));
      cmd.Parameters.AddWithValue("@dt_to", string.IsNullOrEmpty(dt_to) ? (object)DBNull.Value : Convert.ToDateTime(dt_to));
      cmd.Parameters.AddWithValue("@failonly", failonly);

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new UttcDwSerialModel
        {
          serial = rdr["Serial"].ToString(),
          series = rdr["Series"].ToString(),
          modelName = rdr["ModelName"].ToString(),
          testtype = rdr["TestType"].ToString(),
          testDate_txt = Convert.ToDateTime(rdr["TestDate"]).ToString("dd-MMM-yyyy"),
          isFail = Convert.ToBoolean(rdr["IsFail"]),
          fileCount = Convert.ToInt32(rdr["FileCount"]),
          firstTestTime = rdr["FirstTestTime"].ToString(),
          lastTestTime = rdr["LastTestTime"].ToString()
        });
      }
      conn.Close();
    }
    return Json(result);
  }

  // -----------------------------------------------------------------------
  // GET /UttcDw/GetFileList?series=&serial=&testtype=&testdate=
  // SP: usp_GetUttcDwFileList
  // -----------------------------------------------------------------------
  [HttpGet]
  public JsonResult GetFileList(string series, string serial, string testtype, string testdate)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    var result = new List<UttcDwFileModel>();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("usp_GetUttcDwFileList", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", series);
      cmd.Parameters.AddWithValue("@serial", serial);
      cmd.Parameters.AddWithValue("@testtype", testtype);
      cmd.Parameters.AddWithValue("@testdate", Convert.ToDateTime(testdate));

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new UttcDwFileModel
        {
          fileName = rdr["FileName"].ToString(),
          displayPath = rdr["DisplayPath"].ToString(),
          hasFullPath = Convert.ToBoolean(rdr["HasFullPath"]),
          testTime = rdr["TestTime"].ToString(),
          isFail = Convert.ToBoolean(rdr["IsFail"])
        });
      }
      conn.Close();
    }
    return Json(result);
  }
}
