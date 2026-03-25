using AspnetCoreMvcFull.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Diagnostics;
using System.Reflection.Metadata.Ecma335;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AspnetCoreMvcFull.Controllers;

public class BalanceAdjustController : Controller
{
  private readonly ILogger<BalanceAdjustController> _logger;
  private readonly IConfiguration _configuration;
  public BalanceAdjustController(ILogger<BalanceAdjustController> logger, IConfiguration configuration)
  {
    _logger = logger;
    _configuration = configuration;
  }
  public IActionResult Index(string fullscreen)
  {
    //HttpContext.Session.SetString(SessionModel.SAMNAME, "Bernina Temporary User");
    string isSetModel = Request.Query["series"].ToString(); // series
    HttpContext.Session.SetString("SETMODEL", isSetModel);
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
  [HttpGet]
  public IActionResult GetDataBak()
  {
    var data = new List<KPIItem>
        {
            new KPIItem { Title = "Cutting Current", Value = 15.4, Average = 15.4, StdDev = 2.3, Status = "OK", Direction = "up" },
            new KPIItem { Title = "Power Consumption", Value = -4.9, Average = 0.7, StdDev = 0.7, Status = "PROBLEM", Direction = "right" },
            new KPIItem { Title = "Balance Adjustm", Value = 2.8, Average = 2.8, StdDev = 0.3, Status = "WARNING", Direction = "up" },
            new KPIItem { Title = "Operating Speed", Value = 104.7, Average = 7.6, StdDev = 7.6, Status = "OK", Direction = "up" },
            new KPIItem { Title = "Flow Rate", Value = 18.1, Average = 18.1, StdDev = 2.9, Status = "PROBLEM", Direction = "down" },
            new KPIItem { Title = "Cycle Time", Value = 38.6, Average = 4.2, StdDev = 4.2, Status = "OK", Direction = "up" },
            new KPIItem { Title = "Statistics Error", Value = 2.1, Average = 0.5, StdDev = 0.5, Status = "WARNING", Direction = "down" },
            new KPIItem { Title = "Force Index", Value = 58.3, Average = 5.0, StdDev = 5.0, Status = "OK", Direction = "up" },
        };

    return Json(data);
  }
  [HttpGet]
  public IActionResult GetDataBak3()
  {
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();

    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    List<KPIItem> result = new List<KPIItem>();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();

      SqlCommand cmd = new SqlCommand("SP_Foot3A_GetData", conn);
      cmd.CommandType = CommandType.StoredProcedure;

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new KPIItem
        {
          Title = rdr["Title"].ToString(),
          Value = Convert.ToDouble(rdr["Value"]),
          Average = Convert.ToDouble(rdr["Average"]),
          StdDev = Convert.ToDouble(rdr["StdDev"]),
          Status = rdr["Status"].ToString(),
          Direction = rdr["Direction"].ToString()
        });
      }

      conn.Close();
    }

    return Json(result);
  }
  [HttpGet]
  public JsonResult GetBalanceAdjustOutput(string serial)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string SqlconString = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    string[] result = new string[6];
    try
    {
      SqlConnection sqlCon = null;
      using (sqlCon = new SqlConnection(SqlconString))
      {
        sqlCon.Open();

        SqlCommand cmd = new SqlCommand("SP_GetBalanceAdjustOutput", sqlCon);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@serial", SqlDbType.VarChar).Value = serial;

        cmd.Parameters.AddWithValue("@fromDate", null);
        cmd.Parameters.AddWithValue("@toDate", null);

        cmd.Parameters.Add("@fromDateOut", SqlDbType.DateTime);
        cmd.Parameters["@fromDateOut"].Direction = ParameterDirection.Output;
        cmd.Parameters.Add("@toDateOut", SqlDbType.DateTime);
        cmd.Parameters["@toDateOut"].Direction = ParameterDirection.Output;

        cmd.Parameters.Add("@totalTest", SqlDbType.Int);
        cmd.Parameters["@totalTest"].Direction = ParameterDirection.Output;

        cmd.ExecuteNonQuery();
        DateTime _dtFrom = Convert.ToDateTime(cmd.Parameters["@fromDateOut"].Value == DBNull.Value ? null : cmd.Parameters["@fromDateOut"].Value);
        DateTime _dtTo = Convert.ToDateTime(cmd.Parameters["@toDateOut"].Value == DBNull.Value ? null : cmd.Parameters["@toDateOut"].Value);
        result[0] = _dtFrom == null ? "" : _dtFrom.ToString("yyyy-MM-dd");
        result[1] = _dtTo == null ? "" : _dtTo.ToString("yyyy-MM-dd");
        result[2] = cmd.Parameters["@totalTest"].Value.ToString();

        sqlCon.Close();
      }
    }
    catch (Exception ex)
    {
    }

    return Json(result);
  }
  [HttpGet]
  public JsonResult GetDataTTAAll(string? series, DateTime? dtstart, DateTime? dtend, string? flagrange)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();

    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    List<BalanceAdjustModelDataModel> result = new List<BalanceAdjustModelDataModel>();


    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetBalanceAdjust", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = series;
      cmd.Parameters.AddWithValue("@dtstart", SqlDbType.DateTime).Value = dtstart;
      cmd.Parameters.AddWithValue("@dtend", SqlDbType.DateTime).Value = dtend;
      cmd.Parameters.AddWithValue("@flagrange", SqlDbType.VarChar).Value = flagrange == "undefined" ? DBNull.Value : flagrange;
      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new BalanceAdjustModelDataModel
        {
          id = Convert.ToInt32(rdr["id"]),
          serial = rdr["serial"]?.ToString(),
          productionDate = Convert.ToDateTime(rdr["productionDate"]),
          productionDate_txt = rdr["productionDate_txt"]?.ToString(),
          series = rdr["series"]?.ToString(),
          modelname = rdr["modelname"]?.ToString(),
          balance = Convert.ToInt32(rdr["balance"])
        });
      }

      conn.Close();
    }

    return Json(result);
  }
  [HttpGet]
  public JsonResult GetBalanceDailySummary(
        string? series,
        DateTime? dtstart,
        DateTime? dtend,
        string? flagrange)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();

    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    List<BalanceAdjustBubbleModelDataModel> result = new();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      using (SqlCommand cmd = new SqlCommand("SP_GetBalanceDailySummary", conn))
      {
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.Add("@series", SqlDbType.VarChar).Value = (object?)series ?? DBNull.Value;
        cmd.Parameters.Add("@dtstart", SqlDbType.Date).Value = (object?)dtstart ?? DBNull.Value;
        cmd.Parameters.Add("@dtend", SqlDbType.Date).Value = (object?)dtend ?? DBNull.Value;
        cmd.Parameters.AddWithValue("@flagrange", SqlDbType.VarChar).Value = flagrange == "undefined" ? DBNull.Value : flagrange;

        using (SqlDataReader rdr = cmd.ExecuteReader())
        {
          while (rdr.Read())
          {
            result.Add(new BalanceAdjustBubbleModelDataModel
            {
              productionDate = Convert.ToDateTime(rdr["productionDate"]),
              productionDate_txt = Convert.ToDateTime(rdr["productionDate"])
                                        .ToString("dd-MM-yyyy"),
              series = rdr["series"].ToString(),
              balance = Convert.ToInt32(rdr["balance"]),
              balance_total = Convert.ToInt32(rdr["balance_total"])
            });
          }
        }
      }
    }

    return Json(result);
  }
  [HttpGet]
  public JsonResult GetDataTTAAllExcel(string? series, DateTime? dtstart, DateTime? dtend, string? flagrange, string? excel_flag)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();

    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    List<BalanceAdjustModelDataModel> result = new List<BalanceAdjustModelDataModel>();


    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetBalanceAdjust", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = series;
      cmd.Parameters.AddWithValue("@dtstart", SqlDbType.DateTime).Value = dtstart;
      cmd.Parameters.AddWithValue("@dtend", SqlDbType.DateTime).Value = dtend;
      cmd.Parameters.AddWithValue("@flagrange", SqlDbType.VarChar).Value = flagrange == "undefined" ? DBNull.Value : flagrange;
      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new BalanceAdjustModelDataModel
        {
          id = Convert.ToInt32(rdr["id"]),
          serial = rdr["serial"]?.ToString(),
          productionDate = Convert.ToDateTime(rdr["productionDate"]),
          productionDate_txt = rdr["productionDate_txt"]?.ToString(),
          series = rdr["series"]?.ToString(),
          modelname = rdr["modelname"]?.ToString(),
          balance = Convert.ToInt32(rdr["balance"])
        });
      }

      conn.Close();
    }
    return Json(result);
  }
  [HttpGet]
  public JsonResult GetData(string serial)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string SqlconString = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    string[] result = new string[6];
    int itotalTest = 0;
    int itotalCloseCut = 0;
    int itotalMaxCut = 0;
    int itotalNormalCut = 0;
    try
    {
      SqlConnection sqlCon = null;
      using (sqlCon = new SqlConnection(SqlconString))
      {
        sqlCon.Open();

        SqlCommand cmd = new SqlCommand("SP_GetThreadCuttDashboardOutput", sqlCon);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@serial", SqlDbType.VarChar).Value = serial;

        cmd.Parameters.AddWithValue("@fromDate", null);
        cmd.Parameters.AddWithValue("@toDate", null);

        cmd.Parameters.Add("@fromDateOut", SqlDbType.DateTime);
        cmd.Parameters["@fromDateOut"].Direction = ParameterDirection.Output;
        cmd.Parameters.Add("@toDateOut", SqlDbType.DateTime);
        cmd.Parameters["@toDateOut"].Direction = ParameterDirection.Output;

        cmd.Parameters.Add("@totalTest", SqlDbType.Int);
        cmd.Parameters["@totalTest"].Direction = ParameterDirection.Output;

        cmd.Parameters.Add("@totalCloseCut", SqlDbType.Int);
        cmd.Parameters["@totalCloseCut"].Direction = ParameterDirection.Output;

        cmd.Parameters.Add("@totalMaxCut", SqlDbType.Int);
        cmd.Parameters["@totalMaxCut"].Direction = ParameterDirection.Output;

        cmd.Parameters.Add("@totalNormalCut", SqlDbType.Int);
        cmd.Parameters["@totalNormalCut"].Direction = ParameterDirection.Output;

        cmd.ExecuteNonQuery();
        DateTime _dtFrom = Convert.ToDateTime(cmd.Parameters["@fromDateOut"].Value == DBNull.Value ? null : cmd.Parameters["@fromDateOut"].Value);
        DateTime _dtTo = Convert.ToDateTime(cmd.Parameters["@toDateOut"].Value == DBNull.Value ? null : cmd.Parameters["@toDateOut"].Value);
        result[0] = _dtFrom == null ? "" : _dtFrom.ToString("yyyy-MM-dd");
        result[1] = _dtTo == null ? "" : _dtTo.ToString("yyyy-MM-dd");
        result[2] = cmd.Parameters["@totalTest"].Value.ToString();
        result[3] = cmd.Parameters["@totalCloseCut"].Value.ToString();
        result[4] = cmd.Parameters["@totalMaxCut"].Value.ToString();
        result[5] = cmd.Parameters["@totalNormalCut"].Value.ToString();

        sqlCon.Close();
      }
    }
    catch (Exception ex)
    {
    }

    return Json(result);
  }

  [HttpGet]
  public IActionResult GetData2Bak()
  {
    var data = new List<KPIItem2>
    {
        new KPIItem2 { title = "Output Flow", currentValue = 47, lastDay = 47, last2Weeks = 49, last6Months = 48, status = "down" },
        new KPIItem2 { title = "Pressure Difference", currentValue = 1.80, lastDay = 1.78, last2Weeks = 1.80, last6Months = 1.80, status = "up" },
        new KPIItem2 { title = "Torque Deviation", currentValue = 9.7, lastDay = 10.1, last2Weeks = 9.9, last6Months = 9.9, status = "down" },
        new KPIItem2 { title = "Cycle Time", currentValue = 42.8, lastDay = 42.4, last2Weeks = 42.4, last6Months = 42.4, status = "up" },
    };

    // เพิ่ม icon และสีตาม status
    foreach (var item in data)
    {
      item.statusIcon = item.status == "up" ? "⬆️" : "⬇️";
      item.statusColor = item.status == "up" ? "success" : "danger";
    }

    return Json(data);
  }
  [HttpGet]
  public IActionResult GetData2()
  {
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();

    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    List<KPIItem2> result = new List<KPIItem2>();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();

      SqlCommand cmd = new SqlCommand("SP_Foot3A2_GetData", conn);
      cmd.CommandType = CommandType.StoredProcedure;

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new KPIItem2
        {
          title = rdr["title"].ToString(),
          currentValue = Convert.ToDouble(rdr["currentValue"]),
          lastDay = Convert.ToDouble(rdr["lastDay"]),
          last2Weeks = Convert.ToDouble(rdr["last2Weeks"]),
          last6Months = Convert.ToDouble(rdr["last6Months"]),
          status = rdr["status"].ToString(),
          statusIcon = rdr["status"].ToString() == "up" ? "⬆️" : "⬇️",
          statusColor = rdr["status"].ToString() == "up" ? "success" : "danger"
        });
      }

      conn.Close();
    }

    return Json(result);
  }
  [HttpGet]
  public JsonResult GetKPIParamsByKey(string param_code)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string SqlconString = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    string[] result = new string[10];
    int itotalTest = 0;
    int itotalCloseCut = 0;
    int itotalMaxCut = 0;
    int itotalNormalCut = 0;
    try
    {
      SqlConnection sqlCon = null;
      using (sqlCon = new SqlConnection(SqlconString))
      {
        sqlCon.Open();

        SqlCommand cmd = new SqlCommand("SP_KPIParamsByKey", sqlCon);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@param_code", SqlDbType.VarChar).Value = param_code;
        cmd.Parameters.Add("@param_func", SqlDbType.VarChar, 50); cmd.Parameters["@param_func"].Direction = ParameterDirection.Output;
        cmd.Parameters.Add("@mc_model", SqlDbType.VarChar, 25); cmd.Parameters["@mc_model"].Direction = ParameterDirection.Output;
        cmd.Parameters.Add("@param_1", SqlDbType.VarChar, 50); cmd.Parameters["@param_1"].Direction = ParameterDirection.Output;
        cmd.Parameters.Add("@param_2", SqlDbType.VarChar, 50); cmd.Parameters["@param_2"].Direction = ParameterDirection.Output;
        cmd.Parameters.Add("@param_3", SqlDbType.VarChar, 50); cmd.Parameters["@param_3"].Direction = ParameterDirection.Output;
        cmd.Parameters.Add("@param_4", SqlDbType.VarChar, 50); cmd.Parameters["@param_4"].Direction = ParameterDirection.Output;
        cmd.Parameters.Add("@param_5", SqlDbType.VarChar, 50); cmd.Parameters["@param_5"].Direction = ParameterDirection.Output;
        cmd.Parameters.Add("@param_6", SqlDbType.VarChar, 50); cmd.Parameters["@param_6"].Direction = ParameterDirection.Output;
        cmd.Parameters.Add("@param_7", SqlDbType.VarChar, 50); cmd.Parameters["@param_7"].Direction = ParameterDirection.Output;
        cmd.Parameters.Add("@remarks", SqlDbType.VarChar, 512); cmd.Parameters["@remarks"].Direction = ParameterDirection.Output;
        cmd.ExecuteNonQuery();
        result[0] = cmd.Parameters["@param_func"].Value.ToString();
        result[1] = cmd.Parameters["@mc_model"].Value.ToString();
        result[2] = cmd.Parameters["@param_1"].Value.ToString();
        result[3] = cmd.Parameters["@param_2"].Value.ToString();
        result[4] = cmd.Parameters["@param_3"].Value.ToString();
        result[5] = cmd.Parameters["@param_4"].Value.ToString();
        result[6] = cmd.Parameters["@param_5"].Value.ToString();
        result[7] = cmd.Parameters["@param_6"].Value.ToString();
        result[8] = cmd.Parameters["@param_7"].Value.ToString();
        result[9] = cmd.Parameters["@remarks"].Value.ToString();

        sqlCon.Close();
      }
    }
    catch (Exception ex)
    {
    }
    return Json(result);
  }
  [HttpGet]
  public async Task<IActionResult> GetExcelExportTTAData(string mas_wo, string mas_item)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json")
                    .Build();
    string DBConn = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    var results = new List<dynamic>();
    string itemname = "";
    using (var conn = new SqlConnection(DBConn))
    {
      await conn.OpenAsync();
      using (var command = new SqlCommand("SP_ExcelExpTimeSheet", conn))
      {
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.AddWithValue("@mas_wo", mas_wo);
        command.Parameters.AddWithValue("@mas_itemno", mas_item);

        command.Parameters.Add("@itemname", SqlDbType.VarChar, 255);
        command.Parameters["@itemname"].Direction = ParameterDirection.Output;

        using (var reader = await command.ExecuteReaderAsync())
        {
          while (await reader.ReadAsync())
          {
            results.Add(new
            {
              mas_wo = reader["mas_wo"]?.ToString(),
              mas_itemno = reader["mas_itemno"]?.ToString(),
              mas_opr = reader["mas_opr"]?.ToString(),
              mas_qty = reader["mas_qty"] != DBNull.Value ? Convert.ToInt32(reader["mas_qty"]) : 0,

              mas_stdtime = reader["mas_stdtime"] != DBNull.Value ? Convert.ToDecimal(reader["mas_stdtime"]) : 0.0m,
              mas_resource = reader["mas_resource"]?.ToString(),
              mas_mc = reader["mas_mc"] != DBNull.Value ? Convert.ToDecimal(reader["mas_mc"]) : 0.0m,
              mas_lab = reader["mas_lab"] != DBNull.Value ? Convert.ToDecimal(reader["mas_lab"]) : 0.0m,
              emp_code = reader["emp_code"]?.ToString(),
              rec_date = Convert.ToDateTime(reader["rec_date"]).ToString("dd-MM-yyyy"),
              rec_setup = reader["mas_stdtime"] != DBNull.Value ? Convert.ToDecimal(reader["mas_stdtime"]) : 0.0m,
              rec_mc = reader["rec_mc"] != DBNull.Value ? Convert.ToDecimal(reader["rec_mc"]) : 0.0m,
              rec_lab = reader["rec_lab"] != DBNull.Value ? Convert.ToDecimal(reader["rec_lab"]) : 0.0m,
              rec_aqty = reader["rec_aqty"] != DBNull.Value ? Convert.ToInt32(reader["rec_aqty"]) : 0,
              rec_atotal = reader["rec_atotal"] != DBNull.Value ? Convert.ToInt32(reader["rec_atotal"]) : 0,
              prd_setup = reader["prd_setup"] != DBNull.Value ? Convert.ToDecimal(reader["prd_setup"]) : 0.0m,
              prd_tools = reader["prd_tools"] != DBNull.Value ? Convert.ToDecimal(reader["prd_tools"]) : 0.0m,
              prd_surf = reader["prd_surf"] != DBNull.Value ? Convert.ToDecimal(reader["prd_surf"]) : 0.0m,
              prd_dimout = reader["prd_dimout"] != DBNull.Value ? Convert.ToDecimal(reader["prd_dimout"]) : 0.0m,
              prd_other = reader["prd_other"] != DBNull.Value ? Convert.ToDecimal(reader["prd_other"]) : 0.0m,
              scrap_remark = reader["scrap_remark"]?.ToString(),
              ven_hardness = reader["ven_hardness"] != DBNull.Value ? Convert.ToDecimal(reader["ven_hardness"]) : 0.0m,
              ven_dimout = reader["ven_dimout"] != DBNull.Value ? Convert.ToDecimal(reader["ven_dimout"]) : 0.0m,
              ven_surf = reader["ven_surf"] != DBNull.Value ? Convert.ToDecimal(reader["ven_surf"]) : 0.0m,
              ven_other = reader["ven_other"] != DBNull.Value ? Convert.ToDecimal(reader["ven_other"]) : 0.0m,
              vendor_remark = reader["vendor_remark"]?.ToString(),
              other_remark = reader["other_remark"]?.ToString(),

              rec_eff = reader["rec_eff"] != DBNull.Value ? Convert.ToDecimal(reader["rec_eff"]) : 0.0m,
              create_dt = Convert.ToDateTime(reader["create_dt"]).ToString("dd-MM-yyyy")

            });
          }
        }
        itemname = command.Parameters["@itemname"].Value == DBNull.Value ? "" : command.Parameters["@itemname"].Value.ToString();
      }
      conn.CloseAsync();
    }
    return Ok(new { item_name = itemname, data = results });
  }
  // End Class
}


