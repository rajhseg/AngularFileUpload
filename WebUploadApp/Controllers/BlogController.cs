using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using WebUploadApp.Filters;
using WebUploadApp.Models;
using WebUploadApp.Providers;

namespace WebUploadApp.Controllers
{
    public class BlogController : ApiController
    {
        public IEnumerable<BlogModel> GetBlogs()
        {
            List<BlogModel> blogs = new List<BlogModel>();
            blogs.Add(new BlogModel() { Id = 1, Name = "DotnetVisio", Createdby = "Rajesh", NoOfPosts = 400 });
            blogs.Add(new BlogModel() { Id = 2, Name = "Angularjs", Createdby = "Rajesh", NoOfPosts = 50 });
            blogs.Add(new BlogModel() { Id = 3, Name = "SqlServer", Createdby = "Suresh", NoOfPosts = 250 });
            return blogs;
        }

        [CheckMimeMultiPart]
        public async Task<FilePostResult> Post()
        {
            try
            {
                var filepath = HttpContext.Current.Server.MapPath("~/files");
                MultipartFormStreamProvider provider = new MultipartFormStreamProvider(filepath);
                await Request.Content.ReadAsMultipartAsync(provider);

                string filename = provider.FileData.Select(x => x.LocalFileName).FirstOrDefault();
                string trackingid = provider.FormData.GetValues("trackingid").FirstOrDefault();
                string description = provider.FormData.GetValues("description").FirstOrDefault();

                var fileinfo = new FileInfo(filename);
                var response = new FilePostResult();

                response.FileName = fileinfo.Name;
                response.Size = fileinfo.Length.ToString();
                response.DownloadUrl = Request.RequestUri.GetLeftPart(UriPartial.Authority) + "/files/" + response.FileName; ;
                response.TrackingId = trackingid;
                response.Description = description;

                return response;

            }
            catch(Exception ex)
            {
                var response = new FilePostResult();
                response.TrackingId = "-1";
                return response;
            }
        }

    }
}
