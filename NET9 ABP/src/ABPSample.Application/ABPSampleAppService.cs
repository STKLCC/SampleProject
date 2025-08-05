using ABPSample.Localization;
using Volo.Abp.Application.Services;

namespace ABPSample;

/* Inherit your application services from this class.
 */
public abstract class ABPSampleAppService : ApplicationService
{
    protected ABPSampleAppService()
    {
        LocalizationResource = typeof(ABPSampleResource);
    }
}
