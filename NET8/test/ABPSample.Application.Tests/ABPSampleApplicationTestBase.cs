using Volo.Abp.Modularity;

namespace ABPSample;

public abstract class ABPSampleApplicationTestBase<TStartupModule> : ABPSampleTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
