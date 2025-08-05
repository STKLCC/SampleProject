using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ABPSample.EntityFrameworkCore;

/* This class is needed for EF Core console commands
 * (like Add-Migration and Update-Database commands) */
public class ABPSampleDbContextFactory : IDesignTimeDbContextFactory<ABPSampleDbContext>
{
    public ABPSampleDbContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();
        
        ABPSampleEfCoreEntityExtensionMappings.Configure();

        var builder = new DbContextOptionsBuilder<ABPSampleDbContext>()
            .UseSqlServer(configuration.GetConnectionString("Default"));
        
        return new ABPSampleDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../ABPSample.DbMigrator/"))
            .AddJsonFile("appsettings.json", optional: false);

        return builder.Build();
    }
}
