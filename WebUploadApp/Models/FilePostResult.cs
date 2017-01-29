using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebUploadApp.Models
{
    public class FilePostResult
    {
        public string Description { set; get; }

        public string TrackingId { set; get; }

        public string DownloadUrl { set; get; }

        public string Size { set; get; }

        public string FileName { set; get; }

        public string Extn { set; get; }
   
    }
}