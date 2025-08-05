using Volo.Abp.Settings;

namespace ABPSample.Settings;

public class ABPSampleSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(ABPSampleSettings.MySetting1));
    }
}
