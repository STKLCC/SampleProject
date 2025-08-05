using Volo.Abp.Modularity;

namespace ABPSample;

[DependsOn(
    typeof(ABPSampleDomainModule),
    typeof(ABPSampleTestBaseModule)
)]
public class ABPSampleDomainTestModule : AbpModule
{

}
