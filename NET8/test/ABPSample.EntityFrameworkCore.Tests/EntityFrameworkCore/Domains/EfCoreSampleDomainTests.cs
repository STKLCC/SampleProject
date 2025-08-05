using ABPSample.Samples;
using Xunit;

namespace ABPSample.EntityFrameworkCore.Domains;

[Collection(ABPSampleTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<ABPSampleEntityFrameworkCoreTestModule>
{

}
