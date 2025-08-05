using Volo.Abp.Ui.Branding;
using Volo.Abp.DependencyInjection;
using Microsoft.Extensions.Localization;
using ABPSample.Localization;

namespace ABPSample.Web;

[Dependency(ReplaceServices = true)]
public class ABPSampleBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<ABPSampleResource> _localizer;

    public ABPSampleBrandingProvider(IStringLocalizer<ABPSampleResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
