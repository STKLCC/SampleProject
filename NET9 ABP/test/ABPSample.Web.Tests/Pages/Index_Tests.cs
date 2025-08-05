using System.Threading.Tasks;
using Shouldly;
using Xunit;

namespace ABPSample.Pages;

[Collection(ABPSampleTestConsts.CollectionDefinitionName)]
public class Index_Tests : ABPSampleWebTestBase
{
    [Fact]
    public async Task Welcome_Page()
    {
        var response = await GetResponseAsStringAsync("/");
        response.ShouldNotBeNull();
    }
}
