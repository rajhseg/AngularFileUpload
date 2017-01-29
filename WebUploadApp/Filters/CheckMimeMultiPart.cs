using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace WebUploadApp.Filters
{
    public class CheckMimeMultiPart:ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if (!actionContext.Request.Content.IsMimeMultipartContent())
                throw new HttpResponseException(System.Net.HttpStatusCode.UnsupportedMediaType);
        }
    }
}