# DataIntegrationApi - Complete Flow Graph Analysis

## 1. System Architecture Overview

```mermaid
graph TB
    %% External Systems
    subgraph "External Property Management Systems"
        YARDI[Yardi System<br/>SOAP/XML APIs]
        REALPAGE[RealPage System<br/>REST APIs]
        INSIGHT[Insight System<br/>GraphQL APIs]
        LESSEN360[Lessen360 System<br/>REST APIs]
    end

    %% Internal ONE System
    subgraph "Internal ONE System"
        ONE[ONE Property Management<br/>GraphQL APIs]
        ONE_DB[(ONE Database)]
    end

    %% DataIntegrationApi Core
    subgraph "DataIntegrationApi Processing Pipeline"
        API[API Gateway<br/>Request Routing]
        CONTROLLER[Controller Layer<br/>Request Validation]
        MANAGER[Manager Layer<br/>Business Logic]
        SERVICE[Service Layer<br/>External API Calls]
        TRANSFORM[Transformation Layer<br/>Data Mapping]
        UTILS[Utilities Layer<br/>Common Functions]
    end

    %% Configuration & Support
    subgraph "Configuration & Support"
        CONFIG[Configuration Management<br/>Multi-tenant]
        LOGGING[Structured Logging<br/>Audit Trail]
        MONITORING[Performance Monitoring<br/>Health Checks]
        NOTIFICATIONS[Email Notifications<br/>Alert System]
    end

    %% External Systems Connections
    YARDI -->|SOAP/XML| SERVICE
    REALPAGE -->|REST API| SERVICE
    INSIGHT -->|GraphQL| SERVICE
    LESSEN360 -->|REST API| SERVICE

    %% Internal Flow
    SERVICE --> TRANSFORM
    TRANSFORM --> MANAGER
    MANAGER --> CONTROLLER
    CONTROLLER --> API
    API --> ONE
    ONE --> ONE_DB

    %% Configuration & Support Connections
    CONFIG --> SERVICE
    CONFIG --> MANAGER
    CONFIG --> CONTROLLER
    
    CONTROLLER --> LOGGING
    MANAGER --> LOGGING
    SERVICE --> LOGGING
    
    LOGGING --> MONITORING
    MONITORING --> NOTIFICATIONS
    
    UTILS --> SERVICE
    UTILS --> MANAGER
    UTILS --> TRANSFORM
```

## 2. Detailed Integration Flow Patterns

### 2.1 Yardi ↔ ONE Integration Flow

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
    Note over Controller: Validate Profiles (Yardi + ONE)
    Controller->>Controller: Resolve Property Code List
    
    Controller->>Manager: SyncServiceRequest(propertyCodeList)
    
    %% Get existing ONE service requests
    Manager->>OneService: GetReactiveWorkOrderList()
    OneService->>ONE: GraphQL Query
    ONE-->>OneService: Existing service requests
    OneService-->>Manager: Dictionary of existing requests
    
    %% Process each property
    loop For each property code
        Manager->>YardiService: GetServiceRequestByDateRange()
        YardiService->>Yardi: SOAP XML Request
        Yardi-->>YardiService: Service request data
        YardiService-->>Manager: Transformed service requests
    end
    
    %% Data processing
    Manager->>Manager: CompareServiceRequest()
    Note over Manager: Filter duplicates
    Manager->>Manager: AssignDefaultCaller()
    Note over Manager: Link to primary residents
    
    %% Create service requests
    Manager->>OneService: CreateServiceRequest()
    OneService->>ONE: GraphQL Mutation
    ONE-->>OneService: Created service request IDs
    OneService-->>Manager: Creation results
    
    Manager-->>Controller: Sync results
    Controller-->>Client: Success/Failure summary
```

### 2.2 RealPage ↔ ONE Integration Flow

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
    Note over Controller: Validate Profiles (RealPage + ONE)
    
    loop For each site ID
        Controller->>Manager: SyncLocation(profile, clientId, auth)
        
        %% Get site information
        Manager->>RealPageService: GetSiteList()
        RealPageService->>RealPage: REST API call
        RealPage-->>RealPageService: Site data
        RealPageService-->>Manager: Site information
        
        %% Get unit information
        Manager->>RealPageService: UnitList()
        RealPageService->>RealPage: REST API call
        RealPage-->>RealPageService: Unit data
        RealPageService-->>Manager: Unit information
        
        %% Get floor plans
        Manager->>RealPageService: GetFloorPlans()
        RealPageService->>RealPage: REST API call
        RealPage-->>RealPageService: Floor plan data
        RealPageService-->>Manager: Floor plan information
        
        %% Transform and create locations
        Manager->>Manager: Transform to ONE format
        Manager->>OneService: CreateLocation()
        OneService->>ONE: GraphQL mutation
        ONE-->>OneService: Location creation results
        OneService-->>Manager: Creation status
        
        Manager-->>Controller: Sync results
    end
    
    Controller-->>Client: Bulk sync summary
```

### 2.3 Insight → ONE Integration Flow

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
    Note over Controller: Validate Profiles (Insight + ONE)
    
    %% Authentication
    Controller->>InsightService: GetGuid()
    InsightService->>Insight: Authentication request
    Insight-->>InsightService: GUID token
    InsightService-->>Controller: GUID
    
    %% Get company list
    Controller->>InsightService: GetCompanyList()
    InsightService->>Insight: GraphQL query
    Insight-->>InsightService: Company list
    InsightService-->>Controller: Filtered companies
    
    %% Process each company
    loop For each company
        Controller->>Manager: SyncLocation(companies, clientId, profile, params)
        
        %% Get existing locations
        Manager->>DB: Get existing ONE locations
        DB-->>Manager: Location numbers
        
        loop For each community
            %% Get unit data
            Manager->>InsightService: GetUnit()
            InsightService->>Insight: GraphQL query
            Insight-->>InsightService: Unit data
            InsightService-->>Manager: Transformed units
            
            %% Transform and create
            Manager->>Manager: Transform to ONE format
            Manager->>OneService: CreateLocation()
            OneService->>ONE: GraphQL mutation
            ONE-->>OneService: Creation results
            OneService-->>Manager: Status
        end
        
        Manager-->>Controller: Company sync results
    end
    
    Controller-->>Client: Complete sync summary
```

## 3. Cross-Platform Integration Flows

### 3.1 RealPage ↔ Lessen360 Integration

```mermaid
graph LR
    subgraph "RealPage ↔ Lessen360 Flow"
        RP[RealPage System] -->|Property Data| RP_LESSEN[RealPageToLessen360Manager]
        RP_LESSEN -->|Data Transformation| TRANSFORM[Transform Layer]
        TRANSFORM -->|REST API| LESSEN[Lessen360 System]
        LESSEN -->|Status Updates| RP_LESSEN
        RP_LESSEN -->|Sync Results| RP
    end
```

### 3.2 Yardi ↔ Lessen360 Webhook Flow

```mermaid
sequenceDiagram
    participant Yardi as Yardi System
    participant Webhook as InboundController
    participant Manager as YardiToLessen360Manager
    participant Lessen360 as Lessen360 System

    Yardi->>Webhook: POST /YardiToLessen360/WebHook
    Note over Webhook: HMAC Validation
    
    Webhook->>Webhook: Extract AppId, Nonce, Timestamp
    Webhook->>Webhook: Validate HMAC Signature
    
    Webhook->>Manager: Process Webhook Event
    Manager->>Manager: Transform Yardi Data
    Manager->>Lessen360: REST API Call
    Lessen360-->>Manager: Processing Result
    Manager-->>Webhook: Event Processed
    Webhook-->>Yardi: 200 OK Response
```

## 4. Data Transformation Flow

```mermaid
graph TD
    subgraph "Input Data Sources"
        YARDI_IN[Yardi XML Data<br/>Service Requests, Locations, Residents]
        REALPAGE_IN[RealPage JSON Data<br/>Properties, Units, Residents]
        INSIGHT_IN[Insight GraphQL Data<br/>Companies, Units, Locations]
        LESSEN_IN[Lessen360 REST Data<br/>Properties, Work Orders]
    end

    subgraph "Transformation Layer"
        XML_PARSER[XML Parser<br/>SOAP/XML Processing]
        JSON_PARSER[JSON Parser<br/>REST API Processing]
        GRAPHQL_PARSER[GraphQL Parser<br/>Query Processing]
        AUTO_MAPPER[AutoMapper Profiles<br/>Object Mapping]
        CUSTOM_MAPPER[Custom Field Mapping<br/>Business Logic]
        VALIDATOR[Data Validator<br/>Business Rules]
    end

    subgraph "Output Formats"
        ONE_OUT[ONE GraphQL Format<br/>Mutations & Queries]
        YARDI_OUT[Yardi XML Format<br/>SOAP Requests]
        LESSEN_OUT[Lessen360 REST Format<br/>API Calls]
    end

    subgraph "Data Types"
        LOCATION[Location Data<br/>Properties, Units]
        RESIDENT[Resident Data<br/>Tenants, Occupants]
        SERVICE[Service Request Data<br/>Work Orders, Maintenance]
        ATTACHMENT[Attachment Data<br/>Files, Documents]
    end

    %% Input Processing
    YARDI_IN --> XML_PARSER
    REALPAGE_IN --> JSON_PARSER
    INSIGHT_IN --> GRAPHQL_PARSER
    LESSEN_IN --> JSON_PARSER

    %% Transformation Pipeline
    XML_PARSER --> AUTO_MAPPER
    JSON_PARSER --> AUTO_MAPPER
    GRAPHQL_PARSER --> AUTO_MAPPER

    AUTO_MAPPER --> CUSTOM_MAPPER
    CUSTOM_MAPPER --> VALIDATOR

    %% Output Generation
    VALIDATOR --> ONE_OUT
    VALIDATOR --> YARDI_OUT
    VALIDATOR --> LESSEN_OUT

    %% Data Type Mapping
    ONE_OUT --> LOCATION
    ONE_OUT --> RESIDENT
    ONE_OUT --> SERVICE
    ONE_OUT --> ATTACHMENT
```

## 5. Error Handling & Resilience Flow

```mermaid
graph TD
    subgraph "Request Processing"
        REQUEST[API Request] --> VALIDATE[Input Validation]
        VALIDATE --> PROFILE[Profile Resolution]
        PROFILE --> AUTH[Authentication]
    end

    subgraph "Resilience Layer"
        AUTH --> RETRY[Retry Policy<br/>Configurable Attempts]
        RETRY --> TIMEOUT[Timeout Handler<br/>System-specific Timeouts]
        TIMEOUT --> CIRCUIT[Circuit Breaker<br/>Failure Protection]
    end

    subgraph "Error Handling"
        CIRCUIT --> ERROR_HANDLER[Error Handler<br/>Exception Processing]
        ERROR_HANDLER --> LOGGER[Structured Logging<br/>Context-aware Logging]
        LOGGER --> NOTIFICATION[Email Notification<br/>Alert System]
        ERROR_HANDLER --> FALLBACK[Fallback Strategy<br/>Alternative Processing]
    end

    subgraph "Recovery"
        FALLBACK --> RECOVERY[Recovery Mechanism<br/>Automatic Retry]
        RECOVERY --> RETRY
        NOTIFICATION --> MONITORING[Monitoring Dashboard<br/>Performance Tracking]
    end

    subgraph "Error Types"
        VALIDATION_ERROR[Validation Errors<br/>Input Validation]
        AUTH_ERROR[Authentication Errors<br/>Credential Issues]
        NETWORK_ERROR[Network Errors<br/>Connection Issues]
        BUSINESS_ERROR[Business Logic Errors<br/>Data Processing]
    end

    ERROR_HANDLER --> VALIDATION_ERROR
    ERROR_HANDLER --> AUTH_ERROR
    ERROR_HANDLER --> NETWORK_ERROR
    ERROR_HANDLER --> BUSINESS_ERROR
```

## 6. Configuration Management Flow

```mermaid
graph LR
    subgraph "Configuration Sources"
        APP_SETTINGS[appsettings.json<br/>Base Configuration]
        ENV_VARS[Environment Variables<br/>Runtime Configuration]
        SECRETS[Secret Management<br/>Sensitive Data]
    end

    subgraph "Configuration Objects"
        YARDI_CONFIG[YardiSetting<br/>API Endpoints, Credentials]
        ONE_CONFIG[OneSetting<br/>Domain URL, API Keys]
        REALPAGE_CONFIG[RealPageSetting<br/>PMC ID, License Keys]
        INSIGHT_CONFIG[InsightSetting<br/>Vendor Credentials]
        LESSEN_CONFIG[Lessen360Setting<br/>App IDs, Secrets]
    end

    subgraph "Service Registration"
        DI_CONTAINER[Dependency Injection<br/>Service Registration]
        HTTP_CLIENTS[HTTP Client Factory<br/>Managed Connections]
        POLICIES[Resilience Policies<br/>Retry & Timeout]
    end

    %% Configuration Flow
    APP_SETTINGS --> YARDI_CONFIG
    APP_SETTINGS --> ONE_CONFIG
    APP_SETTINGS --> REALPAGE_CONFIG
    APP_SETTINGS --> INSIGHT_CONFIG
    APP_SETTINGS --> LESSEN_CONFIG

    ENV_VARS --> YARDI_CONFIG
    ENV_VARS --> ONE_CONFIG
    SECRETS --> YARDI_CONFIG
    SECRETS --> ONE_CONFIG

    %% Service Registration
    YARDI_CONFIG --> DI_CONTAINER
    ONE_CONFIG --> DI_CONTAINER
    REALPAGE_CONFIG --> DI_CONTAINER
    INSIGHT_CONFIG --> DI_CONTAINER
    LESSEN_CONFIG --> DI_CONTAINER

    DI_CONTAINER --> HTTP_CLIENTS
    DI_CONTAINER --> POLICIES
```

## 7. API Endpoint Flow Map

```mermaid
graph TD
    subgraph "Main Controller Endpoints"
        SYNC[POST /Sync<br/>General Data Sync] --> COMMON_SYNC[Common Data Sync<br/>Provider/Receiver Pattern]
        SERVER_TIME[GET /GetServerTime<br/>Server Time Validation] --> TIME_VALIDATION[Time Validation<br/>System Health Check]
    end

    subgraph "Yardi Integration Endpoints"
        YARDI_SYNC[POST /YardiToONE/SyncServiceRequest<br/>Service Request Sync] --> YARDI_SERVICE_SYNC[Service Request Processing<br/>Yardi → ONE]
        YARDI_ATTACH[POST /YardiToONE/SyncAttachmentUpdateToONE<br/>Attachment Sync] --> YARDI_ATTACH_SYNC[Attachment Processing<br/>File Upload/Download]
    end

    subgraph "RealPage Integration Endpoints"
        RP_LOCATION[POST /RealPageToOne/SyncLocation<br/>Location Sync] --> RP_LOCATION_SYNC[Location Processing<br/>RealPage → ONE]
        RP_RESIDENT[POST /RealPageToOne/SyncResident<br/>Resident Sync] --> RP_RESIDENT_SYNC[Resident Processing<br/>Tenant Data]
        RP_SERVICE[POST /RealPageToOne/SyncServiceRequest<br/>Service Request Sync] --> RP_SERVICE_SYNC[Service Request Processing<br/>Work Orders]
    end

    subgraph "Insight Integration Endpoints"
        INSIGHT_LOCATION[POST /InsightToOne/SyncLocation<br/>Location Sync] --> INSIGHT_LOCATION_SYNC[Location Processing<br/>Insight → ONE]
        INSIGHT_LANDLORD[POST /InsightToOne/SyncLandlord<br/>Landlord Sync] --> INSIGHT_LANDLORD_SYNC[Landlord Processing<br/>Owner Data]
        INSIGHT_DELTA[POST /InsightToOne/SyncLocationByDeltaDate<br/>Delta Sync] --> INSIGHT_DELTA_SYNC[Delta Processing<br/>Incremental Updates]
    end

    subgraph "Cross-Platform Endpoints"
        RP_LESSEN[POST /RealPageToLessen360/Sync<br/>RealPage → Lessen360] --> RP_LESSEN_SYNC[Cross-Platform Sync<br/>Property Data Exchange]
        YARDI_LESSEN[POST /YardiToLessen360/WebHook<br/>Yardi → Lessen360] --> YARDI_LESSEN_SYNC[Webhook Processing<br/>Real-time Events]
        ONE_YARDI[POST /ONEtoYardi/Sync<br/>ONE → Yardi] --> ONE_YARDI_SYNC[Bidirectional Sync<br/>Status Updates]
    end

    subgraph "Inbound Webhooks"
        INBOUND[DataIntegrationInboundController<br/>Webhook Processing] --> WEBHOOK_PROCESSING[Webhook Validation<br/>HMAC Authentication]
        WEBHOOK_PROCESSING --> HMAC_VALIDATION[HMAC Validation<br/>Security Check]
        HMAC_VALIDATION --> REAL_TIME_SYNC[Real-time Sync<br/>Event Processing]
    end
```

## 8. Data Flow Summary

```mermaid
graph TB
    subgraph "Data Sources"
        YARDI_SOURCE[Yardi System<br/>SOAP/XML APIs<br/>Service Requests, Locations, Residents]
        REALPAGE_SOURCE[RealPage System<br/>REST APIs<br/>Properties, Units, Residents]
        INSIGHT_SOURCE[Insight System<br/>GraphQL APIs<br/>Companies, Units, Locations]
        LESSEN_SOURCE[Lessen360 System<br/>REST APIs<br/>Properties, Work Orders]
    end

    subgraph "DataIntegrationApi Processing"
        API_GATEWAY[API Gateway<br/>Request Routing<br/>Authentication]
        CONTROLLER_LAYER[Controller Layer<br/>Request Validation<br/>Profile Resolution]
        MANAGER_LAYER[Manager Layer<br/>Business Logic<br/>Orchestration]
        SERVICE_LAYER[Service Layer<br/>External API Calls<br/>Protocol Handling]
        TRANSFORM_LAYER[Transformation Layer<br/>Data Mapping<br/>Format Conversion]
    end

    subgraph "Data Destinations"
        ONE_DEST[ONE System<br/>GraphQL APIs<br/>Mutations & Queries]
        YARDI_DEST[Yardi System<br/>SOAP/XML APIs<br/>Status Updates]
        LESSEN_DEST[Lessen360 System<br/>REST APIs<br/>Real-time Updates]
    end

    subgraph "Supporting Systems"
        LOGGING[Structured Logging<br/>Audit Trail<br/>Performance Tracking]
        MONITORING[Performance Monitoring<br/>Health Checks<br/>Alert System]
        NOTIFICATIONS[Email Notifications<br/>Error Alerts<br/>Status Reports]
        CONFIG[Configuration Management<br/>Multi-tenant<br/>System Settings]
    end

    %% Data Flow Connections
    YARDI_SOURCE --> SERVICE_LAYER
    REALPAGE_SOURCE --> SERVICE_LAYER
    INSIGHT_SOURCE --> SERVICE_LAYER
    LESSEN_SOURCE --> SERVICE_LAYER

    SERVICE_LAYER --> TRANSFORM_LAYER
    TRANSFORM_LAYER --> MANAGER_LAYER
    MANAGER_LAYER --> CONTROLLER_LAYER
    CONTROLLER_LAYER --> API_GATEWAY

    API_GATEWAY --> ONE_DEST
    API_GATEWAY --> YARDI_DEST
    API_GATEWAY --> LESSEN_DEST

    %% Supporting System Connections
    CONTROLLER_LAYER --> LOGGING
    MANAGER_LAYER --> LOGGING
    SERVICE_LAYER --> LOGGING

    LOGGING --> MONITORING
    MONITORING --> NOTIFICATIONS

    CONFIG --> SERVICE_LAYER
    CONFIG --> MANAGER_LAYER
    CONFIG --> CONTROLLER_LAYER
```

## 9. Key Integration Patterns

### 9.1 Pull Pattern (Scheduled Sync)
```mermaid
graph LR
    subgraph "Pull Pattern - Scheduled Synchronization"
        SCHEDULER[Scheduler<br/>Cron Jobs] --> TRIGGER[Trigger<br/>Sync Request]
        TRIGGER --> PULL[Pull Data<br/>From Source System]
        PULL --> TRANSFORM[Transform<br/>Data Mapping]
        TRANSFORM --> PUSH[Push Data<br/>To Target System]
        PUSH --> LOG[Log Results<br/>Success/Failure]
    end
```

### 9.2 Push Pattern (Real-time Sync)
```mermaid
graph LR
    subgraph "Push Pattern - Real-time Webhook"
        EVENT[Event<br/>Data Change] --> WEBHOOK[Webhook<br/>HTTP POST]
        WEBHOOK --> VALIDATE[Validate<br/>HMAC Signature]
        VALIDATE --> PROCESS[Process<br/>Event Data]
        PROCESS --> TRANSFORM[Transform<br/>Data Mapping]
        TRANSFORM --> UPDATE[Update<br/>Target System]
        UPDATE --> ACK[Acknowledge<br/>Success Response]
    end
```

### 9.3 Bidirectional Pattern (Two-way Sync)
```mermaid
graph LR
    subgraph "Bidirectional Pattern - Two-way Sync"
        SYSTEM_A[System A<br/>Source] --> SYNC_A[Sync A→B<br/>Data Transfer]
        SYNC_A --> SYSTEM_B[System B<br/>Target]
        SYSTEM_B --> SYNC_B[Sync B→A<br/>Status Updates]
        SYNC_B --> SYSTEM_A
    end
```

### 9.4 Delta Pattern (Incremental Updates)
```mermaid
graph LR
    subgraph "Delta Pattern - Incremental Updates"
        LAST_SYNC[Last Sync<br/>Timestamp] --> QUERY[Query<br/>Modified Records]
        QUERY --> FILTER[Filter<br/>Date Range]
        FILTER --> TRANSFORM[Transform<br/>Changed Data]
        TRANSFORM --> UPDATE[Update<br/>Target System]
        UPDATE --> STORE[Store<br/>New Timestamp]
    end
```

## 10. Complete Flow Summary

This comprehensive flow graph analysis shows the complete data integration architecture of the DataIntegrationApi, highlighting:

### **Key Components:**
1. **Multi-System Integration** - Yardi, RealPage, Insight, Lessen360, ONE
2. **Protocol Support** - SOAP/XML, REST API, GraphQL, Webhooks
3. **Data Transformation** - Complex mapping between different system formats
4. **Error Handling** - Comprehensive retry, timeout, and circuit breaker patterns
5. **Configuration Management** - Multi-tenant, system-specific settings
6. **Monitoring & Logging** - Complete audit trail and performance tracking

### **Integration Patterns:**
- **Pull Pattern** - Scheduled synchronization for bulk data
- **Push Pattern** - Real-time webhook processing for immediate updates
- **Bidirectional Pattern** - Two-way data exchange between systems
- **Delta Pattern** - Incremental updates for efficiency

### **Data Flow:**
- **Source Systems** → **Service Layer** → **Transformation Layer** → **Manager Layer** → **Controller Layer** → **API Gateway** → **Target Systems**

This architecture provides a robust, scalable, and maintainable solution for complex data synchronization between multiple property management systems. 