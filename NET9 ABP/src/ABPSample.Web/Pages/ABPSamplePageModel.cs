using ABPSample.Localization;
using Volo.Abp.AspNetCore.Mvc.UI.RazorPages;

namespace ABPSample.Web.Pages;

public abstract class ABPSamplePageModel : AbpPageModel
{
    protected ABPSamplePageModel()
    {
        LocalizationResourceType = typeof(ABPSampleResource);
    }
}
