using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using AspnetCoreMvcFull.Models;
using System.Net.Http.Headers;
using System.Net;
using Newtonsoft.Json;

namespace AspnetCoreMvcFull.Controllers;

public class SendMailController : Controller
    {
        [HttpPost]
        public async Task<object> MailSenderMessage(SenderMailModel obj)
        {
            IConfiguration _configuration = new ConfigurationBuilder()
                                .SetBasePath(Directory.GetCurrentDirectory())
                                .AddJsonFile("appsettings.json")
                                .Build();

            string strMsg = "Success";
            string mailForm = _configuration[key: "TBCorApiServices:MailForm"];
            //API Send Email
            SenderMailModel param = new SenderMailModel();
            param.Body = obj.Body;
            param.Form = mailForm;
            param.Subject = obj.Subject;
            //param.Addresses = "sakulchai_p@berninathailand.com";//Debug obj.Addresses;
            param.Addresses = obj.Addresses;
            param.Priority = 1;

            StringContent strContent = new StringContent(JsonConvert.SerializeObject(param), System.Text.Encoding.UTF8, "application/json");
            CookieContainer container = new CookieContainer();
            var handler1 = new HttpClientHandler
            {
                AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,
                CookieContainer = container,
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };
            //var _result = new List<RESGetTopRangeModels>();
            using (var httpClient = new HttpClient(handler1))
            {
                string baseUrl = _configuration[key: "TBCorApiServices:EmailSender"];
                var tokenNo = "-dev_token-";
                httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + tokenNo);
                var contentType = new MediaTypeWithQualityHeaderValue("application/json");
                httpClient.DefaultRequestHeaders.Accept.Add(contentType);

                using (var response = await httpClient.PostAsync(baseUrl, strContent))
                {
                    strMsg = await response.Content.ReadAsStringAsync();
                }

            }
            return Ok(strMsg);
        }
    }
