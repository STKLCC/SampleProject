using ABPSample.Samples;
using Xunit;

namespace ABPSample.EntityFrameworkCore.Applications;

[Collection(ABPSampleTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<ABPSampleEntityFrameworkCoreTestModule>
{

}
