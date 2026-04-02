# ADR-003: Multi-Agent Session Management

## Status

Accepted

## Context

With multiple AI agents operating across different channels, Moltbot needed a robust session management strategy to handle:

- Multiple concurrent user sessions
- Cross-channel session continuity
- Agent state isolation
- Session persistence and recovery

Options considered:

1. **Centralized Session Store**: Single Redis/database for all sessions
2. **Distributed Session Cache**: Each node manages local sessions
3. **Hybrid Approach**: Local cache with centralized persistence
4. **Stateless Sessions**: Session data in JWT tokens

## Decision

We selected a Hybrid Approach combining local session caching with centralized persistence.

## Rationale

### Why Hybrid Session Management

**Performance Optimization**

- Local cache provides sub-millisecond access for active sessions
- Reduces database load for frequent session reads
- Enables fast session lookup for message routing
- Critical for real-time AI response requirements

**Reliability and Recovery**

- Centralized persistence ensures session survival across node failures
- Session continuity during deployments and scaling events
- Supports disaster recovery scenarios
- Enables session analytics and debugging

**Scalability Balance**

- Local caching scales horizontally with Gateway instances
- Centralized store provides single source of truth
- Flexible eviction policies based on usage patterns
- Supports both local and cloud deployment models

### Why Other Options Were Rejected

**Purely Centralized (Redis only)**

- Network latency on every session access
- Potential bottleneck under high load
- Single point of failure without complex clustering
- Higher infrastructure costs for large deployments

**Purely Distributed**

- Session data loss during node failures
- Complex session migration between nodes
- Challenges with cross-channel session continuity
- Difficult to implement session analytics

**Stateless Sessions**

- Large token sizes with complex agent states
- Token expiration complexity
- Limited support for session invalidation
- No audit trail for session modifications

## Implementation Details

### Session Data Model

```typescript
interface Session {
  sessionId: string
  userId: string
  channelId: string
  agentId: string
  createdAt: Date
  lastActivity: Date
  context: {
    conversationHistory: Message[]
    agentState: Record<string, any>
    userProfile: Record<string, any>
    channelSpecific: Record<string, any>
  }
  metadata: {
    source: 'whatsapp' | 'telegram' | 'api'
    device: string
    locale: string
  }
}
```

### Local Cache Strategy

- **Memory-based cache** on each Gateway instance
- **LRU eviction** for inactive sessions
- **Size limits** to prevent memory overflow
- **TTL-based expiration** for cleanup

### Centralized Persistence

- **Redis cluster** for high availability
- **JSON serialization** for flexible data structures
- **Async write-behind** for performance
- **Compression** for large session objects

### Session Lifecycle

1. **Session Creation**: Local cache + async write to Redis
2. **Session Access**: Local cache lookup (hit/miss)
3. **Session Update**: Local update + background sync
4. **Session Eviction**: LRU removal + persistence of final state
5. **Session Recovery**: Redis restore on cache miss

## Security and Privacy

### Data Isolation

- Session data encrypted at rest
- Separate Redis databases per tenant
- Access controls for session operations
- Audit logging for session modifications

### Privacy Controls

- Automatic session expiration after inactivity
- Right to be forgotten (session deletion)
- Data minimization in session storage
- GDPR compliance features

## Consequences

### Positive Consequences

- Fast session access for active users
- Resilient to node failures
- Supports cross-channel session continuity
- Enables session analytics and debugging

### Negative Consequences

- Increased implementation complexity
- Potential for cache consistency issues
- Memory overhead for local caching
- Requires careful eviction strategy

### Operational Considerations

- Redis cluster management
- Monitoring cache hit/miss ratios
- Session synchronization during deployments
- Memory usage tracking per instance

## Monitoring and Metrics

Key metrics tracked:

- Session creation/deletion rates
- Cache hit/miss ratios
- Session size distribution
- Redis memory usage
- Session restoration performance

## Related Decisions

- [ADR-001: Gateway Architecture vs Microservices](./adr-001-gateway-architecture.md)
- [ADR-002: WebSocket Protocol Selection](./adr-002-websocket-protocol.md)
- [ADR-004: Local-First Deployment Strategy](./adr-004-local-first.md)
