using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using AspnetCoreMvcFull.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace AspnetCoreMvcFull.Controllers;

public class TablesController : Controller
{
  //public IActionResult Basic() => View();
  public async Task<IActionResult> Basic(IEnumerable<UsersModel> usrmodel)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();

    string DBConn = _configuration[key: "ConnectionStrings:BtITDevConn"];
    List<UsersModel> result = (List<UsersModel>)usrmodel;
    try
    {
      using (SqlConnection conn = new SqlConnection(DBConn))
      {
        SqlCommand sql_cmnd = new SqlCommand("SP_GetUsers", conn);
        sql_cmnd.CommandType = CommandType.StoredProcedure;
        conn.Open();
        using (SqlDataReader reader = sql_cmnd.ExecuteReader())
        {
          while (reader.Read())
          {
            result.Add(new UsersModel()
            {
              USERID = reader["USERID"].ToString(),
              DISPNAME = reader["DISPNAME"].ToString(),
              SAMACC = reader["SAMACC"].ToString(),
              UEMAIL = reader["UEMAIL"].ToString(),
              appleave = reader["appleave"].ToString()
            });
          }
        }
        conn.Close();
      }
    }
    catch (Exception ex)
    {
    }
    usrmodel = result.ToList();
    return View(usrmodel);
  }
}
