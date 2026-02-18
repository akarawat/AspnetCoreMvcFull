using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.VisualBasic;

namespace AspnetCoreMvcFull.Models
{
  public class UsersModel
  {
    public string USERID { get; set; }
    public string DISPNAME { get; set; }
    public string UEMAIL { get; set; }
    public string SAMACC { get; set; }
    public string appleave { get; set; }
  }
  public class AttendanceModel
  {
      public string pkattdn { get; set; }
      public string empcode { get; set; }
      public string ddmmyy { get; set; }
      public string atttime { get; set; }
      public string empcodeFull { get; set; }
      public DateTime? ddmmyyFull { get; set; }
      public string atttimeFull { get; set; }
  }
  public class PPStockModel
  {
    public string itemno { get; set; }
    public string prodname { get; set; }
    public string searchname { get; set; }
    public string  dimension1 { get; set; }
    public string dimension2 { get; set; }
    public string warehouse { get; set; }
    public string batchno { get; set; }
    public string onlocat { get; set; }
    public string fincostamont { get; set; }
    public string phyinventory { get; set; }
    public string phyreserv { get; set; }
    public string avaiphy { get; set; }
    public string ordertotal { get; set; }
    public string onorder { get; set; }
    public string orderreserv { get; set; }
    public string totalavailable { get; set; }
    public DateTime? UPDATE_DATE { get; set; }
  }
  public class PartsListModel
  {
    public string id { get; set; }
    public string itemdoc { get; set; }
    public string itemno { get; set; }
    public string operation { get; set; }
    public string toollife { get; set; }
    public string itemqty { get; set; }
    public DateTime? UPDATE_DATE { get; set; }
    public string itemname { get; set; }
  }
  public class UserStockModel
  {
    public string ID { get; set; }
    public string EMPCODE { get; set; }
    public string USERFNAME { get; set; }
    public string USERLOGON { get; set; }
    public int? USRROLE { get; set; }
    public string USRFUNC { get; set; }
    public DateTime? CREATE_DT { get; set; }
    public DateTime? CREATE_USER { get; set; }
    public string UPDATE_DT { get; set; }
    public string UPDATE_USER { get; set; }
    public string ORDMAIL { get; set; }
    public string apprv_stock { get; set; }
    
  }
  public class OrderListModel
  {
    public string ID { get; set; }
    public string ordNo { get; set; }
    public DateTime? ordDate { get; set; }
    public string emp_code { get; set; }
    public string emp_rec { get; set; }
    public string emp_code_fname { get; set; }
    public string emp_rec_fname { get; set; }
    public string print1 { get; set; }
    public string print2 { get; set; }
    public int ord_stat  { get; set; }
  }
  public class OrderDetailModel
  {
    public string ID { get; set; }
    public string ItemDoc { get; set; }
    public string Itemno { get; set; }
    public string Itemname { get; set; }
    public int Itemrem { get; set; }
    public int Itemqty { get; set; }
    public int Itemapp { get; set; }
    public string ordNo { get; set; }
    public string emp_code { get; set; }
    public string emp_app { get; set; }
    public string emp_code_fname { get; set; }
    public string emp_app_fname { get; set; }
    public int ord_stat  { get; set; }
  }
  public class AllSammUsers
  {
    public string USERLOGON { get; set; }
    public string UEMAIL {  get; set; }
  }
  public class HRUserModel
  {
    public string EMP_CODE { get; set; }
    public string DISPNAME {  get; set; }
  }
  public class ViewModelVM
  {        
      public List <UserStockModel> VMCosrUses { get; set; }
      //public List <AllSammUsers> VMAllSamAcc { get; set; }
      public List<HRUserModel> VMHrUserModel { get; set;}
  }
}
