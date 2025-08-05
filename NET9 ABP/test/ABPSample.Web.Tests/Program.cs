using Microsoft.AspNetCore.Builder;
using ABPSample;
using Volo.Abp.AspNetCore.TestBase;

var builder = WebApplication.CreateBuilder();
builder.Environment.ContentRootPath = GetWebProjectContentRootPathHelper.Get("ABPSample.Web.csproj"); 
await builder.RunAbpModuleAsync<ABPSampleWebTestModule>(applicationName: "ABPSample.Web");

public partial class Program
{
}
