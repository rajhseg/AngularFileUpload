using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebUploadApp.Models
{
    public class BlogModel
    {
        public int Id { set; get; }

        public string Name { set; get; }

        public string Createdby { set; get; }

        public int NoOfPosts { set; get; }
    }
}