using Xunit;

namespace ABPSample.EntityFrameworkCore;

[CollectionDefinition(ABPSampleTestConsts.CollectionDefinitionName)]
public class ABPSampleEntityFrameworkCoreCollection : ICollectionFixture<ABPSampleEntityFrameworkCoreFixture>
{

}
