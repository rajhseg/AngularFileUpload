using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Web;
using WebUploadApp.Models;

namespace WebUploadApp.Formatters
{
    public class BlogCsvFormatter : BufferedMediaTypeFormatter
    {
        public override bool CanReadType(Type type)
        {
            return false;
        }

        public override bool CanWriteType(Type type)
        {
            if(type == typeof(BlogModel))
            {
                return true;
            }
            else
            {
                Type _t = typeof(IEnumerable<BlogModel>);
                return _t.IsAssignableFrom(type);
            }
        }

        public override void WriteToStream(Type type, object value, Stream writeStream, HttpContent content)
        {
            using(StreamWriter _writer =new StreamWriter(writeStream))
           {
                var _list = value as IEnumerable<BlogModel>;
                if (_list != null)
                {
                    foreach (var item in _list)
                    {
                        _writer.Write(string.Format("{0},\"{1}\",\"{2}\",\"{3}\"\n", item.Id, item.Name, item.NoOfPosts, item.Createdby));
                    }
                }
                else
                {
                    var item = value as BlogModel;
                    if (item == null)
                        throw new InvalidOperationException("Not able to serialize");

                    _writer.Write(string.Format("{0},\"{1}\",\"{2}\",\"{3}\"\n", item.Id, item.Name, item.NoOfPosts, item.Createdby));
                }
            }
        }
    }
}