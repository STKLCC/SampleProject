using System.Threading.Tasks;

namespace ABPSample.Data;

public interface IABPSampleDbSchemaMigrator
{
    Task MigrateAsync();
}
