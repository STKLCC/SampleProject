using Volo.Abp.Modularity;

namespace ABPSample;

[DependsOn(
    typeof(ABPSampleApplicationModule),
    typeof(ABPSampleDomainTestModule)
)]
public class ABPSampleApplicationTestModule : AbpModule
{

}
