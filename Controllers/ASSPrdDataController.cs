using AspnetCoreMvcFull.Models;
using Azure;
using ExcelDataReader;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.SqlServer.Server;
using System.Data;
using System.Diagnostics;
using System.Diagnostics.Metrics;
using System.Globalization;
using System.Text.Json;

namespace AspnetCoreMvcFull.Controllers;

public class ASSPrdDataController : Controller
{
  //public IActionResult UderMaintenance() => View();
  public IActionResult UderMaintenance()
  {
   return View();
  }
  public IActionResult SockleMainDrv()
  {
    return View();
  }
  public IActionResult B4Mod()
  {
    return View();
  }
  public IActionResult B5Mod()
  {
    return View();
  }
  public IActionResult B7Mod()
  {
    return View();
  }
  public IActionResult B9Mod()
  {
    return View();
  }
  [HttpPost]
  public IActionResult GetSocleMainDrive(RequestParamModel ojb)
  {
      IConfiguration _configuration = new ConfigurationBuilder()
                          .SetBasePath(Directory.GetCurrentDirectory())
                          .AddJsonFile("appsettings.json")
                          .Build();
      string DBConn = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
      //List<string> ddlValues = new List<string>();
      //List<CurrentData> data = new List<CurrentData>();

      //var dataList = new List<Dictionary<string, object>>();
      //var dataObjList = new List<object>();

      //List<DataItem> res = new List<DataItem>();
      DateTime date = DateTime.Now;
      var result = new List<object>();
      try
      {
          using (SqlConnection conn = new SqlConnection(DBConn))
          {
              //--
              SqlCommand sql_cmnd = new SqlCommand("SP_LNKGetSocleMainDriveSnGroup", conn);
              //--SqlCommand sql_cmnd = new SqlCommand("SP_GetThreadCutcur", conn);
              sql_cmnd.CommandType = CommandType.StoredProcedure;
              sql_cmnd.Parameters.AddWithValue("@dtstart", SqlDbType.NVarChar).Value = ojb.txtStDate == null ? DBNull.Value : ojb.txtStDate;
              sql_cmnd.Parameters.AddWithValue("@dtend", SqlDbType.NVarChar).Value = ojb.txtEnDate == null ? DBNull.Value : ojb.txtEnDate;
              conn.Open();

              using (SqlDataReader reader = sql_cmnd.ExecuteReader())
              {
                  while (reader.Read())
                  {
                      var row = new Dictionary<string, object>();
                      row["serial"] = reader["serial"].ToString();
                      row["startDate"] = Convert.ToDateTime(reader["startDate"]);
                      row["Current_0_100"] = Convert.ToDouble(reader["Current_0_100"]);
                      row["Current_0_900"] = Convert.ToDouble(reader["Current_0_900"]);
                      row["Current_0_1200"] = Convert.ToDouble(reader["Current_0_1200"]);
                      row["Current_1_100"] = Convert.ToDouble(reader["Current_1_100"]);
                      row["Current_1_900"] = Convert.ToDouble(reader["Current_1_900"]);
                      row["Current_1_1200"] = Convert.ToDouble(reader["Current_1_1200"]);

          //List<DataItem> innerList = new List<DataItem>();
          //int innerIndex = 0;

          //Console.WriteLine($"Group {outerIndex + 1}:");

          //while (innerIndex < innerList.Count)
          //{
          //    DataItem item = innerList[innerIndex];
          //    Console.WriteLine($"SN: {item.snlabel}, Method: {item.method}, Value: {item.value}");
          //    innerIndex++;
          //}

          //res.Add(new DataItem()
          //{
          //  snlabel = reader["serial"].ToString(),
          //  method = "0RPM100",
          //  value = (double)reader["Current_0_100"]
          //});
          //res.Add(new DataItem()
          //{
          //  snlabel = reader["serial"].ToString(),
          //  method = "0RPM900",
          //  value = (double)reader["Current_0_900"]
          //});
                      DateTime dtSt = Convert.ToDateTime(reader["startDate"]);
                      string dtTxt = dtSt.ToString("dd/MM/yyyy");
                      result.Add(
                        new List<object>
                                      {
                                          new { stDate = dtTxt, snlabel = reader["serial"].ToString(), method = "0RPM100", value = reader["Current_0_100"] },
                                          new { stDate = dtTxt, snlabel = reader["serial"].ToString(), method = "0RPM900", value = reader["Current_0_900"] },
                                          new { stDate = dtTxt, snlabel = reader["serial"].ToString(), method = "0RPM1200", value = reader["Current_0_1200"] },
                                          new { stDate = dtTxt, snlabel = reader["serial"].ToString(), method = "1RPM100", value = reader["Current_1_100"] },
                                          new { stDate = dtTxt, snlabel = reader["serial"].ToString(), method = "1RPM900", value = reader["Current_1_900"] },
                                          new { stDate = dtTxt, snlabel = reader["serial"].ToString(), method = "1RPM1200", value = reader["Current_1_1200"] }
                                      }
                      );

                      //result.Add(List<List<object>>
                      //{
                      //    new List<object>
                      //    {
                      //        new { snlabel = reader["serial"].ToString(), method = "0RPM100", value = reader["Current_0_100"] },
                      //        new { snlabel = reader["serial"].ToString(), method = "0RPM900", value = reader["Current_0_900"] },
                      //        new { snlabel = reader["serial"].ToString(), method = "0RPM1200", value = reader["Current_0_1200"] },
                      //        new { snlabel = reader["serial"].ToString(), method = "1RPM100", value = reader["Current_1_100"] },
                      //        new { snlabel = reader["serial"].ToString(), method = "1RPM900", value = reader["Current_1_900"] },
                      //        new { snlabel = reader["serial"].ToString(), method = "1RPM1200", value = reader["Current_1_1200"] }
                      //    }
                      //    // เพิ่มรายการอื่น ๆ ตามตัวอย่างของคุณได้เลย
                      //});
                  }
              }
              conn.Close();
          }
          // สร้างข้อมูล JSON ตามที่ต้องการส่งกลับ
      }
      catch (Exception ex)
      {
          return null;
      }

    return Json(result);
  }
    
   //[HttpPost]
   // public IActionResult GetSocleMainDrive_succ()
   // {
   //     // สร้างข้อมูล JSON ตามที่ต้องการส่งกลับ
   //     var result = new List<List<object>>
   //     {
   //         new List<object>
   //         {
   //             new { snlabel = "990 61797183x", method = "0RPM100", value = 1.8 },
   //             new { snlabel = "990 61797183x", method = "0RPM900", value = 1.7 },
   //             new { snlabel = "990 61797183x", method = "0RPM1200", value = 1.27 },
   //             new { snlabel = "990 61797183x", method = "1RPM100", value = 1.52 },
   //             new { snlabel = "990 61797183x", method = "1RPM900", value = 2.45 },
   //             new { snlabel = "990 61797183x", method = "1RPM1200", value = 2.46 }
   //         },
   //         new List<object>
   //         {
   //             new { snlabel = "990 61797182", method = "0RPM100", value = 2.04 },
   //             new { snlabel = "990 61797182", method = "0RPM900", value = 1.91 },
   //             new { snlabel = "990 61797182", method = "0RPM1200", value = 1.41 },
   //             new { snlabel = "990 61797182", method = "1RPM100", value = 1.69 },
   //             new { snlabel = "990 61797182", method = "1RPM900", value = 2.53 },
   //             new { snlabel = "990 61797182", method = "1RPM1200", value = 2.79 }
   //         }
   //         // เพิ่มรายการอื่น ๆ ตามตัวอย่างของคุณได้เลย
   //     };

   //     return Json(result);
   // }
  public async void GetMessage()
  {
    string[] strMsg = new string[3];
          IConfiguration _configuration = new ConfigurationBuilder()
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json")
                            .Build();

    string DBConn = _configuration[key: "ConnectionStrings:BtCostReduct"];
    ViewData["URLPATH"] = _configuration[key: "TBCorApiServices:RootURL"];
    SqlConnection con = null;

    try
        {
            con = new SqlConnection(DBConn);
            con.Open();
            SqlCommand cmnd = new SqlCommand("SP_GetConfigMessage", con);
            cmnd.CommandType = CommandType.StoredProcedure;

            cmnd.Parameters.Add("@Approve", SqlDbType.VarChar, 150);
            cmnd.Parameters["@Approve"].Direction = ParameterDirection.Output;

            cmnd.Parameters.Add("@Pending", SqlDbType.VarChar, 150);
            cmnd.Parameters["@Pending"].Direction = ParameterDirection.Output;

            cmnd.Parameters.Add("@Closejob", SqlDbType.VarChar, 150);
            cmnd.Parameters["@Closejob"].Direction = ParameterDirection.Output;

            cmnd.Parameters.Add("@Canceljob", SqlDbType.VarChar, 150);
            cmnd.Parameters["@Canceljob"].Direction = ParameterDirection.Output;

            cmnd.Parameters.Add("@ordemail", SqlDbType.VarChar, 255);
            cmnd.Parameters["@ordemail"].Direction = ParameterDirection.Output;


            cmnd.ExecuteNonQuery();
            HttpContext.Session.SetString(SessionModel.MSGAPPROVE, cmnd.Parameters["@Approve"].Value.ToString());
            HttpContext.Session.SetString(SessionModel.MSGPEND, cmnd.Parameters["@Pending"].Value.ToString());
            HttpContext.Session.SetString(SessionModel.MSGCLOSE, cmnd.Parameters["@Closejob"].Value.ToString());
            HttpContext.Session.SetString(SessionModel.MSGCANCEL, cmnd.Parameters["@Canceljob"].Value.ToString());
            ViewData["USRSTOCKCONTRL"] = cmnd.Parameters["@ordemail"].Value.ToString().Trim();
                
        }
        catch (Exception ex)
        {
            strMsg[0] = "2";
            strMsg[1] = "error";
        }
        finally
        {
            strMsg[0] = "1";
            strMsg[1] = "success";
            con.Close();
        }
  }
  [HttpPost]
  public JsonResult UpdateQtyOrderDetail(OrderDetailModel obj)
  {
    string[] strMsg = new string[3];
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string DBConn = _configuration[key: "ConnectionStrings:BtCostReduct"];
    SqlConnection con = null;
    try
    {
        con = new SqlConnection(DBConn);
        con.Open();
        SqlCommand cmnd = new SqlCommand("SP_UpdateQtyOrderDetail", con);
        cmnd.CommandType = CommandType.StoredProcedure;
        cmnd.Parameters.AddWithValue("@ID", SqlDbType.VarChar).Value = obj.ID;
        cmnd.Parameters.AddWithValue("@Itemqty", SqlDbType.Int).Value = obj.Itemqty;
        cmnd.ExecuteNonQuery();                
    }
    catch (Exception ex)
    {
        strMsg[0] = "2";
        strMsg[1] = "error";
    }
    finally
    {
        strMsg[0] = "1";
        strMsg[1] = "success";
            
    }
    con.Close();
    return Json(strMsg);
  }

  [HttpGet]
  public async Task<List<PartsListModel>> GetThreadCutting()
  {
    //
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string DBConn = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    //List<string> ddlValues = new List<string>();
    List<PartsListModel> res = new List<PartsListModel>();
    try
    {
        using (SqlConnection conn = new SqlConnection(DBConn))
        {
            SqlCommand sql_cmnd = new SqlCommand("SP_GetItemPartsList", conn);
            sql_cmnd.CommandType = CommandType.StoredProcedure;
            //sql_cmnd.Parameters.AddWithValue("@SAMACC", SqlDbType.NVarChar).Value = "";
            conn.Open();
            using (SqlDataReader reader = sql_cmnd.ExecuteReader())
            {
                while (reader.Read())
                {
                    res.Add(new PartsListModel()
                    {
                      itemdoc = reader["itemdoc"].ToString(),
                      itemno = reader["itemno"].ToString()
                    });
                }
            }
            conn.Close();
        }
        return res;
    }
    catch (Exception ex)
    {
        return null;
    }
  }

  public IActionResult MaxCutThread() => View();
  private static List<dynamic> SampleData => new List<dynamic>
    {
        new {
            cutter = 5.5,
            normal = 2.8,
            maxCurrentCutter = 3.36,
            maxCurrentNormal = 3.53,
            serial = "475 61798205",
            startDate = "2024-08-01"
        },
        new {
            cutter = 5.5,
            normal = 2.8,
            maxCurrentCutter = 5.9,
            maxCurrentNormal = 3.1,
            serial = "475 61798206",
            startDate = "2024-08-05"
        },
        // เพิ่มข้อมูลอื่นได้ตามจริง
    };

  [HttpGet]
  public IActionResult GetMaxThreadData(string? from, string? to, string? serial)
  {

    /*
    var data = new[]
        {
            new {
                cutter = 5.5,
                normal = 2.8,
                maxCurrentCutter = 3.36,
                maxCurrentNormal = 3.53,
                serial = "475 61798205",
                startDate = "2024-08-01"
            },
            new {
                cutter = 5.5,
                normal = 2.8,
                maxCurrentCutter = 3.67,
                maxCurrentNormal = 2.36,
                serial = "475 61798206",
                startDate = "2024-08-01"
            }
            // ... เพิ่มข้อมูลอีกได้
        };
    */
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string DBConn = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    //List<string> ddlValues = new List<string>();
    List<MaxCutDataModel> res = new List<MaxCutDataModel>();
    try
    {
      using (SqlConnection conn = new SqlConnection(DBConn))
      {
        SqlCommand sql_cmnd = new SqlCommand("SP_LNKGetMaxThreadCut", conn);
        sql_cmnd.CommandType = CommandType.StoredProcedure;
        sql_cmnd.Parameters.AddWithValue("@dtstart", SqlDbType.DateTime).Value = "2025-01-01";
        sql_cmnd.Parameters.AddWithValue("@dtend", SqlDbType.DateTime).Value = "2025-01-01";
        conn.Open();
        using (SqlDataReader reader = sql_cmnd.ExecuteReader())
        {
          while (reader.Read())
          {
            res.Add(new MaxCutDataModel()
            {
              //itemdoc = reader["itemdoc"].ToString(),
              //itemno = reader["itemno"].ToString()
              cutter = (Decimal)reader["cutter"],
              normal = (Decimal)reader["normal"],
              maxCurrentCutter = (Decimal)reader["maxCurrentCutter"],
              maxCurrentNormal = (Decimal)reader["maxCurrentNormal"],
              serial = reader["serial"].ToString(),
              startDate = reader["startDate"].ToString()

            });
          }
        }
        conn.Close();
      }
    }
    catch (Exception ex)
    {
      return null;
    }

    return Ok(res);
  
  }

  [HttpGet]
  public IActionResult GetMaxThreadSerials()
  {
    var serials = SampleData.Select(d => d.serial).Distinct().ToList();
    return Ok(serials);
  }
  public IActionResult MaxThread()
  {
    string isSetModel = Request.Query["series"].ToString(); // series
    HttpContext.Session.SetString("SETMODEL", isSetModel);
    var isFullscreen = Request.Query["fullscreen"]; // หรือ TempData
    ViewData["isFullscreen"] = isFullscreen.ToString().ToLower();
    ViewData["series"] = Request.Query["series"];
    return View();
  }
  [HttpGet]
  public IActionResult GetThreadCutDashboard(string serial = "", string series = "", DateTime? fromDate = null, DateTime? toDate = null,string? flagrange = null)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string DBConn = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];

    List<ThreadCutterModel> result = new List<ThreadCutterModel>();

    using (SqlConnection con = new SqlConnection(DBConn))
    using (SqlCommand cmd = new SqlCommand("SP_GetThreadCuttDashboard", con))
    {
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@serial", SqlDbType.VarChar).Value = serial;
      DateTime? _st = fromDate == null ? null : (DateTime)fromDate;
      DateTime? _en = toDate == null ? null : (DateTime)toDate;
      cmd.Parameters.AddWithValue("@fromDate", fromDate);
      cmd.Parameters.AddWithValue("@toDate", toDate);
      cmd.Parameters.AddWithValue("@flagrange", SqlDbType.VarChar).Value = flagrange == "undefined" ? DBNull.Value : flagrange;
      con.Open();
      SqlDataReader reader = cmd.ExecuteReader();


      while (reader.Read())
      {
        var item = new ThreadCutterModel
        {
          productionDate = Convert.ToDateTime(reader["productionDate"]),
          productionDate_txt = reader["productionDate_txt"].ToString(),
          serial = reader["serial"].ToString(),
          maxCurrentCutter = Convert.ToDecimal(reader["maxCurrentCutter"]),
          maxCurrentNormal = Convert.ToDecimal(reader["maxCurrentNormal"]),
          ToleranceCutter = Convert.ToDecimal(reader["ToleranceCutter"]),
          ToleranceNormal = Convert.ToDecimal(reader["ToleranceNormal"]),
          CloseToCutter = Convert.ToDecimal(reader["CloseToCutter"])
        };
        result.Add(item);
        //if (!string.IsNullOrEmpty(serial) && !item.serial.Contains(serial)) continue;
        ////if (!string.IsNullOrEmpty(machine) && !item.serial.StartsWith(machine)) continue;
        //if (!string.IsNullOrEmpty(series) && !item.serial.Contains(series)) continue;
        //if (fromDate.HasValue && item.productionDate < fromDate.Value) continue;
        //if (toDate.HasValue && item.productionDate > toDate.Value) continue;

      }

    }

    return Json(result);
  }
  [HttpGet]
  public JsonResult GetThreadCuttDashboardOutput(string serial = "", string series = "", DateTime? fromDate = null, DateTime? toDate = null)
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
        DateTime? _st = fromDate == null ? null : (DateTime)fromDate;
        DateTime? _en = toDate == null ? null : (DateTime)toDate;
        cmd.Parameters.AddWithValue("@fromDate", fromDate);
        cmd.Parameters.AddWithValue("@toDate", toDate);

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
  public IActionResult GetThreadCutSummaryChart()
  {
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string DBConn = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    var result = new List<dynamic>();
    using (SqlConnection con = new SqlConnection(DBConn))
    {
      SqlCommand cmd = new SqlCommand("SP_GetThreadCutDailySummary", con);
      cmd.CommandType = CommandType.StoredProcedure;
      con.Open();

      using (SqlDataReader rdr = cmd.ExecuteReader())
      {
        while (rdr.Read())
        {
          result.Add(new
          {
            productionDate = Convert.ToDateTime(rdr["productionDate"]).ToString("yyyy-MM-dd"),
            fail_cutt = Convert.ToInt32(rdr["fail_cutt"]),
            fail_normal = Convert.ToInt32(rdr["fail_normal"]),
            total_test = Convert.ToInt32(rdr["total_test"]),
            efficiency = Convert.ToDecimal(rdr["efficiency"])
          });
        }
      }
    }

    return Json(result);
  }
  public IActionResult BoxPlot()
  {
    var isFullscreen = Request.Query["fullscreen"]; // หรือ TempData
    ViewData["isFullscreen"] = isFullscreen.ToString().ToLower();
    return View();
  }
  //[HttpGet]
  //public IActionResult GetBoxPlotData()
  //{
  //  var data = new
  //  {
  //    maxCurrentCutter = new[] { 6.16, 4.26, 7.42, 4.7, 5.45, 5, 4.31, 4.71, 7.02, 7.13 },
  //    maxCurrentNormal = new[] { 1.89, 1.61, 2.69, 1.7, 2.44, 2.19, 3.48, 2.83, 1.92, 2.14 },
  //    efficiency = new[] { 54.26, 52.13, 53.52, 58.46, 50.0, 50.0, 55.91, 54.17, 50.0, 51.25 }
  //  };
  //  return Json(data);
  //}

  [HttpGet]
  public IActionResult GetBoxPlotData_Bak()
  {
    var data = new
    {
      maxCurrentCutter = new[] { 6.16, 4.26, 7.42, 4.7, 5.45, 5, 4.31, 4.71, 7.02, 7.13 },
      maxCurrentNormal = new[] { 1.89, 1.61, 2.69, 1.7, 2.44, 2.19, 3.48, 2.83, 1.92, 2.14 },
      efficiency = new[] { 54.26, 52.13, 53.52, 58.46, 50.0, 50.0, 55.91, 54.17, 50.0, 51.25 }
    };

    var result = new
    {
      maxCurrentCutter = CalculateBoxPlot(data.maxCurrentCutter),
      maxCurrentNormal = CalculateBoxPlot(data.maxCurrentNormal),
      efficiency = CalculateBoxPlot(data.efficiency)
    };

    return Json(result);
  }
  [HttpGet]
  public IActionResult GetBoxPlotData()
  { //SP_GetBoxPlotData
    var data = new
    {
      maxCurrentCutter = new[] { 6.16, 4.26, 7.42, 4.7, 5.45, 5, 4.31, 4.71, 7.02, 7.13 },
      maxCurrentNormal = new[] { 1.89, 1.61, 2.69, 1.7, 2.44, 2.19, 3.48, 2.83, 1.92, 2.14 },
      efficiency = new[] { 54.26, 52.13, 53.52, 58.46, 50.0, 50.0, 55.91, 54.17, 50.0, 51.25 }
    };

    var result = new
    {
      maxCurrentCutter = CalculateBoxPlot(data.maxCurrentCutter),
      maxCurrentNormal = CalculateBoxPlot(data.maxCurrentNormal),
      efficiency = CalculateBoxPlot(data.efficiency)
    };

    return Json(result);
  }
  private object CalculateBoxPlot(double[] rawValues)
  {
    if (rawValues == null || rawValues.Length == 0) return null;

    var sorted = rawValues.OrderBy(v => v).ToList();
    double min = sorted.First();
    double max = sorted.Last();
    double q1 = GetPercentile(sorted, 25);
    double median = GetPercentile(sorted, 50);
    double q3 = GetPercentile(sorted, 75);

    return new
    {
      min = Math.Round(min, 2),
      q1 = Math.Round(q1, 2),
      median = Math.Round(median, 2),
      q3 = Math.Round(q3, 2),
      max = Math.Round(max, 2)
    };
  }

  private double GetPercentile(List<double> sorted, double percentile)
  {
    int N = sorted.Count;
    if (N == 0) return 0;

    double n = (N - 1) * percentile / 100.0 + 1;

    if (n == 1d) return sorted[0];
    else if (n == N) return sorted[N - 1];
    else
    {
      int k = (int)n;
      double d = n - k;
      return sorted[k - 1] + d * (sorted[k] - sorted[k - 1]);
    }
  }
  public List<BoxplotStat> GetBoxplotDataFromDb()
  {
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string DBConn = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    var boxplotStats = new List<BoxplotStat>();
    using (var conn = new SqlConnection(DBConn))
    {
      using (var cmd = new SqlCommand("SP_GetBoxPlotData", conn))
      {
        cmd.CommandType = CommandType.StoredProcedure;
        conn.Open();
        using (var reader = cmd.ExecuteReader())
        {
          while (reader.Read())
          {
            boxplotStats.Add(new BoxplotStat
            {
              metric = reader["metric"].ToString(),
              min = Convert.ToDouble(reader["min"]),
              q1 = Convert.ToDouble(reader["q1"]),
              median = Convert.ToDouble(reader["median"]),
              q3 = Convert.ToDouble(reader["q3"]),
              max = Convert.ToDouble(reader["max"])
            });
          }
        }
      }
    }
    return boxplotStats;
  }
  [HttpGet]
  public IActionResult GetMaxThreadBoxPlotData()
  {
    var data = GetBoxplotDataFromDb();
    return Json(data);
  }
  [HttpPut]
  public IActionResult UpdateCfgMaxMinThreadCut([FromBody] BoxplotStat updatedStat)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string DBConn = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    try
    {
      using (var conn = new SqlConnection(DBConn))
      {
        using (var cmd = new SqlCommand("SP_UpdateBoxPlotData", conn))
        {
          cmd.CommandType = CommandType.StoredProcedure;
          cmd.Parameters.AddWithValue("@metric", updatedStat.metric);
          cmd.Parameters.AddWithValue("@min", updatedStat.min);
          cmd.Parameters.AddWithValue("@q1", updatedStat.q1);
          cmd.Parameters.AddWithValue("@median", updatedStat.median);
          cmd.Parameters.AddWithValue("@q3", updatedStat.q3);
          cmd.Parameters.AddWithValue("@max", updatedStat.max);
          conn.Open();
          cmd.ExecuteNonQuery();
        }
      }
      return Ok(new { message = "Boxplot data updated successfully." });
    }
    catch (Exception ex)
    {
      return StatusCode(500, new { message = "Error updating boxplot data.", error = ex.Message });
    }
  }

}
