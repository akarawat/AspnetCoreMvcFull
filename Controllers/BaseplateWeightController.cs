using AspnetCoreMvcFull.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace AspnetCoreMvcFull.Controllers;

public class BaseplateWeightController : Controller
{
  private readonly ILogger<BaseplateWeightController> _logger;
  private readonly IConfiguration _configuration;

  public BaseplateWeightController(
    ILogger<BaseplateWeightController> logger,
    IConfiguration configuration)
  {
    _logger       = logger;
    _configuration = configuration;
  }

  // -----------------------------------------------------------------------
  // GET /BaseplateWeight?series=7&fullscreen=true
  // -----------------------------------------------------------------------
  public IActionResult Index(string? series, string? fullscreen)
  {
    // Validate series — default '7'
    string[] validSeries = { "3", "4", "5", "7", "9" };
    string activeSeries  = validSeries.Contains(series) ? series : "7";
    ViewData["ActiveSeries"] = activeSeries;

    // Fullscreen layout
    bool isFullscreen        = fullscreen?.ToLower() == "true";
    ViewData["isFullscreen"] = isFullscreen;
    ViewData["isMenu"]       = !isFullscreen;
    ViewData["isNavbar"]     = !isFullscreen;
    ViewData["menuFixed"]    = isFullscreen ? "" : "menu-fixed";
    ViewData["navbarType"]   = isFullscreen ? "layout-navbar-hidden" : "layout-navbar-fixed";

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
    var result     = new List<BaseplateWeightModel>();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd   = new SqlCommand("SP_GetBaseplateWeight", conn);
      cmd.CommandType  = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series",    SqlDbType.VarChar).Value
        = series    ?? (object)DBNull.Value;
      cmd.Parameters.AddWithValue("@flagrange", SqlDbType.VarChar).Value
        = flagrange ?? (object)DBNull.Value;

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        // Combine LogDate + LogTime → DateTime
        DateTime logDate  = Convert.ToDateTime(rdr["LogDate"]);
        TimeSpan logTime  = TimeSpan.Parse(rdr["LogTime"].ToString());
        DateTime logDT    = logDate.Date + logTime;

        // Unix timestamp (ms) for ApexCharts datetime axis
        long ts = new DateTimeOffset(logDT).ToUnixTimeMilliseconds();

        result.Add(new BaseplateWeightModel
        {
          id              = Convert.ToInt32(rdr["ID"]),
          logDate_txt     = logDate.ToString("dd-MM-yyyy"),
          logTime_txt     = rdr["LogTime"].ToString(),
          logDateTime_txt = logDT.ToString("dd-MM-yyyy HH:mm"),
          logDateTime_ts  = ts,
          seriesNo        = rdr["SeriesNo"]?.ToString(),
          userCode        = rdr["UserCode"]?.ToString(),
          calMP1          = rdr["CalMP1"]     == DBNull.Value ? 0 : Convert.ToDecimal(rdr["CalMP1"]),
          calMP4          = rdr["CalMP4"]     == DBNull.Value ? 0 : Convert.ToDecimal(rdr["CalMP4"]),
          mp1             = rdr["MP1"]        == DBNull.Value ? 0 : Convert.ToDecimal(rdr["MP1"]),
          mp4             = rdr["MP4"]        == DBNull.Value ? 0 : Convert.ToDecimal(rdr["MP4"]),
          diffMP1to4      = rdr["DiffMP1to4"] == DBNull.Value ? 0 : Convert.ToDecimal(rdr["DiffMP1to4"]),
          sourceFile      = rdr["SourceFile"]?.ToString()
        });
      }
      conn.Close();
    }
    return Json(result);
  }
}
