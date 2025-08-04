# DataIntegrationApi - Sync Scenarios Flow Analysis

## Overview
This document provides detailed visual flow analysis for different sync scenarios when synchronizing data to destination systems in the DataIntegrationApi.

## 1. Yardi → ONE Sync Scenarios

### 1.1 Service Request Sync Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller as YardiToOneController
    participant Manager as YardiToOneManager
    participant YardiService
    participant OneService
    participant Yardi as Yardi System
    participant ONE as ONE System
    participant DB as Database

    Client->>Controller: POST /YardiToONE/SyncServiceRequest
    Note over Controller: 1. Validate SyncPayloadDto
    Note over Controller: 2. Resolve Yardi & ONE Profiles
    Note over Controller: 3. Extract Property Code List
    
    Controller->>Manager: SyncServiceRequest(propertyCodeList)
    
    %% Step 1: Get existing ONE service requests
    Manager->>OneService: GetReactiveWorkOrderList()
    OneService->>ONE: GraphQL Query: Get existing work orders
    ONE-->>OneService: List of existing service requests
    OneService-->>Manager: Dictionary<WoRefNum, ServiceRequestModel>
    
    %% Step 2: Process each property
    loop For each property code
        Manager->>YardiService: GetServiceRequestByDateRange()
        Note over YardiService: Date range: Now - SyncDateRange to Now
        Note over YardiService: Status: YardiWoStatus.Call
        YardiService->>Yardi: SOAP XML Request
        Yardi-->>YardiService: Service request data
        YardiService-->>Manager: List<ServiceRequestModel>
    end
    
    %% Step 3: Data filtering and transformation
    Manager->>Manager: Filter by Priority (Med, High, Emergency)
    Manager->>Manager: Transform Yardi data to ONE format
    Note over Manager: Map status codes, priorities, locations
    
    %% Step 4: Comparison and deduplication
    Manager->>Manager: CompareServiceRequest()
    Note over Manager: Filter out existing service requests
    Manager->>Manager: AssignDefaultCaller()
    Note over Manager: Link to primary residents if caller is null
    
    %% Step 5: Create service requests in ONE
    Manager->>OneService: CreateServiceRequest()
    OneService->>ONE: GraphQL Mutation: Create work orders
    ONE-->>OneService: Created service request IDs
    OneService-->>Manager: Creation results
    
    Manager-->>Controller: Dictionary<WoRefNum, Result>
    Controller-->>Client: Success/Failure summary
```

### 1.2 Attachment Sync Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller as YardiToOneController
    participant Manager as YardiToOneManager
    participant YardiService
    participant OneService
    participant Yardi as Yardi System
    participant ONE as ONE System

    Client->>Controller: POST /YardiToONE/SyncAttachmentUpdateToONE
    Note over Controller: Validate profiles and property codes
    
    Controller->>Manager: SyncAttachmentUpdateToONE(propertyCodeList)
    
    loop For each property code
        %% Step 1: Get attachments from Yardi
        Manager->>YardiService: GetAttachments()
        YardiService->>Yardi: SOAP XML Request for attachments
        Yardi-->>YardiService: Attachment data (XML)
        YardiService-->>Manager: GetServiceRequestAttachmentResponseDto
        
        %% Step 2: Get existing attachments from ONE
        Manager->>OneService: GetAttachments()
        OneService->>ONE: GraphQL Query for existing attachments
        ONE-->>OneService: Existing attachment list
        OneService-->>Manager: GetAttachmentsResponseDto
        
        %% Step 3: Compare and process new attachments
        Manager->>Manager: CompareAndSaveAttachments()
        Note over Manager: Filter new attachments only
        Note over Manager: Transform file names and formats
        
        %% Step 4: Upload attachments to ONE
        loop For each new attachment
            Manager->>OneService: UploadAttachment()
            OneService->>ONE: GraphQL Mutation: Upload file
            ONE-->>OneService: Upload result
            OneService-->>Manager: Upload status
        end
    end
    
    Manager-->>Controller: List<SaveAttachmentsFromYardiToONEResponse>
    Controller-->>Client: Attachment sync summary
```

## 2. RealPage → ONE Sync Scenarios

### 2.1 Location Sync Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller as RealPageToOneController
    participant Manager as RealPageToOneManager
    participant RealPageService
    participant OneService
    participant RealPage as RealPage System
    participant ONE as ONE System

    Client->>Controller: POST /RealPageToOne/SyncLocation
    Note over Controller: Validate RealPage & ONE profiles
    
    loop For each site ID in RealPage profile
        Controller->>Manager: SyncLocation(profile, clientId, auth)
        
        %% Step 1: Get site information
        Manager->>RealPageService: GetSiteList()
        RealPageService->>RealPage: REST API: Get site details
        RealPage-->>RealPageService: Site information
        RealPageService-->>Manager: Site data
        
        %% Step 2: Get unit information
        Manager->>RealPageService: UnitList()
        RealPageService->>RealPage: REST API: Get units
        RealPage-->>RealPageService: Unit list
        RealPageService-->>Manager: Unit data
        
        %% Step 3: Get floor plans
        Manager->>RealPageService: GetFloorPlans()
        RealPageService->>RealPage: REST API: Get floor plans
        RealPage-->>RealPageService: Floor plan data
        RealPageService-->>Manager: Floor plan information
        
        %% Step 4: Transform data
        Manager->>Manager: Transform to ONE format
        Note over Manager: Map addresses, status, amenities
        Note over Manager: Generate location numbers
        
        %% Step 5: Create/Update locations in ONE
        Manager->>OneService: CreateLocation() / UpdateLocation()
        OneService->>ONE: GraphQL Mutation
        ONE-->>OneService: Location creation/update results
        OneService-->>Manager: Operation status
        
        Manager-->>Controller: Sync results
    end
    
    Controller-->>Client: Bulk location sync summary
```

### 2.2 Resident Sync Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller as RealPageToOneController
    participant Manager as RealPageToOneManager
    participant RealPageService
    participant OneService
    participant RealPage as RealPage System
    participant ONE as ONE System

    Client->>Controller: POST /RealPageToOne/SyncResident
    Note over Controller: Validate profiles and site IDs
    
    loop For each site ID
        Controller->>Manager: SyncResident(clientId, auth)
        
        %% Step 1: Get resident information
        Manager->>RealPageService: GetResidentListInfo()
        RealPageService->>RealPage: REST API: Get residents
        RealPage-->>RealPageService: Resident data
        RealPageService-->>Manager: Resident list
        
        %% Step 2: Get lease information
        Manager->>RealPageService: GetLeaseInformation()
        RealPageService->>RealPage: REST API: Get leases
        RealPage-->>RealPageService: Lease data
        RealPageService-->>Manager: Lease information
        
        %% Step 3: Transform resident data
        Manager->>Manager: Transform to ONE format
        Note over Manager: Map personal info, contact details
        Note over Manager: Link residents to locations
        Note over Manager: Handle lease relationships
        
        %% Step 4: Create residents in ONE
        Manager->>OneService: CreateResident()
        OneService->>ONE: GraphQL Mutation: Create residents
        ONE-->>OneService: Resident creation results
        OneService-->>Manager: Operation status
        
        Manager-->>Controller: Resident sync results
    end
    
    Controller-->>Client: Resident sync summary
```

## 3. Insight → ONE Sync Scenarios

### 3.1 Location Sync Flow (Complex Multi-Step)

```mermaid
sequenceDiagram
    participant Client
    participant Controller as InsightToOneController
    participant Manager as InsightToOneManager
    participant InsightService
    participant OneService
    participant Insight as Insight System
    participant ONE as ONE System
    participant DB as Database

    Client->>Controller: POST /InsightToOne/SyncLocation
    Note over Controller: Validate Insight & ONE profiles
    
    %% Step 1: Authentication
    Controller->>InsightService: GetGuid()
    InsightService->>Insight: Authentication request
    Insight-->>InsightService: GUID token
    InsightService-->>Controller: GUID
    
    %% Step 2: Get company list
    Controller->>InsightService: GetCompanyList()
    InsightService->>Insight: GraphQL query: Get companies
    Insight-->>InsightService: Company list
    InsightService-->>Controller: Filtered companies
    
    %% Step 3: Process each company
    loop For each company
        Controller->>Manager: SyncLocation(companies, clientId, profile, params)
        
        %% Step 3a: Get existing ONE locations
        Manager->>DB: Get existing locations by region
        DB-->>Manager: Location numbers
        
        loop For each community in company
            %% Step 3b: Get unit data from Insight
            Manager->>InsightService: GetUnit()
            InsightService->>Insight: GraphQL query: Get units
            Insight-->>InsightService: Unit data
            InsightService-->>Manager: Unit list
            
            %% Step 3c: Transform and create locations
            Manager->>Manager: Transform to ONE format
            Note over Manager: Map addresses, property types
            Note over Manager: Generate location numbers
            
            Manager->>OneService: CreateLocation()
            OneService->>ONE: GraphQL mutation: Create locations
            ONE-->>OneService: Creation results
            OneService-->>Manager: Operation status
        end
        
        Manager-->>Controller: Company sync results
    end
    
    Controller-->>Client: Complete location sync summary
```

### 3.2 Landlord Sync Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller as InsightToOneController
    participant Manager as InsightToOneManager
    participant InsightService
    participant OneService
    participant Insight as Insight System
    participant ONE as ONE System

    Client->>Controller: POST /InsightToOne/SyncLandlord
    Note over Controller: Validate profiles and GUID
    
    %% Step 1: Get landlord information
    Controller->>InsightService: GetLandlordList()
    InsightService->>Insight: GraphQL query: Get landlords
    Insight-->>InsightService: Landlord data
    InsightService-->>Controller: Landlord list
    
    %% Step 2: Process landlords
    loop For each landlord
        Controller->>Manager: SyncLandlord(landlords, clientId, profile, params)
        
        %% Step 2a: Transform landlord data
        Manager->>Manager: Transform to ONE format
        Note over Manager: Map contact info, ownership details
        Note over Manager: Link to properties
        
        %% Step 2b: Create landlords in ONE
        Manager->>OneService: CreateLandlord()
        OneService->>ONE: GraphQL mutation: Create landlords
        ONE-->>OneService: Creation results
        OneService-->>Manager: Operation status
        
        Manager-->>Controller: Landlord sync results
    end
    
    Controller-->>Client: Landlord sync summary
```

## 4. Cross-Platform Sync Scenarios

### 4.1 RealPage → Lessen360 Sync Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller as RealPageToLessen360Controller
    participant Manager as RealPageToLessen360Manager
    participant RealPageService
    participant Lessen360Service
    participant RealPage as RealPage System
    participant Lessen360 as Lessen360 System

    Client->>Controller: POST /RealPageToLessen360/Sync
    Note over Controller: Validate RealPage & Lessen360 profiles
    
    loop For each site ID
        Controller->>Manager: Sync(profile, auth)
        
        %% Step 1: Get RealPage data
        Manager->>RealPageService: GetPropertyData()
        RealPageService->>RealPage: REST API: Get properties
        RealPage-->>RealPageService: Property data
        RealPageService-->>Manager: Property information
        
        %% Step 2: Transform to Lessen360 format
        Manager->>Manager: Transform data
        Note over Manager: Map property fields
        Note over Manager: Convert data formats
        
        %% Step 3: Send to Lessen360
        Manager->>Lessen360Service: CreateProperty()
        Lessen360Service->>Lessen360: REST API: Create property
        Lessen360-->>Lessen360Service: Creation result
        Lessen360Service-->>Manager: Operation status
        
        Manager-->>Controller: Sync results
    end
    
    Controller-->>Client: Cross-platform sync summary
```

### 4.2 Yardi → Lessen360 Webhook Flow

```mermaid
sequenceDiagram
    participant Yardi as Yardi System
    participant Webhook as InboundController
    participant Manager as YardiToLessen360Manager
    participant Lessen360Service
    participant Lessen360 as Lessen360 System

    Yardi->>Webhook: POST /YardiToLessen360/WebHook
    Note over Webhook: Extract headers and payload
    
    %% Step 1: HMAC Validation
    Webhook->>Webhook: Extract AppId, Nonce, Timestamp
    Webhook->>Webhook: Validate HMAC Signature
    Note over Webhook: Security validation
    
    %% Step 2: Process webhook event
    Webhook->>Manager: ProcessWebhookEvent(payload)
    
    %% Step 3: Transform Yardi data
    Manager->>Manager: Transform Yardi data to Lessen360 format
    Note over Manager: Map event types and data fields
    
    %% Step 4: Send to Lessen360
    Manager->>Lessen360Service: ProcessEvent()
    Lessen360Service->>Lessen360: REST API: Process event
    Lessen360-->>Lessen360Service: Processing result
    Lessen360Service-->>Manager: Event status
    
    Manager-->>Webhook: Event processed
    Webhook-->>Yardi: 200 OK Response
```

## 5. Data Transformation Flow Diagrams

### 5.1 Yardi Service Request Transformation

```mermaid
graph TD
    subgraph "Yardi Input Data"
        YARDI_SR[Yardi Service Request<br/>XML Format]
        YARDI_STATUS[Yardi Status<br/>String Values]
        YARDI_PRIORITY[Yardi Priority<br/>String Values]
        YARDI_LOCATION[Yardi Location<br/>Property + Unit]
    end

    subgraph "Transformation Process"
        XML_PARSE[XML Parser<br/>Extract Data]
        STATUS_MAP[Status Mapping<br/>Yardi → ONE]
        PRIORITY_MAP[Priority Mapping<br/>Yardi → ONE]
        LOCATION_GEN[Location Number Generation<br/>Property + Unit]
        CALLER_ASSIGN[Default Caller Assignment<br/>Primary Resident]
    end

    subgraph "ONE Output Data"
        ONE_SR[ONE Service Request<br/>GraphQL Format]
        ONE_STATUS[ONE Status<br/>Enum Values]
        ONE_PRIORITY[ONE Priority<br/>Enum Values]
        ONE_LOCATION[ONE Location<br/>Location Number]
        ONE_CALLER[ONE Caller<br/>Resident Info]
    end

    YARDI_SR --> XML_PARSE
    YARDI_STATUS --> STATUS_MAP
    YARDI_PRIORITY --> PRIORITY_MAP
    YARDI_LOCATION --> LOCATION_GEN

    XML_PARSE --> ONE_SR
    STATUS_MAP --> ONE_STATUS
    PRIORITY_MAP --> ONE_PRIORITY
    LOCATION_GEN --> ONE_LOCATION
    CALLER_ASSIGN --> ONE_CALLER
```

### 5.2 RealPage Location Transformation

```mermaid
graph TD
    subgraph "RealPage Input Data"
        RP_SITE[RealPage Site<br/>Site Information]
        RP_UNIT[RealPage Unit<br/>Unit Details]
        RP_FLOOR[RealPage Floor Plan<br/>Amenities]
        RP_STATUS[RealPage Status<br/>Available/Vacant]
    end

    subgraph "Transformation Process"
        SITE_PARSE[Site Parser<br/>Extract Site Data]
        UNIT_PARSE[Unit Parser<br/>Extract Unit Data]
        FLOOR_PARSE[Floor Plan Parser<br/>Extract Amenities]
        STATUS_MAP[Status Mapping<br/>RealPage → ONE]
        ADDRESS_BUILD[Address Building<br/>Combine Fields]
        LOCATION_GEN[Location Number Generation<br/>Site + Unit]
    end

    subgraph "ONE Output Data"
        ONE_LOCATION[ONE Location<br/>GraphQL Format]
        ONE_ADDRESS[ONE Address<br/>Formatted Address]
        ONE_AMENITIES[ONE Amenities<br/>Bed/Bath Info]
        ONE_STATUS[ONE Status<br/>Active/Inactive]
        ONE_LOC_NUM[ONE Location Number<br/>Unique Identifier]
    end

    RP_SITE --> SITE_PARSE
    RP_UNIT --> UNIT_PARSE
    RP_FLOOR --> FLOOR_PARSE
    RP_STATUS --> STATUS_MAP

    SITE_PARSE --> ONE_LOCATION
    UNIT_PARSE --> ONE_ADDRESS
    FLOOR_PARSE --> ONE_AMENITIES
    STATUS_MAP --> ONE_STATUS
    ADDRESS_BUILD --> ONE_ADDRESS
    LOCATION_GEN --> ONE_LOC_NUM
```

### 5.3 Insight Location Transformation

```mermaid
graph TD
    subgraph "Insight Input Data"
        INSIGHT_COMPANY[Insight Company<br/>Company Information]
        INSIGHT_COMMUNITY[Insight Community<br/>Community Details]
        INSIGHT_UNIT[Insight Unit<br/>Unit Information]
        INSIGHT_ADDRESS[Insight Address<br/>Address Components]
    end

    subgraph "Transformation Process"
        COMPANY_PARSE[Company Parser<br/>Extract Company Data]
        COMMUNITY_PARSE[Community Parser<br/>Extract Community Data]
        UNIT_PARSE[Unit Parser<br/>Extract Unit Data]
        ADDRESS_BUILD[Address Building<br/>Combine Components]
        LOCATION_GEN[Location Number Generation<br/>Unit Key]
        REGION_MAP[Region Mapping<br/>Community Name]
    end

    subgraph "ONE Output Data"
        ONE_LOCATION[ONE Location<br/>GraphQL Format]
        ONE_COMPANY[ONE Company<br/>Group Information]
        ONE_REGION[ONE Region<br/>Community Name]
        ONE_ADDRESS[ONE Address<br/>Formatted Address]
        ONE_LOC_NUM[ONE Location Number<br/>Unit Key]
    end

    INSIGHT_COMPANY --> COMPANY_PARSE
    INSIGHT_COMMUNITY --> COMMUNITY_PARSE
    INSIGHT_UNIT --> UNIT_PARSE
    INSIGHT_ADDRESS --> ADDRESS_BUILD

    COMPANY_PARSE --> ONE_COMPANY
    COMMUNITY_PARSE --> ONE_REGION
    UNIT_PARSE --> ONE_LOCATION
    ADDRESS_BUILD --> ONE_ADDRESS
    LOCATION_GEN --> ONE_LOC_NUM
    REGION_MAP --> ONE_REGION
```

## 6. Error Handling Scenarios

### 6.1 Network Error Handling Flow

```mermaid
sequenceDiagram
    participant Manager
    participant Service
    participant External as External System
    participant Logger

    Manager->>Service: API Call
    Service->>External: HTTP Request
    
    alt Network Error
        External--xService: Connection Timeout
        Service->>Service: Retry Policy (Polly)
        Service->>External: Retry Request
        External--xService: Still Failing
        Service->>Logger: Log Error with Context
        Service-->>Manager: Exception with Details
        Manager->>Logger: Log Business Error
        Manager-->>Controller: Error Response
    else Success
        External-->>Service: Success Response
        Service-->>Manager: Success Result
    end
```

### 6.2 Data Validation Error Flow

```mermaid
sequenceDiagram
    participant Controller
    participant Manager
    participant Validator
    participant Logger

    Controller->>Manager: Process Data
    Manager->>Validator: Validate Input Data
    
    alt Validation Error
        Validator-->>Manager: Validation Errors
        Manager->>Logger: Log Validation Errors
        Manager-->>Controller: Validation Error Response
        Controller->>Logger: Log Controller Error
        Controller-->>Client: Bad Request (400)
    else Valid Data
        Validator-->>Manager: Valid Data
        Manager->>Manager: Process Valid Data
        Manager-->>Controller: Success Result
    end
```

## 7. Performance Optimization Flows

### 7.1 Batch Processing Flow

```mermaid
graph TD
    subgraph "Batch Processing"
        INPUT[Input Data<br/>Large Dataset]
        BATCH_SPLIT[Batch Split<br/>Chunk Data]
        PARALLEL[Parallel Processing<br/>Multiple Batches]
        MERGE[Merge Results<br/>Combine Results]
        OUTPUT[Output Data<br/>Processed Results]
    end

    subgraph "Batch Size Control"
        SIZE_CHECK[Size Check<br/>Validate Batch Size]
        RATE_LIMIT[Rate Limiting<br/>Control API Calls]
        ERROR_HANDLE[Error Handling<br/>Per Batch]
    end

    INPUT --> BATCH_SPLIT
    BATCH_SPLIT --> SIZE_CHECK
    SIZE_CHECK --> PARALLEL
    PARALLEL --> RATE_LIMIT
    RATE_LIMIT --> MERGE
    MERGE --> ERROR_HANDLE
    ERROR_HANDLE --> OUTPUT
```

### 7.2 Caching Strategy Flow

```mermaid
graph TD
    subgraph "Caching Strategy"
        REQUEST[API Request]
        CACHE_CHECK[Cache Check<br/>Look for Cached Data]
        CACHE_HIT{Cache Hit?}
        CACHE_MISS{Cache Miss?}
        FETCH_DATA[Fetch from Source<br/>External System]
        CACHE_STORE[Store in Cache<br/>TTL Control]
        RETURN_DATA[Return Data]
    end

    REQUEST --> CACHE_CHECK
    CACHE_CHECK --> CACHE_HIT
    CACHE_HIT -->|Yes| RETURN_DATA
    CACHE_HIT -->|No| CACHE_MISS
    CACHE_MISS -->|Yes| FETCH_DATA
    FETCH_DATA --> CACHE_STORE
    CACHE_STORE --> RETURN_DATA
```

## 8. Complete Sync Scenario Summary

```mermaid
graph TB
    subgraph "Sync Scenarios Overview"
        YARDI_ONE[Yardi → ONE<br/>Service Requests & Attachments]
        REALPAGE_ONE[RealPage → ONE<br/>Locations & Residents]
        INSIGHT_ONE[Insight → ONE<br/>Locations & Landlords]
        CROSS_PLATFORM[Cross-Platform<br/>RealPage ↔ Lessen360]
        WEBHOOK[Webhook Processing<br/>Yardi → Lessen360]
    end

    subgraph "Data Transformation"
        XML_TO_GRAPHQL[XML → GraphQL<br/>Yardi Transformations]
        JSON_TO_GRAPHQL[JSON → GraphQL<br/>RealPage Transformations]
        GRAPHQL_TO_GRAPHQL[GraphQL → GraphQL<br/>Insight Transformations]
        REST_TO_REST[REST → REST<br/>Cross-Platform Transformations]
    end

    subgraph "Error Handling"
        RETRY[Retry Policies<br/>Network Resilience]
        VALIDATION[Data Validation<br/>Business Rules]
        FALLBACK[Fallback Strategies<br/>Alternative Processing]
    end

    subgraph "Performance"
        BATCHING[Batch Processing<br/>Large Datasets]
        CACHING[Caching Strategy<br/>Response Optimization]
        PARALLEL[Parallel Processing<br/>Concurrent Operations]
    end

    YARDI_ONE --> XML_TO_GRAPHQL
    REALPAGE_ONE --> JSON_TO_GRAPHQL
    INSIGHT_ONE --> GRAPHQL_TO_GRAPHQL
    CROSS_PLATFORM --> REST_TO_REST
    WEBHOOK --> REST_TO_REST

    XML_TO_GRAPHQL --> RETRY
    JSON_TO_GRAPHQL --> VALIDATION
    GRAPHQL_TO_GRAPHQL --> FALLBACK
    REST_TO_REST --> BATCHING

    RETRY --> CACHING
    VALIDATION --> PARALLEL
    FALLBACK --> BATCHING
```

This comprehensive flow analysis shows the detailed sync scenarios for different destination systems, highlighting the specific data transformations, error handling patterns, and performance optimizations used in the DataIntegrationApi. 