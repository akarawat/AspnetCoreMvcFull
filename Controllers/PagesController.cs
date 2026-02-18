using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using AspnetCoreMvcFull.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace AspnetCoreMvcFull.Controllers;

public class PagesController : Controller
{
  public async Task<IActionResult> AccountSettings(IEnumerable<DropdownModel> ddl)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();

    string DBConn = _configuration[key: "ConnectionStrings:BtITDevConn"];
    List<DropdownModel> result = (List<DropdownModel>)ddl;
    try
    {
      using (SqlConnection conn = new SqlConnection(DBConn))
      {
        SqlCommand sql_cmnd = new SqlCommand("SP_CFGDropDown", conn);
        sql_cmnd.CommandType = CommandType.StoredProcedure;
        sql_cmnd.Parameters.AddWithValue("@FUNC", SqlDbType.NVarChar).Value = "APP_LEAVEEMP"; //APP_LEAVE
        conn.Open();
        using (SqlDataReader reader = sql_cmnd.ExecuteReader())
        {
          while (reader.Read())
          {
            result.Add(new DropdownModel()
            {
              DDLDISP = reader["DDLDISP"].ToString(),
              DDLVAL = reader["DDLDISP"].ToString()
            });
          }
        }
        conn.Close();
      }
    }
    catch (Exception ex)
    {
    }
    ddl = result.ToList();
    return View(ddl);
  }

  public IActionResult AccountSettingsConnections() => View();
  public IActionResult AccountSettingsNotifications() => View();
  public IActionResult MiscError() => View();
  public IActionResult MiscUnderMaintenance() => View();

  
  [HttpGet]  // 1. --> Direct Storeproc
  public async Task<List<DropdownModel>> GetLeaveApproval()
  {
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();

    string DBConn = _configuration[key: "ConnectionStrings:BtITDevConn"];
    List<DropdownModel> result = new List<DropdownModel>();
    try
    {
      using (SqlConnection conn = new SqlConnection(DBConn))
      {
        SqlCommand sql_cmnd = new SqlCommand("SP_CFGDropDown", conn);
        sql_cmnd.CommandType = CommandType.StoredProcedure;
        sql_cmnd.Parameters.AddWithValue("@FUNC", SqlDbType.NVarChar).Value = "APP_LEAVEEMP"; //APP_LEAVE
        conn.Open();
        using (SqlDataReader reader = sql_cmnd.ExecuteReader())
        {
          while (reader.Read())
          {
            result.Add(new DropdownModel()
            {
              DDLDISP = reader["DDLDISP"].ToString(),
              DDLVAL = reader["DDLDISP"].ToString()
            });
          }
        }
        conn.Close();
      }
    }
    catch (Exception ex) {
      throw;
    }
    return result.ToList();
  }

  [HttpPost] // 2. --> Direct Storeproc
  public JsonResult AddNewUsers(UsersModel obj)
  {
      string[] strMsg = new string[3];
      IConfiguration _configuration = new ConfigurationBuilder()
                          .SetBasePath(Directory.GetCurrentDirectory())
                          .AddJsonFile("appsettings.json")
                          .Build();
      string DBConn = _configuration[key: "ConnectionStrings:BtITDevConn"];
      SqlConnection con = null;
      try
      {
          con = new SqlConnection(DBConn);
          con.Open();
          SqlCommand cmd = new SqlCommand("SP_AddNewUsers", con);
          cmd.CommandType = CommandType.StoredProcedure;
          cmd.Parameters.AddWithValue("@DISPNAME", obj.DISPNAME);
          cmd.Parameters.AddWithValue("@SAMACC", obj.SAMACC);
          cmd.Parameters.AddWithValue("@UEMAIL", obj.UEMAIL);
          cmd.Parameters.AddWithValue("@appleave", obj.appleave == null ? DBNull.Value : obj.appleave);
          cmd.ExecuteNonQuery();
      }
      catch (Exception ex)
      {
        strMsg[0] = "0";
        strMsg[1] = "Error " + ex.Message;
      }
      finally
      {
        strMsg[0] = "1";
        strMsg[1] = "Success";
        con.Close();
      }

      return Json(strMsg);
  }
  
  [HttpPut] // 2. --> Direct Storeproc
  public JsonResult EditUsers(UsersModel obj)
  {
      string[] strMsg = new string[3];
      IConfiguration _configuration = new ConfigurationBuilder()
                          .SetBasePath(Directory.GetCurrentDirectory())
                          .AddJsonFile("appsettings.json")
                          .Build();
      string DBConn = _configuration[key: "ConnectionStrings:BtITDevConn"];
      SqlConnection con = null;
      try
      {
          con = new SqlConnection(DBConn);
          con.Open();
          SqlCommand cmd = new SqlCommand("SP_EditUsers", con);
          cmd.CommandType = CommandType.StoredProcedure;
          cmd.Parameters.AddWithValue("@DISPNAME", obj.DISPNAME);
          cmd.Parameters.AddWithValue("@SAMACC", obj.SAMACC);
          cmd.Parameters.AddWithValue("@UEMAIL", obj.UEMAIL);
          cmd.Parameters.AddWithValue("@appleave", obj.appleave == null ? DBNull.Value : obj.appleave);
          cmd.ExecuteNonQuery();
      }
      catch (Exception ex)
      {
        strMsg[0] = "Error " + ex.Message;
      }
      finally
      {
        strMsg[0] = "Success";
        con.Close();
      }

      return Json(strMsg);
  }

}
