# DataIntegrationApi - Detailed Flow Analysis

## Overview
This document provides a comprehensive analysis of all sync request flows in the DataIntegrationApi, tracing the complete code execution path from API endpoints through data transformation to external system integration.

## 1. General Sync Request Flow

### Entry Point: Main Sync Endpoint
```12:15:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.cs
[HttpPost("[action]")]
[Topic("ClientOpenApi.DataIntegration.Sync")]
[SwaggerRequestExample(typeof(SyncRequestDto), typeof(DataIntegrationSwashbuckleExamples.SyncRequestDtoExample))]
public async Task<IActionResult> Sync([FromBody] SyncRequestDto payload)
```

### Flow Steps:

#### 1.1 Request Validation
```75:85:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.cs
if (payload is null)
{
    return BadRequest("Request body not detected, please ensure the request body is well formatted");
}

try
{
    var syncResult = await _dataIntegrationManager.SyncCommonData(payload);
```

#### 1.2 Data Integration Manager Processing
```47:65:src/ClientModules/DataIntegrationApi/Deprecated/Managers/DataIntegrationManager.cs
public async Task<ResponseModel<GetServerTimeDto>> GetServerTime(string clientName, ProviderType providerType)
{
    _syncsetting = GetSyncSetting(clientName);
    var response = new ResponseModel<GetServerTimeDto>();
    try
    {
        if (_syncsetting == null)
            return response.SetError("Invalid client settings.");

        _provider = _factory.GetProvider(providerType);
        await _provider.InitConfigurationSettings(_syncsetting, null);
```

#### 1.3 Provider Factory Pattern
```75:85:src/ClientModules/DataIntegrationApi/Deprecated/Common/ProviderFactory.cs
public IProvider GetProvider(ProviderType provider)
{
    switch (provider)
    {
        case ProviderType.Yardi:
            return _provider.FirstOrDefault(s => s is YardiProvider);
        default:
            throw new Exception($"Error Code: {(int)ErrorCode.ServiceNotFound}, No service has been found");
    }
}
```

## 2. Yardi ↔ ONE Integration Flow

### 2.1 Service Request Synchronization

#### Entry Point
```12:15:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.YardiToONE.cs
[HttpPost("YardiToONE/SyncServiceRequest")]
[Topic("ClientOpenApi.DataIntegration.YardiToONE.SyncServiceRequest")]
public async Task<IActionResult> YardiToONESyncServiceRequest([FromBody] SyncPayloadDto payload)
```

#### Profile Validation
```20:35:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.YardiToONE.cs
_scopeSetting.Payload = payload;
_scopeSetting.ClientName = payload.ClientName;

var yardiSettingProfile = _yardiSetting.Profile.FirstOrDefault(x => x.ClientName == _scopeSetting.ClientName);
if (yardiSettingProfile is null)
{
    Logger.Error($"[DataIntegration][{nameof(YardiToONESyncServiceRequest)}] Unable to find Yardi Setting Profile, ClientName: {_scopeSetting.ClientName}");
    return BadRequest($"Unable to find Yardi Setting Profile, ClientId: {_scopeSetting.ClientName}");
}

var oneSettingProfile = _oneSetting.Profile.FirstOrDefault(x => x.ClientName == _scopeSetting.ClientName);
if (oneSettingProfile is null)
{
    Logger.Error($"[DataIntegration][{nameof(YardiToONESyncServiceRequest)}] Unable to find One Setting Profile, ClientName: {_scopeSetting.ClientName}");
    return BadRequest($"Unable to find One Setting Profile, ClientId: {_scopeSetting.ClientName}");
}
```

#### Manager Processing
```45:55:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.YardiToONE.cs
var result = await _yardiToOneManager.SyncServiceRequest(propertyCodeList);
if (result != null)
{
    foreach (var entry in result)
    {
        failedResults[entry.Key] = entry.Value;
    }
}
```

#### Detailed Manager Flow
```31:79:src/ClientModules/DataIntegrationApi/Managers/YardiToOne/YardiToOneManager.SyncServiceRequest.cs
public async Task<Dictionary<string, string>> SyncServiceRequest(List<string> propertyCodeList)
{
    var oneProfile = _oneSetting.Profile.FirstOrDefault(x => x.ClientName == _scopeSetting.ClientName);
    var clientProfileName = _scopeSetting.ClientName;
    var resultDictionary = new Dictionary<string, string>();
    
    var oneServiceRequestFilter = new GetReactiveWorkOrderListFilterDto { ClientId = oneProfile.ClientId };
    var oneServiceRequestModel = await GetReactiveWorkOrderList(oneServiceRequestFilter);
    Dictionary<string, ServiceRequestModel> oneServiceRequestDictionary = oneServiceRequestModel.ToDictionary(sr => sr.WoRefNum);
```

#### Yardi Service Request Retrieval
```376:434:src/ClientModules/DataIntegrationApi/Managers/YardiToOne/YardiToOneManager.SyncServiceRequest.cs
private async Task<List<ServiceRequestModel>> GetYardiServiceRequest(string propertyCode)
{
    var yardiProfile = _yardiSetting.Profile.FirstOrDefault(x => x.ClientName == _scopeSetting.ClientName);
    var response = await _yardiService.GetServiceRequestByDateRange(new GetServiceRequestByDateRangeRequestDto
    {
        YardiPropertyId = propertyCode,
        FromDate = DateTime.Now.AddDays(-_scopeSetting.Payload.SyncDateRange),
        ToDate = DateTime.Now,
        Status = YardiWoStatus.Call.GetDesc()
    });
```

#### Data Transformation & Filtering
```390:420:src/ClientModules/DataIntegrationApi/Managers/YardiToOne/YardiToOneManager.SyncServiceRequest.cs
var acceptedPriorityList = new[] { YardiWoPriority.Med.GetDesc(), YardiWoPriority.High.GetDesc(), YardiWoPriority.Emergency.GetDesc() };
return response?.ServiceRequestList.Where(x =>
        !string.IsNullOrEmpty(x.ServiceRequestId) && !string.IsNullOrEmpty(x.UnitCode) && !string.IsNullOrEmpty(x.SubCategory) &&
        !string.IsNullOrEmpty(x.RequestorName) && !string.IsNullOrEmpty(x.Priority) && acceptedPriorityList.Contains(x.Priority))
    .Select(x =>
    {
        var serviceRequest = new ServiceRequestModel
        {
            LocationNumber = PropertyUtility.GetLocationNumber(x.PropertyCode, x.UnitCode, yardiProfile.PropertyType),
            Attachments = x.HasAttachments ? new WorkOrderAttachmentModel { ExternalWOId = x.ServiceRequestId, PropertyCode = x.PropertyCode } : default,
            ReferWONum = x.ServiceRequestId,
            ServiceRequestCategory = x.Category,
            CallTime = x.ServiceRequestDate,
            AccessInformation = x.AccessNotes,
            Caller = x.RequestorName,
            CallerPhoneNumber = x.RequestorPhoneNumber,
            CallerEmail = x.RequestorEmail,
            DueDate = x.DueDate,
            Priority = x.Priority,
            PriorityId = (int)OnePriorityTypeEnum.Urgent,
            PropertyType = yardiProfile.PropertyType,
```

#### Status Mapping
```420:435:src/ClientModules/DataIntegrationApi/Managers/YardiToOne/YardiToOneManager.SyncServiceRequest.cs
StatusId = x.CurrentStatus switch
{
    var status when status == YardiSrStatusTypeEnum.InProgress.GetEnumDescription()
        => (int)OneWoStatusEnum.PendingSchedule,
    var status when status == YardiSrStatusTypeEnum.RequestReassignment.GetEnumDescription()
        => (int)OneWoStatusEnum.ReturnTripNeeded,
    var status when status == YardiSrStatusTypeEnum.WorkCompleted.GetEnumDescription()
        => (int)OneWoStatusEnum.WorkCompletePendingVendorInvoice,
    var status when status == YardiSrStatusTypeEnum.Canceled.GetEnumDescription()
        => (int)OneWoStatusEnum.Cancelled,
    _ => (int)OneWoStatusEnum.Undefined
},
```

#### Comparison & Deduplication
```434:456:src/ClientModules/DataIntegrationApi/Managers/YardiToOne/YardiToOneManager.SyncServiceRequest.cs
public async Task<List<ServiceRequestModel>> CompareServiceRequest(
    Dictionary<string, ServiceRequestModel> oneServiceRequestDictionary,
    List<ServiceRequestModel> clientServiceRequest)
{
    var serviceRequestToCreateList = new List<ServiceRequestModel>();
    if (clientServiceRequest.Count > 0)
    {
        foreach (var workOrder in clientServiceRequest)
        {
            if (!oneServiceRequestDictionary.ContainsKey(workOrder.ReferWONum))
            {
                serviceRequestToCreateList.Add(workOrder);
            }
        }
        serviceRequestToCreateList = await AssignDefaultCaller(serviceRequestToCreateList);
    }
    return serviceRequestToCreateList;
}
```

#### Default Caller Assignment
```456:488:src/ClientModules/DataIntegrationApi/Managers/YardiToOne/YardiToOneManager.SyncServiceRequest.cs
private async Task<List<ServiceRequestModel>> AssignDefaultCaller(List<ServiceRequestModel> serviceRequestToCreateList)
{
    var defaultCallerSR = serviceRequestToCreateList.Where(p => p.Caller == null).ToList();
    if (defaultCallerSR.Count > 0)
    {
        var locationNumbers = defaultCallerSR.Select(x => x.LocationNumber).ToList();
        var query = from res in _database.Table<client_LocationResidential>()
                    join loc in _database.Table<client_Location>() on res.LocationId equals loc.Id
                    where locationNumbers.Contains(loc.LocationNumber) && res.IsPrimaryResident && res.Status.ToLower() == "active"
                    select new { LocationNumber = res.LocationNumber, Name = res.Name, Email = res.Email, Phone = res.Phone };
```

#### ONE Service Request Creation
```502:584:src/ClientModules/DataIntegrationApi/Managers/YardiToOne/YardiToOneManager.SyncServiceRequest.cs
private async Task<List<ONEServiceRequestResponseDto>> CreateServicesRequest(List<ServiceRequestModel> clientServiceRequestsToSave)
{
    var responseList = new List<ONEServiceRequestResponseDto>();
    Logger.Information($"[DataIntegration][CreateServicesRequest] Starting to create {clientServiceRequestsToSave.Count} Service Request.");
    
    var groupedRequests = clientServiceRequestsToSave.GroupBy(sr => sr.Division).ToList();
    foreach (var ServicesRequestByDivision in groupa)
    {
        foreach (var ServicesRequestDto in ServicesRequestByDivision.ONECreateServicesRequest)
        {
            var input = JsonApiUtility.ConvertToDictionary(ServicesRequestDto, typeof(CreateOneServiceRequestDto));
            var responseJson = await _oneService.CreateServiceRequest(input);
```

### 2.2 Attachment Synchronization

#### Entry Point
```75:122:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.YardiToONE.cs
[HttpPost("YardiToONE/SyncAttachmentUpdateToONE")]
[Topic("ClientOpenApi.DataIntegration.YardiToONE.SyncAttachmentUpdateToONE")]
public async Task<IActionResult> SyncAttachmentUpdateToONE([FromBody] SyncPayloadDto payload)
```

#### Attachment Processing Flow
```162:247:src/ClientModules/DataIntegrationApi/Managers/YardiToOne/YardiToOneManager.SyncServiceRequest.cs
public async Task<List<SaveAttachmentsFromYardiToONEResponse>> SyncAttachmentUpdateToONE(List<string> propertyCodeList)
{
    var responses = new List<SaveAttachmentsFromYardiToONEResponse>();
    foreach (var propertyCode in propertyCodeList)
    {
        var yardiAttachments = await _yardiService.GetAttachments(new GetServiceRequestAttachmentRequestDto
        {
            YardiPropertyId = propertyCode,
            FromDate = DateTime.Now.AddDays(-_scopeSetting.Payload.SyncDateRange),
            ToDate = DateTime.Now
        });
```

## 3. RealPage ↔ ONE Integration Flow

### 3.1 Location Synchronization

#### Entry Point
```47:89:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.RealPageToONE.cs
[HttpPost("RealPageToOne/SyncLocation")]
[Topic("ClientOpenApi.DataIntegration.RealPageToOne.SyncLocation")]
public async Task<IActionResult> RealPageToOneSyncLocation([FromBody] SyncPayloadDto payload)
```

#### Manager Processing
```25:100:src/ClientModules/DataIntegrationApi/Managers/RealPageToOne/RealPageToOneManager.SyncLocation.cs
public async Task<List<OneBaseResult>> SyncLocation(RealPageSettingProfile profile, int clientId, RealPageAuthModel authModel)
{
    var siteListResponse = await _realPageService.GetSiteList(new GetSiteListRequestDto
    {
        PmcId = authModel.PmcId,
        SiteId = authModel.SiteId,
        LicenseKey = authModel.LicenseKey,
    });
    if (siteListResponse is not { Sites: { Count: > 0 } siteList }) return null;

    var unitListResponse = await _realPageService.UnitList(new GetUnitListRequestDto
    {
        PmcId = authModel.PmcId,
        SiteId = authModel.SiteId,
        LicenseKey = authModel.LicenseKey,
    });
```

#### Data Transformation
```45:85:src/ClientModules/DataIntegrationApi/Managers/RealPageToOne/RealPageToOneManager.SyncLocation.cs
var realPageLocationModel = new RealPageToOneLocationModel
{
    LocationNumber = locationNumber,
    LocationName = siteInfo.SiteName,
    AddressLine1 = unit.AddressLine1,
    AddressLine2 = string.IsNullOrWhiteSpace(unit.AddressLine2) ? null : unit.AddressLine2,
    City = unit.City,
    State = unit.State,
    ZipCode = unit.Zip,
    Country = CultureUtility.GetCountryShortCode(unit.Country),
    Status = unit.UnitDeleted == "T" ? (short)0 : (short)1,
    FirstMoveInReadyDate = string.IsNullOrEmpty(unit.UnitExpectedMoveinDate) ? new DateTime(1900, 1, 1) : DateTime.TryParseExact(unit.UnitExpectedMoveinDate, "yyyy-MM-dd hh:mm:ss", CultureInfo.InvariantCulture,
        DateTimeStyles.None, out var firstMoveInReadyDate)
        ? firstMoveInReadyDate
        : null,
    UnitStatus = GetUnitStatus(unit.Available, unit.Vacant, unit.UnitExpectedMoveinDate),
    BathRooms = floorPlan?.Bath ?? (decimal?)null,
    BedRooms = floorPlan?.Bed ?? (int?)null,
    TTSQFT = unit.GrossSqft ?? (decimal?)null,
    PropertyCode = siteInfo.SiteNumber.ToString(),
    FloorPlan = floorPlan != null
        ? $"{floorPlan.Bed ?? 0} Bed/{floorPlan.Bath ?? 0} Bath"
        : null,
    PropertyTypeId = profile.PropertyType
};
```

### 3.2 Resident Synchronization

#### Entry Point
```12:46:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.RealPageToONE.cs
[HttpPost("RealPageToOne/SyncResident")]
[Topic("ClientOpenApi.DataIntegration.RealPageToOne.SyncResident")]
public async Task<IActionResult> RealPageToOneSyncResident([FromBody] SyncPayloadDto payload)
```

## 4. Insight → ONE Integration Flow

### 4.1 Location Synchronization

#### Entry Point
```12:117:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.InsightToOne.cs
[HttpPost("InsightToOne/SyncLocation")]
[Topic("ClientOpenApi.DataIntegration.InsightToOne.SyncLocation")]
public async Task<IActionResult> InsightToOneSyncLocation([FromBody] SyncPayloadDto payload)
```

#### Authentication & GUID Retrieval
```35:45:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.InsightToOne.cs
var guid = await _insightService.GetGuid(insightProfile);
if (guid is null)
{
    Logger.Error($"[DataIntegration][{nameof(InsightToOneSyncLocation)}] Insight GUID not retrieved, ClientName: {_scopeSetting.ClientName}");
    return BadRequest($"Unable to retrieve Insight GUID, ClientId: {_scopeSetting.ClientName}");
}
```

#### Insight Service Implementation
```30:50:src/ClientModules/DataIntegrationApi/Services/Insight/InsightService.cs
public async Task<string> GetGuid(InsightSettingProfile profile)
{
    var endpoint = "api/apiguid";
    var url = BuildUrlWithQueryParams(
        $"{_insightSetting.DomainUrl}/{endpoint}/",
        new Dictionary<string, string>
        {
            { "validationKey", profile.ValidationKey },
            { "partnerKey", profile.PartnerKey },
            { "vendorID", profile.VendorID },
            { "vendorPassword", profile.VendorPassword },
            { "ID", profile.ID },
            { "IDPassword", profile.IDPassword }
        }
    );

    var response = await GetJson<GetGuidResponseDto>(url);
    return response?.GUID;
}
```

#### Company List Retrieval
```47:65:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.InsightToOne.cs
var companyList = await _insightService.GetCompanyList(new GetCompanyListRequestDto
{
    VendorID = insightProfile.VendorID,
    VendorPassword = insightProfile.VendorPassword,
    Guid = guid
});

List<GetCompanyListResponseDto> filteredCompanyList;
if (insightProfile.Companies == null || !insightProfile.Companies.Any())
{
    filteredCompanyList = companyList;
}
else
{
    filteredCompanyList = companyList.Where(c => insightProfile.Companies.Contains(c.CompanyKey.ToString())).ToList();
}
```

#### Manager Processing
```25:100:src/ClientModules/DataIntegrationApi/Managers/InsightToOne/InsightToOneManager.Location.cs
public async Task<InsightSyncResultModel> SyncLocation(List<GetCompanyListResponseDto> companyGroup, int clientId, InsightSettingProfile profile, InsightParamModel param)
{
    var totalCreateResult = new OneBaseResult { ValidationMessages = new List<ValidationMessage>() };
    foreach (var community in companyGroup)
    {
        var createOneLocationRequestDtoList = new List<CreateOneLocationRequestDto>();
        
        var locationNumbers = await _database.Table<client_Location>()
            .Where(x => x.ClientId == clientId && x.Region == community.CommunityName)
            .Select(x => x.LocationNumber)
            .ToListAsync();

        var unitList = await _insightService.GetUnit(new GetUnitRequestDto
        {
            VendorID = param.VendorID,
            VendorPassword = param.VendorPassword,
            VendorKey = param.VendorKey,
            Guid = param.Guid,
            CompanyKey = community.CompanyKey,
            CommunityKey = community.CommunityKey,
        });
```

## 5. Cross-Platform Integration Flows

### 5.1 RealPage ↔ Lessen360

#### Entry Point
```12:100:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.RealPageToLessen360.cs
[HttpPost("RealPageToLessen360/Sync")]
[Topic("ClientOpenApi.DataIntegration.RealPageToLessen360.Sync")]
public async Task<IActionResult> RealPageToLessen360Sync([FromBody] SyncPayloadDto payload)
```

### 5.2 Yardi ↔ Lessen360

#### Webhook Entry Point
```55:100:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationInboundController.cs
[SwaggerOperation(Tags = new[] { CustomTags.Tags_DataIntegration })]
[HttpPost("YardiToLessen360/WebHook")]
public async Task<IActionResult> YardiToLessen360Webhook([FromBody] object payload)
{
    var headersDict = Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString());
    if (headersDict.TryGetValue("Authorization", out var hmacToken) && hmacToken == null)
    {
        Logger.Information($"[DataIntegration][{nameof(YardiToLessen360Webhook)}] Missing Authorization header Payload: {payload}, Headers: {JsonSerializer.Serialize(headersDict)}");
        return Unauthorized();
    }
```

#### HMAC Validation
```70:85:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationInboundController.cs
var splitAuth = hmacToken.Split(":");
var appIdWithEncryptMethod = splitAuth[0];
var appId = appIdWithEncryptMethod.Split(" ")[1];
var nonce = splitAuth[2];
var timestamp = splitAuth[3];

var setting = _lessen360Setting.Profile.FirstOrDefault(x => x.AppId == appId);
if (setting is null)
{
    Logger.Information($"[DataIntegration][{nameof(YardiToLessen360Webhook)}] Invalid AppId: {appId}");
    return Unauthorized();
}
```

## 6. Data Transformation Patterns

### 6.1 AutoMapper Configuration
```25:100:src/ClientModules/DataIntegrationApi/DataIntegrationProfile.cs
CreateMap<YardiLocationModel, LocationModel>()
    .ForMember(dest => dest.LocationNumber,
        input => input.MapFrom(i => MappingUtility.GetLocationNumber(i.PropertyCode, i.UnitCode, i.PropertyType)))
    .ForMember(dest => dest.LocationName, input => input.MapFrom(i => i.PropertyName))
    .ForMember(dest => dest.Status,
        input => input.MapFrom(i =>
            (short)(i.UnitStatus == EnumUtility.GetEnumDescription(YardiUnitStatus.Waitlist) ||
                    i.UnitStatus == EnumUtility.GetEnumDescription(YardiUnitStatus.Down)
                ? LocationStatus.InActive.GetEnumIntValue()
                : LocationStatus.Active.GetEnumIntValue())))
    .ForMember(dest => dest.PropertyStatus,
        input => input.MapFrom(i =>
            (short)(i.UnitStatus == EnumUtility.GetEnumDescription(YardiUnitStatus.Waitlist) ||
                    i.UnitStatus == EnumUtility.GetEnumDescription(YardiUnitStatus.Down)
                ? PropertyStatus.InActive
                : PropertyStatus.Active)))
    .ForMember(dest => dest.AddressLine2, input => input.MapFrom(i => i.PropertyType == Controllers.Enum.PropertyType.MFR ? i.UnitCode : null))
    .ForMember(dest => dest.FirstMoveInReadyDate, input => input.MapFrom(i => i.AvailableDate))
    .ForMember(dest => dest.EnableFacilitiesUnit, input => input.MapFrom(i => true))
    .ForMember(dest => dest.District, input => input.MapFrom(i => i.MSA))
    .ForMember(dest => dest.Group, input => input.MapFrom(i => i.Community))
    .ForMember(dest => dest.IsHOA, input => input.MapFrom(i => i.HOA))
    .ForMember(dest => dest.AcquiredDate, input => input.MapFrom(i => i.AcquisitionDate))
    .ForMember(dest => dest.TTSQFT, input => input.MapFrom(i => i.TTSQFT != null ? i.TTSQFT.ToString() : null));
```

### 6.2 Location Number Generation
```25:41:src/ClientModules/DataIntegrationApi/Commons/Utils/PropertyUtility.cs
public static string GetLocationNumber(string propertyCode, string unitCode, PropertyType propertyType)
{
    propertyCode = propertyCode?.Trim();
    unitCode = unitCode?.Trim();

    if (propertyType == PropertyType.SFR)
        return propertyCode?.ToUpper();

    return $"{propertyCode}-{unitCode}";
}
```

## 7. Error Handling & Resilience

### 7.1 Retry Policies
```85:120:src/ClientModules/DataIntegrationApi/DataIntegrationModule.cs
services.AddHttpClient("YardiClient")
    .AddPolicyHandler(HttpPolicyExtensions
        .HandleTransientHttpError() // Handles 5xx and 408 errors
        .Or<TaskCanceledException>() // Handles timeouts
        .WaitAndRetryAsync(
            retryCount: yardiSetting?.ApiRetryAttempt ?? 0,
            sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(yardiSetting?.ApiRetrySleepInSecond ?? 0),
            async (outcome, timespan, retryAttempt, context) =>
            {
                var endpoint = outcome.Result?.RequestMessage?.RequestUri;
                var content = await outcome.Result?.Content.ReadAsStringAsync();
                Logger.Error($"[DataIntegration][YardiClientRetryApiCall] Retry: {retryAttempt}, RequestUri: {endpoint}");
            }
        ))
    .AddPolicyHandler(Policy.TimeoutAsync<HttpResponseMessage>(yardiSetting?.ApiTimeoutInSecond ?? 100));
```

### 7.2 Exception Handling
```85:100:src/ClientModules/DataIntegrationApi/Controllers/DataIntegrationController.cs
catch (Exception ex)
{
    Logger.Error($"[DataIntegration][Sync] Error Code: {(int)ErrorCode.SyncError}, Message: {ex.Message}, Stack Trace: {ex.StackTrace}");
    return StatusCode(500, $"Error Occured While Sync, Message: {ex.Message}, /n Stack Trace: {ex.StackTrace}");
}
```

## 8. Configuration Management

### 8.1 System-Specific Settings
```10:40:src/ClientModules/DataIntegrationApi/Commons/Models/YardiSetting.cs
public class YardiSetting
{
    public int? ApiTimeoutInSecond { get; set; }
    public int ApiRetryAttempt { get; set; }
    public int ApiRetrySleepInSecond { get; set; }
    public bool IsByPassMaintenanceTime { get; set; }
    public List<YardiSettingProfile> Profile { get; set; }
}

public class YardiSettingProfile
{
    public string ClientName { get; set; }
    public PropertyType PropertyType { get; set; }
    public string RequestUrl { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string ServerName { get; set; }
    public string Database { get; set; }
    public string Platform { get; set; }
    public string InterfaceEntity { get; set; }
    public string InterfaceLicense { get; set; }
    public List<string> PropertyCodeList { get; set; }
    public string Prefix { get; set; }
    public int MaximumFileSize { get; set; } = 4194304;
```

## 9. Service Layer Implementation

### 9.1 Yardi Service
```40:100:src/ClientModules/DataIntegrationApi/Services/Yardi/YardiService.cs
private async Task<TResponse> PostXml<TResponse, TRequest>(
    RequestTypeEnum requestType,
    TRequest requestInput = null,
    [CallerMemberName] string endPoint = "")
    where TResponse : class
    where TRequest : class
{
    var propertyCode = string.Empty;
    if (requestInput is not null)
    {
        var type = typeof(TRequest);
        var property = type.GetProperties().FirstOrDefault(p => p.GetCustomAttributes(typeof(DisplayNameAttribute), true)
            .Cast<DisplayNameAttribute>()
            .Any(attr => attr.DisplayName == "PropertyId"));

        propertyCode = property is not null ? property.GetValue(requestInput)?.ToString() : string.Empty;
    }

    _loggerUtil.AddInfoWithUniqueKey(new LoggerInfoDto
    {
        PropertyCode = propertyCode,
        ApiName = endPoint,
        Platform = _platform,
        Message = $"Calling {endPoint}"
    }, _platform + endPoint);

    var profile = _yardiSetting.Profile.FirstOrDefault(x => x.ClientName == _scopeSetting.ClientName);
    var payload = ConvertToSoapXml(requestType, requestInput, profile, endPoint);

    var client = _httpClientFactory.CreateClient("YardiClient");
    var requestEndPoint = requestType switch
    {
        RequestTypeEnum.ResidentData => "ItfResidentData.asmx",
        RequestTypeEnum.ServiceRequest => "ItfServiceRequests.asmx"
    };
    var response = await client.PostAsync($"{profile.RequestUrl}/{requestEndPoint}", new StringContent(payload, Encoding.UTF8, "text/xml"));
```

### 9.2 ONE Service
```50:100:src/ClientModules/DataIntegrationApi/Services/One/OneService.cs
public async Task<string> ExecuteGraphQLQuery(string query, object variables = null)
{
    try
    {
        var token = await GetToken();
        var graphqlRequest = new GraphQLRequest
        {
            Query = query,
            Variables = variables
        };

        var response = await _oneRefitService.ExecuteQuery(graphqlRequest, token);
        return response;
    }
    catch (Exception ex)
    {
        Logger.Error($"[DataIntegration][ExecuteGraphQLQuery] Error: {ex.Message}");
        throw;
    }
}
```

## 10. Complete Flow Summary

### 10.1 Request Processing Pipeline
1. **API Gateway** - Route request to appropriate controller
2. **Controller Layer** - Validate request and resolve profiles
3. **Manager Layer** - Orchestrate business logic
4. **Service Layer** - Handle external API communication
5. **Transformation Layer** - Map data between systems
6. **Response Layer** - Return results with proper error handling

### 10.2 Data Flow Patterns
- **Pull Pattern**: Scheduled synchronization (Yardi → ONE, RealPage → ONE)
- **Push Pattern**: Real-time webhook processing (Yardi → Lessen360)
- **Bidirectional Pattern**: Two-way data exchange (Yardi ↔ ONE)
- **Delta Pattern**: Incremental updates (Insight → ONE)

### 10.3 Integration Types
- **SOAP/XML**: Yardi system integration
- **REST API**: RealPage, Lessen360 integration
- **GraphQL**: ONE system integration
- **Webhooks**: Real-time event processing

This comprehensive flow analysis shows the complete data integration architecture, highlighting the complex interactions between multiple property management systems and the robust processing pipeline within the DataIntegrationApi. 