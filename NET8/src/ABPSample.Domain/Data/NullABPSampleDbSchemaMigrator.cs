using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace ABPSample.Data;

/* This is used if database provider does't define
 * IABPSampleDbSchemaMigrator implementation.
 */
public class NullABPSampleDbSchemaMigrator : IABPSampleDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
