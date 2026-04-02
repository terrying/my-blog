# ADR-004: Local-First Deployment Strategy

## Status

Accepted

## Context

Moltbot needed a deployment strategy that balances accessibility with data sovereignty requirements. Options considered:

1. **Cloud-First**: Centralized cloud deployment (SaaS model)
2. **Local-First**: On-premise deployment with cloud sync
3. **Hybrid**: Both local and cloud options available
4. **Mobile-First**: Edge deployment on mobile devices

## Decision

We chose a Local-First deployment strategy with optional cloud synchronization.

## Rationale

### Why Local-First for Moltbot

**Data Sovereignty and Privacy**

- User data stays on-premise, addressing privacy concerns
- Compliance with GDPR, CCPA, and other regulations
- Enterprise requirements for data control
- Avoids third-party data sharing risks

**Reliability and Offline Capability**

- System continues operating without internet connectivity
- No dependency on cloud service availability
- Latency benefits of local processing
- Resilience against network interruptions

**Enterprise Integration Requirements**

- Integration with internal systems (AD/LDAP, databases)
- Custom security policies and firewall rules
- Audit and compliance requirements
- Existing infrastructure utilization

### Cloud Synchronization Benefits

- Backup and disaster recovery capabilities
- Multi-site synchronization for distributed teams
- Analytics and insights across deployments
- Simplified updates and maintenance

### Why Other Models Were Rejected

**Pure Cloud-First**

- Privacy concerns for sensitive conversations
- Regulatory compliance challenges
- Dependency on internet connectivity
- Higher long-term operational costs

**Pure Mobile-First**

- Limited computational resources
- Battery life concerns for AI processing
- Screen size limitations for management
- Enterprise deployment challenges

## Implementation Details

### Local Deployment Architecture

```
On-Premise Infrastructure:
├── Gateway Instance (Docker/VM)
├── Local Database (PostgreSQL/SQLite)
├── Redis for Session Management
├── File Storage (Local/Network)
└── Optional Cloud Sync Service
```

### Cloud Synchronization Features

- **Encrypted Data Sync**: End-to-end encryption for cloud data
- **Selective Sync**: Choose which data to synchronize
- **Conflict Resolution**: Automatic merge strategies for conflicts
- **Backup Only Mode**: Cloud storage without active sync

### Deployment Options

**Docker Containers**

- Single command deployment
- Isolated environment
- Easy version management
- Cross-platform compatibility

**Virtual Machines**

- Full operating system control
- Integration with existing VM infrastructure
- Custom networking and security configurations
- Resource isolation guarantees

**Bare Metal**

- Maximum performance
- Hardware utilization
- Custom kernel configurations
- Specialized hardware support (GPUs for AI)

### Installation Process

```bash
# Quick start
curl https://get.moltbot.com/install | sh
moltbot install --channel whatsapp --agent basic

# Advanced setup
moltbot install \
  --config /etc/moltbot/config.yaml \
  --data-dir /var/lib/moltbot \
  --sync-key <encryption-key>
```

## Data Management

### Local Storage Structure

```
/var/lib/moltbot/
├── agents/          # Agent configurations and models
├── channels/        # Channel adapter configs
├── sessions/        # Active session data
├── logs/           # Application logs
└── backups/        # Local backups
```

### Backup Strategy

- **Automated Local Backups**: Daily snapshots
- **Encrypted Cloud Backups**: Optional offsite storage
- **Incremental Backups**: Efficient storage usage
- **Point-in-Time Recovery**: Granular restore options

## Security Considerations

### Network Security

- Default HTTPS/WSS endpoints
- Optional VPN integration
- Firewall configuration guidance
- Certificate management

### Data Protection

- At-rest encryption for all stored data
- In-transit encryption for all communications
- Key management with secure defaults
- Secure key rotation procedures

### Access Control

- Role-based access control (RBAC)
- Multi-factor authentication support
- Integration with enterprise identity providers
- Audit logging for all administrative actions

## Consequences

### Positive Consequences

- Enhanced privacy and data control
- Offline operation capability
- Compliance with enterprise requirements
- Potential performance improvements

### Negative Consequences

- Increased deployment complexity
- Responsibility for updates and maintenance
- Hardware costs for customers
- Support complexity across environments

### Development Considerations

- Testing across multiple deployment scenarios
- Update management and rollback procedures
- Support for heterogeneous environments
- Documentation for self-hosted deployments

## Migration Path

From Local-First to Cloud:

1. Export data with encryption
2. Cloud infrastructure setup
3. Data migration with validation
4. DNS/traffic cutover
5. Local decommissioning

From Cloud to Local-First:

1. Data export from cloud
2. Local infrastructure setup
3. Import encrypted data
4. Validation and testing
5. Traffic migration

## Related Decisions

- [ADR-001: Gateway Architecture vs Microservices](./adr-001-gateway-architecture.md)
- [ADR-005: Plugin Architecture](./adr-005-plugin-architecture.md)
