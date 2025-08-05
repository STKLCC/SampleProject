using ABPSample.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace ABPSample.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class ABPSampleController : AbpControllerBase
{
    protected ABPSampleController()
    {
        LocalizationResource = typeof(ABPSampleResource);
    }
}
