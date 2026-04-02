# ADR-001: Gateway Architecture vs Microservices

## Status

Accepted

## Context

The Moltbot project required a foundational architectural decision on how to structure the system for managing multiple communication channels and AI agents. The team had to choose between:

1. **Gateway Architecture**: Centralized control plane with channel adapters
2. **Microservices Architecture**: Distributed services for each concern

## Decision

We chose the Gateway Architecture pattern for the Moltbot platform.

## Rationale

### Advantages of Gateway Architecture for Moltbot

**Centralized Control**

- Single point of configuration for routing rules
- Unified security and authentication policies
- Consistent API contracts across all channels
- Simplified monitoring and observability

**Operational Simplicity**

- Reduced deployment complexity vs many microservices
- Easier debugging and troubleshooting
- Lower infrastructure overhead for early-stage product
- Faster iteration cycles (evidence in 170 commits in 6 months)

**Channel Management**

- Common abstractions for different messaging platforms
- Session management across channels
- Rate limiting and throttling at gateway level
- Protocol translation between channels and agents

### Why Microservices Was Not Chosen

**Development Complexity**

- Would require coordination across multiple service teams
- Increased deployment and operational overhead
- Slower development velocity (incompatible with rapid iteration)
- Complex inter-service communication patterns

**Current Scale Considerations**

- 43K LOC doesn't yet warrant full microservices complexity
- Single-team development model (inferred from commit patterns)
- Early-stage product prioritizes speed over absolute scalability

## Consequences

### Positive Consequences

- Rapid development cycle maintained
- Simple deployment and operations
- Easy to add new channel adapters
- Centralized security enforcement

### Negative Consequences

- Gateway becomes a potential bottleneck
- Single point of failure for the entire system
- More difficult to scale individual components independently
- Technology choices constrained by gateway implementation

### Migration Path

When Moltbot scales beyond current architecture limits, we can:

1. Extract specific channel adapters as separate services
2. Implement gateway pattern for microservices (API Gateway)
3. Use service mesh for inter-service communication
4. Maintain existing channel adapter interfaces during migration

## Implementation Notes

The Gateway architecture is implemented as:

- **Core Gateway**: Request routing and protocol translation
- **Channel Adapters**: Platform-specific implementations (WhatsApp, Telegram)
- **Agent Runtime**: Plugin-based agent execution environment
- **Security Layer**: Centralized authentication and authorization

## Related Decisions

- [ADR-002: WebSocket Protocol Selection](./adr-002-websocket-protocol.md)
- [ADR-003: Multi-Agent Session Management](./adr-003-session-management.md)
- [ADR-004: Local-First Deployment Strategy](./adr-004-local-first.md)
