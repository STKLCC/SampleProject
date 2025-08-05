using ABPSample.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace ABPSample.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(ABPSampleEntityFrameworkCoreModule),
    typeof(ABPSampleApplicationContractsModule)
)]
public class ABPSampleDbMigratorModule : AbpModule
{
}
