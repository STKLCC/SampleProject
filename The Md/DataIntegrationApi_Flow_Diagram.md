# DataIntegrationApi - Complete Flow Diagram

## System Architecture Overview

```mermaid
graph TB
    %% External Systems
    subgraph "External Property Management Systems"
        YARDI[Yardi System]
        REALPAGE[RealPage System]
        INSIGHT[Insight System]
        LESSEN360[Lessen360 System]
    end

    %% Internal ONE System
    subgraph "Internal ONE System"
        ONE[ONE Property Management]
        ONE_DB[(ONE Database)]
    end

    %% DataIntegrationApi Core
    subgraph "DataIntegrationApi"
        API[API Gateway]
        CONTROLLERS[Controllers Layer]
        MANAGERS[Managers Layer]
        SERVICES[Services Layer]
        UTILS[Utilities Layer]
        CONFIG[Configuration]
    end

    %% External Systems Connections
    YARDI -->|SOAP/XML| SERVICES
    REALPAGE -->|REST API| SERVICES
    INSIGHT -->|GraphQL| SERVICES
    LESSEN360 -->|REST API| SERVICES

    %% Internal Flow
    SERVICES --> MANAGERS
    MANAGERS --> CONTROLLERS
    CONTROLLERS --> API
    API --> ONE
    ONE --> ONE_DB

    %% Configuration
    CONFIG --> SERVICES
    CONFIG --> MANAGERS
    CONFIG --> CONTROLLERS

    %% Utilities
    UTILS --> SERVICES
    UTILS --> MANAGERS
```

## Detailed Integration Flows

### 1. Yardi ↔ ONE Integration Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller as YardiToOneController
    participant Manager as YardiToOneManager
    participant YardiService
    participant OneService
    participant Yardi as Yardi System
    participant ONE as ONE System

    Client->>Controller: POST /YardiToONE/SyncServiceRequest
    Controller->>Controller: Validate Profiles (Yardi + ONE)
    Controller->>Manager: SyncServiceRequest(propertyCodeList)
    
    Manager->>OneService: GetReactiveWorkOrderList()
    OneService->>ONE: Query existing service requests
    ONE-->>OneService: Return existing requests
    OneService-->>Manager: Dictionary of existing requests

    loop For each property code
        Manager->>YardiService: GetServiceRequestByDateRange()
        YardiService->>Yardi: SOAP XML Request
        Yardi-->>YardiService: Service request data
        YardiService-->>Manager: Transformed service requests
    end

    Manager->>Manager: CompareServiceRequest()
    Manager->>Manager: AssignDefaultCaller()
    Manager->>OneService: CreateServiceRequest()
    OneService->>ONE: GraphQL mutation
    ONE-->>OneService: Created service request IDs
    OneService-->>Manager: Creation results
    Manager-->>Controller: Sync results
    Controller-->>Client: Success/Failure summary
```

### 2. RealPage ↔ ONE Integration Flow

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
    Controller->>Controller: Validate Profiles (RealPage + ONE)
    
    loop For each site ID
        Controller->>Manager: SyncLocation(profile, clientId, auth)
        Manager->>RealPageService: GetPropertyList()
        RealPageService->>RealPage: REST API call
        RealPage-->>RealPageService: Property data
        RealPageService-->>Manager: Transformed location data
        
        Manager->>OneService: CreateLocation()
        OneService->>ONE: GraphQL mutation
        ONE-->>OneService: Location creation results
        OneService-->>Manager: Creation status
        Manager-->>Controller: Sync results
    end
    
    Controller-->>Client: Bulk sync summary
```

### 3. Insight → ONE Integration Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller as InsightToOneController
    participant Manager as InsightToOneManager
    participant InsightService
    participant OneService
    participant Insight as Insight System
    participant ONE as ONE System

    Client->>Controller: POST /InsightToOne/SyncLocation
    Controller->>Controller: Validate Profiles (Insight + ONE)
    
    Controller->>InsightService: GetGuid()
    InsightService->>Insight: Authentication request
    Insight-->>InsightService: GUID token
    InsightService-->>Controller: GUID
    
    Controller->>InsightService: GetCompanyList()
    InsightService->>Insight: GraphQL query
    Insight-->>InsightService: Company list
    InsightService-->>Controller: Filtered companies
    
    loop For each company
        Controller->>Manager: SyncLocation(companies, clientId, profile, params)
        
        loop For each community
            Manager->>InsightService: GetUnit()
            InsightService->>Insight: GraphQL query
            Insight-->>InsightService: Unit data
            InsightService-->>Manager: Transformed units
            
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

### 4. Cross-Platform Integration Flows

```mermaid
graph LR
    subgraph "RealPage ↔ Lessen360"
        RP[RealPage] -->|Property Data| RP_LESSEN[RealPageToLessen360Manager]
        RP_LESSEN -->|Transformed Data| LESSEN[Lessen360]
        LESSEN -->|Updates| RP_LESSEN
        RP_LESSEN -->|Sync Results| RP
    end

    subgraph "Yardi ↔ Lessen360"
        YARDI[Yardi] -->|Webhook Events| YARDI_LESSEN[YardiToLessen360Manager]
        YARDI_LESSEN -->|Real-time Sync| LESSEN[Lessen360]
        LESSEN -->|Status Updates| YARDI_LESSEN
        YARDI_LESSEN -->|Confirmation| YARDI
    end

    subgraph "ONE ↔ Yardi"
        ONE[ONE] -->|Service Requests| ONE_YARDI[OneToYardiManager]
        ONE_YARDI -->|Transformed Data| YARDI[Yardi]
        YARDI -->|Updates| ONE_YARDI
        ONE_YARDI -->|Sync Results| ONE
    end
```

## Data Transformation Flow

```mermaid
graph TD
    subgraph "Input Data Sources"
        YARDI_IN[Yardi XML Data]
        REALPAGE_IN[RealPage JSON Data]
        INSIGHT_IN[Insight GraphQL Data]
        LESSEN_IN[Lessen360 REST Data]
    end

    subgraph "Transformation Layer"
        XML_PARSER[XML Parser]
        JSON_PARSER[JSON Parser]
        GRAPHQL_PARSER[GraphQL Parser]
        AUTO_MAPPER[AutoMapper Profiles]
        CUSTOM_MAPPER[Custom Field Mapping]
    end

    subgraph "Output Formats"
        ONE_OUT[ONE GraphQL Format]
        YARDI_OUT[Yardi XML Format]
        LESSEN_OUT[Lessen360 REST Format]
    end

    YARDI_IN --> XML_PARSER
    REALPAGE_IN --> JSON_PARSER
    INSIGHT_IN --> GRAPHQL_PARSER
    LESSEN_IN --> JSON_PARSER

    XML_PARSER --> AUTO_MAPPER
    JSON_PARSER --> AUTO_MAPPER
    GRAPHQL_PARSER --> AUTO_MAPPER

    AUTO_MAPPER --> CUSTOM_MAPPER
    CUSTOM_MAPPER --> ONE_OUT
    CUSTOM_MAPPER --> YARDI_OUT
    CUSTOM_MAPPER --> LESSEN_OUT
```

## Error Handling & Resilience Flow

```mermaid
graph TD
    subgraph "Request Processing"
        REQUEST[API Request] --> VALIDATE[Input Validation]
        VALIDATE --> PROFILE[Profile Resolution]
        PROFILE --> AUTH[Authentication]
    end

    subgraph "Resilience Layer"
        AUTH --> RETRY[Retry Policy]
        RETRY --> TIMEOUT[Timeout Handler]
        TIMEOUT --> CIRCUIT[Circuit Breaker]
    end

    subgraph "Error Handling"
        CIRCUIT --> ERROR_HANDLER[Error Handler]
        ERROR_HANDLER --> LOGGER[Structured Logging]
        LOGGER --> NOTIFICATION[Email Notification]
        ERROR_HANDLER --> FALLBACK[Fallback Strategy]
    end

    subgraph "Recovery"
        FALLBACK --> RECOVERY[Recovery Mechanism]
        RECOVERY --> RETRY
        NOTIFICATION --> MONITORING[Monitoring Dashboard]
    end
```

## Configuration Management Flow

```mermaid
graph LR
    subgraph "Configuration Sources"
        APP_SETTINGS[appsettings.json]
        ENV_VARS[Environment Variables]
        SECRETS[Secret Management]
    end

    subgraph "Configuration Objects"
        YARDI_CONFIG[YardiSetting]
        ONE_CONFIG[OneSetting]
        REALPAGE_CONFIG[RealPageSetting]
        INSIGHT_CONFIG[InsightSetting]
        LESSEN_CONFIG[Lessen360Setting]
    end

    subgraph "Service Registration"
        DI_CONTAINER[Dependency Injection]
        HTTP_CLIENTS[HTTP Client Factory]
        POLICIES[Resilience Policies]
    end

    APP_SETTINGS --> YARDI_CONFIG
    APP_SETTINGS --> ONE_CONFIG
    APP_SETTINGS --> REALPAGE_CONFIG
    APP_SETTINGS --> INSIGHT_CONFIG
    APP_SETTINGS --> LESSEN_CONFIG

    ENV_VARS --> YARDI_CONFIG
    ENV_VARS --> ONE_CONFIG
    SECRETS --> YARDI_CONFIG
    SECRETS --> ONE_CONFIG

    YARDI_CONFIG --> DI_CONTAINER
    ONE_CONFIG --> DI_CONTAINER
    REALPAGE_CONFIG --> DI_CONTAINER
    INSIGHT_CONFIG --> DI_CONTAINER
    LESSEN_CONFIG --> DI_CONTAINER

    DI_CONTAINER --> HTTP_CLIENTS
    DI_CONTAINER --> POLICIES
```

## API Endpoint Flow Map

```mermaid
graph TD
    subgraph "Main Controller Endpoints"
        SYNC[POST /Sync] --> COMMON_SYNC[Common Data Sync]
        SERVER_TIME[GET /GetServerTime] --> TIME_VALIDATION[Server Time Validation]
    end

    subgraph "Yardi Integration Endpoints"
        YARDI_SYNC[POST /YardiToONE/SyncServiceRequest] --> YARDI_SERVICE_SYNC[Service Request Sync]
        YARDI_ATTACH[POST /YardiToONE/SyncAttachmentUpdateToONE] --> YARDI_ATTACH_SYNC[Attachment Sync]
    end

    subgraph "RealPage Integration Endpoints"
        RP_LOCATION[POST /RealPageToOne/SyncLocation] --> RP_LOCATION_SYNC[Location Sync]
        RP_RESIDENT[POST /RealPageToOne/SyncResident] --> RP_RESIDENT_SYNC[Resident Sync]
        RP_SERVICE[POST /RealPageToOne/SyncServiceRequest] --> RP_SERVICE_SYNC[Service Request Sync]
    end

    subgraph "Insight Integration Endpoints"
        INSIGHT_LOCATION[POST /InsightToOne/SyncLocation] --> INSIGHT_LOCATION_SYNC[Location Sync]
        INSIGHT_LANDLORD[POST /InsightToOne/SyncLandlord] --> INSIGHT_LANDLORD_SYNC[Landlord Sync]
        INSIGHT_DELTA[POST /InsightToOne/SyncLocationByDeltaDate] --> INSIGHT_DELTA_SYNC[Delta Sync]
    end

    subgraph "Cross-Platform Endpoints"
        RP_LESSEN[POST /RealPageToLessen360/Sync] --> RP_LESSEN_SYNC[RealPage to Lessen360]
        YARDI_LESSEN[POST /YardiToLessen360/WebHook] --> YARDI_LESSEN_SYNC[Yardi to Lessen360 Webhook]
        ONE_YARDI[POST /ONEtoYardi/Sync] --> ONE_YARDI_SYNC[ONE to Yardi]
    end

    subgraph "Inbound Webhooks"
        INBOUND[DataIntegrationInboundController] --> WEBHOOK_PROCESSING[Webhook Processing]
        WEBHOOK_PROCESSING --> HMAC_VALIDATION[HMAC Validation]
        HMAC_VALIDATION --> REAL_TIME_SYNC[Real-time Sync]
    end
```

## Data Flow Summary

```mermaid
graph TB
    subgraph "Data Sources"
        YARDI_SOURCE[Yardi System<br/>SOAP/XML APIs]
        REALPAGE_SOURCE[RealPage System<br/>REST APIs]
        INSIGHT_SOURCE[Insight System<br/>GraphQL APIs]
        LESSEN_SOURCE[Lessen360 System<br/>REST APIs]
    end

    subgraph "DataIntegrationApi Processing"
        API_GATEWAY[API Gateway<br/>Request Routing]
        CONTROLLER_LAYER[Controller Layer<br/>Request Validation]
        MANAGER_LAYER[Manager Layer<br/>Business Logic]
        SERVICE_LAYER[Service Layer<br/>External API Calls]
        TRANSFORM_LAYER[Transformation Layer<br/>Data Mapping]
    end

    subgraph "Data Destinations"
        ONE_DEST[ONE System<br/>GraphQL APIs]
        YARDI_DEST[Yardi System<br/>SOAP/XML APIs]
        LESSEN_DEST[Lessen360 System<br/>REST APIs]
    end

    subgraph "Supporting Systems"
        LOGGING[Structured Logging<br/>Audit Trail]
        MONITORING[Performance Monitoring<br/>Health Checks]
        NOTIFICATIONS[Email Notifications<br/>Alert System]
        CONFIG[Configuration Management<br/>Multi-tenant]
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

## Key Integration Patterns

### 1. **Pull Pattern** (Scheduled Sync)
- Yardi → ONE: Scheduled service request synchronization
- RealPage → ONE: Periodic location/resident sync
- Insight → ONE: Batch location/landlord sync

### 2. **Push Pattern** (Real-time Sync)
- Yardi → Lessen360: Webhook-based real-time updates
- ONE → Yardi: Immediate service request updates
- ONE → RealPage: Real-time data propagation

### 3. **Bidirectional Pattern** (Two-way Sync)
- Yardi ↔ ONE: Service requests and attachments
- RealPage ↔ Lessen360: Property and resident data
- ONE ↔ Yardi: Work order status updates

### 4. **Delta Sync Pattern** (Incremental Updates)
- Insight → ONE: Date-based incremental sync
- Yardi → ONE: Modified date filtering
- RealPage → ONE: Change-based synchronization

This comprehensive flow diagram shows the complete data integration architecture, highlighting the complex interactions between multiple property management systems and the robust processing pipeline within the DataIntegrationApi. 