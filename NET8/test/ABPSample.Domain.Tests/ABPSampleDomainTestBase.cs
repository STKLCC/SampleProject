using Volo.Abp.Modularity;

namespace ABPSample;

/* Inherit from this class for your domain layer tests. */
public abstract class ABPSampleDomainTestBase<TStartupModule> : ABPSampleTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
