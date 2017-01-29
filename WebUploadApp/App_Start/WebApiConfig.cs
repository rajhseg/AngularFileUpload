using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using WebUploadApp.Formatters;

namespace WebUploadApp
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.MapHttpAttributeRoutes();

            config.Formatters.Add(new BlogCsvFormatter());

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}
