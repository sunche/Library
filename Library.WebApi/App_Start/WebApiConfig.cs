using System;
using System.Web.Http;
using Library.WebApi.Infrastructure;
using Library.WebApi.Repositories;
using Library.WebApi.Repositories.Implementations;
using Unity;
using Unity.Lifetime;

namespace Library.WebApi
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            var container = new UnityContainer();
            container.RegisterType<ILibraryRepository, FakeLibraryRepository>(new HierarchicalLifetimeManager());
            config.DependencyResolver = new UnityResolver(container);

            // Web API configuration and services
            config.EnableCors();

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}
