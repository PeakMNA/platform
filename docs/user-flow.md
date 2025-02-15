# User Flow

### **Over View:**

```mermaid
flowchart LR
    CP[Carmen Platform Access] --> SM[Support Manager]
    CP --> CA[Cluster Admin]
    CP --> ST[Support Team]
    CP --> FS[Finance Staff]
    
    SM --> |Creates| BU[Business Units]
    CA --> |Manages| CU[Cluster Users]
    CA --> |Appoints| BA[BU Admin]
    BA --> |Manages| BUU[BU Users]
```

### Support Manager:

```mermaid
flowchart LR
    SM[Support Manager]
    
    SM --> Review[Customer Review]
    SM --> Setup[Cluster Setup]
    SM --> Monitor[Implementation Oversight]

    Review --> R1[Cluster Requirements]
    Review --> R2[Database Assessment]
    Review --> R3[Resource Planning]

    Setup --> S1[Database Type Selection]
    Setup --> S2[Resource Allocation]
    Setup --> S3[Support Team Assignment]

    Monitor --> M1[Implementation Progress]
    Monitor --> M2[System Health]
    Monitor --> M3[SLA Compliance]

    subgraph Cluster Requirements
        R1 --> CR1[Multi-tenancy needs]
        R1 --> CR2[Integration requirements]
        R1 --> CR3[Performance requirements]
    end

    subgraph Database Selection
        S1 --> DS1[Shared vs Dedicated]
        S1 --> DS2[Schema structure]
        S1 --> DS3[Security configuration]
    end
```

### Support Team:

```mermaid
flowchart LR
    ST[Support Team]
    
    ST --> Init[Cluster Implementation]
    ST --> Config[Base Configuration]
    ST --> Valid[System Validation]

    Init --> I1[Database Setup]
    Init --> I2[Schema Creation]
    Init --> I3[Integration Setup]

    Config --> C1[Security Configuration]
    Config --> C2[Integration Setup]
    Config --> C3[Monitoring Setup]

    Valid --> V1[Performance Testing]
    Valid --> V2[Security Validation]
    Valid --> V3[Integration Testing]

    subgraph Implementation Details
        I1 --> ID1[Environment setup]
        I1 --> ID2[Resource configuration]
        I1 --> ID3[Security implementation]
    end

    subgraph Validation Process
        V1 --> VP1[Load testing]
        V1 --> VP2[Performance metrics]
        V1 --> VP3[System optimization]
    end
```

### Cluster Admin:

```mermaid
flowchart LR
    CA[Cluster Admin]
    
    CA --> Users[Cluster User Management]
    CA --> Admin[Admin Appointment]
    CA --> Monitor[Cluster Monitoring]

    Users --> U1[User Invitation]
    Users --> U2[Role Assignment]
    Users --> U3[Cross-BU Access]

    Admin --> A1[BU Admin Appointment]
    Admin --> A2[Permission Setup]
    Admin --> A3[Access Control]

    Monitor --> M1[Performance Tracking]
    Monitor --> M2[Resource Usage]
    Monitor --> M3[Integration Status]

    subgraph User Management
        U1 --> UM1[Cluster-wide access]
        U1 --> UM2[Permission mapping]
        U1 --> UM3[Access monitoring]
    end

    subgraph Performance Management
        M1 --> PM1[System metrics]
        M1 --> PM2[Resource allocation]
        M1 --> PM3[Health monitoring]
    end
```

### **Finance Team:**

```mermaid
flowchart LR
    FS[Finance Staff]
    
    FS --> Usage[Usage Tracking]
    FS --> Billing[Billing Management]
    FS --> Sub[Subscription Management]

    Usage --> U1[Cluster Usage Tracking]
    Usage --> U2[BU Usage Tracking]
    Usage --> U3[Resource Analysis]

    Billing --> B1[Cluster Level Billing]
    Billing --> B2[BU Level Billing]
    Billing --> B3[Billing Models]

    Sub --> S1[Subscription Setup]
    Sub --> S2[Plan Management]
    Sub --> S3[Renewal Processing]

    B1 --> BC1[Cluster Subscription Fees]
    B1 --> BC2[Shared Resource Charges]
    B1 --> BC3[Platform Services]

    B2 --> BB1[Individual BU Charges]
    B2 --> BB2[Usage-Based Billing]
    B2 --> BB3[Custom Services]

    B3 --> BM1[Hybrid Billing]
    B3 --> BM2[Consolidated Billing]
    B3 --> BM3[Split Billing]

    subgraph Usage Analytics
        U1 --> UA1[Cluster metrics]
        U2 --> UA2[BU metrics]
        U3 --> UA3[Optimization recommendations]
    end

    subgraph Billing Process
        BC1 --> BP1[Base subscription]
        BB1 --> BP2[Individual charges]
        BM1 --> BP3[Billing rules]
    end
```

# Carmen Supply Chain Platform User Flow Documentation

## Overview

The Carmen Supply Chain Platform implements a hierarchical user management system that ensures proper access control and clear separation of responsibilities across different organizational levels. This document outlines the complete user flow, from initial system access to ongoing operations.

## User Hierarchy

```mermaid
flowchart TD
    CP[Carmen Platform]

    subgraph Platform Level
        SM[Support Manager]
        CA[Cluster Admin]
        FS[Finance Staff]
    end

    subgraph Business Unit Level
        BA[BU Admin]
        RU[Regular Users]
    end

    CP --> SM
    CP --> CA
    CP --> FS

    CA --Controls--> BA
    BA --Manages--> RU

    SM --Creates BU--> CA
    FS --Bills--> CA
    FS --Bills--> BA
```

```mermaid
flowchart LR
    subgraph Support Manager Actions
        SM[Support Manager] --> Review[Review Request]
        SM --> Assess[Assess Requirements]
        SM --> DB[Database Decision]
        SM --> BU[Add Business Unit]
    end

    subgraph Cluster Admin Actions
        CA[Cluster Admin] --> Users[Invite Users]
        CA --> Roles[Assign Roles]
        CA --> BUAdmin[Appoint BU Admin]
        CA --> Monitor[Monitor Performance]
    end

    subgraph BU Admin Actions
        BA[BU Admin] --> AddUser[Add Users]
        BA --> SetRole[Set Roles]
        BA --> Config[Configure Settings]
        BA --> Track[Track Operations]
    end

    subgraph Finance Actions
        FS[Finance Staff] --> Usage[Track Usage]
        FS --> Bill[Process Billing]
        FS --> Report[Generate Reports]
        FS --> Sub[Manage Subscriptions]
    end

    subgraph Regular User Actions
        RU[Regular User] --> Tasks[View Tasks]
        RU --> Work[Process Work]
        RU --> Reports[View Reports]
        RU --> Settings[Personal Settings]
    end
```

```mermaid
flowchart TD
    Login[Login]
    Auth[Authentication]
    Access[Access Check]
    System[System Access]

    Login --> Auth
    Auth --> Access
    Access --> System

    System --> SM[Support Manager]
    System --> CA[Cluster Admin]
    System --> BA[BU Admin]
    System --> FS[Finance Staff]
    System --> RU[Regular User]

    subgraph Support Manager Flow
        SM --> ReviewRequest[Review Customer Request]
        ReviewRequest --> DBDecision[Database Decision]
        DBDecision --> AddBU[Add Business Unit]
        AddBU --> AssignSupport[Assign Support Team]
    end

    subgraph Cluster Admin Flow
        CA --> InviteUsers[Invite Cluster Users]
        InviteUsers --> AssignRoles[Assign User Roles]
        AssignRoles --> AppointBUAdmin[Appoint BU Admin]
        AppointBUAdmin --> MonitorPerf[Monitor Performance]
    end

    subgraph BU Admin Flow
        BA --> AddUsers[Add BU Users]
        AddUsers --> SetRoles[Set User Roles]
        SetRoles --> ConfigureBU[Configure Settings]
        ConfigureBU --> ReviewOps[Review Operations]
    end

    subgraph Finance Staff Flow
        FS --> TrackUsage[Track Usage]
        TrackUsage --> ProcessBilling[Process Billing]
        ProcessBilling --> GenerateReports[Generate Reports]
        GenerateReports --> ManageSubs[Manage Subscriptions]
    end

    subgraph Regular User Flow
        RU --> ViewTasks[View Tasks]
        ViewTasks --> ProcessWork[Process Work]
        ProcessWork --> AccessReports[Access Reports]
        AccessReports --> UpdateProfile[Update Profile]
    end
```

### Support Manager

The Support Manager serves as the primary administrator for new customer onboarding and cluster creation. Their responsibilities include:

Initial cluster setup:

- Evaluating customer requirements and determining appropriate database configuration (shared or dedicated)
- Allocating necessary resources for cluster deployment
- Assigning implementation tasks to the Support Team
- Overseeing the implementation process and ensuring compliance with SLA requirements

Business Unit creation:

- Adding new business units to existing clusters
- Configuring initial business unit setup
- Notifying Cluster Admins of new business unit availability
- Validating successful implementation

### Cluster Administrator

The Cluster Administrator manages cluster-level operations and user access. Their key responsibilities include:

User Management:

- Inviting and managing cluster-level users
- Assigning appropriate roles and permissions
- Managing cross-business unit access
- Appointing Business Unit Administrators

Monitoring:

- Tracking cluster performance
- Monitoring resource usage
- Overseeing integration status
- Ensuring security compliance

### Support Team

The Support Team handles technical implementation and system validation:

Implementation:

- Creating and configuring database schemas
- Setting up security parameters
- Implementing integration points
- Configuring monitoring systems

Validation:

- Performing system testing
- Validating security measures
- Testing integrations
- Ensuring performance standards

### Finance Staff

The Finance team manages billing and subscription services across both cluster and business unit levels:

Cluster Level:

- Managing platform subscription fees
- Tracking shared resource usage
- Processing cluster-level billing

Business Unit Level:

- Managing individual BU charges
- Processing usage-based billing
- Handling custom service fees

### Business Unit Administrator

Business Unit Administrators manage their specific business unit operations through the application interface:

User Management:

- Adding business unit users
- Assigning roles within the business unit
- Managing user permissions
- Handling user support

Operations:

- Configuring business unit settings
- Managing workflows
- Monitoring activities
- Generating reports

### Regular Users

Regular users access system features based on their assigned roles and permissions:

Access:

- Logging into the system
- Accessing assigned features
- Viewing relevant reports
- Managing personal settings

## Access Flow

1. Initial Access
The Support Manager creates the cluster and configures initial access for the Cluster Administrator.
2. Cluster Level Access
The Cluster Administrator manages access for cluster-level users and appoints Business Unit Administrators.
3. Business Unit Access
Business Unit Administrators manage access for users within their business units.
4. Regular User Access
Users access the system based on their assigned roles and permissions within their business unit.

## Authentication and Authorization

All users must complete a multi-step authentication process:

1. Login with credentials
2. Authentication verification
3. Access validation
4. Role-based authorization

## Security Controls

The platform implements comprehensive security measures:

1. Role-based access control (RBAC)
2. Multi-factor authentication for administrative access
3. Session management and monitoring
4. Audit logging of all access attempts and changes

## Monitoring and Compliance

The system maintains continuous monitoring of:

1. User activities and access patterns
2. System usage and performance
3. Security events and compliance
4. Audit trail maintenance