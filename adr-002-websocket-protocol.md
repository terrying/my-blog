# ADR-002: WebSocket Protocol Selection

## Status

Accepted

## Context

For real-time communication between the Gateway, channel adapters, and agents, Moltbot needed a bidirectional communication protocol. The main options considered were:

1. **WebSockets**: Full-duplex, persistent connections
2. **HTTP Long Polling**: Request-response with extended connections
3. **Server-Sent Events (SSE)**: Unidirectional server-to-client
4. **WebRTC**: Peer-to-peer real-time communication

## Decision

We selected WebSockets as the primary communication protocol for Moltbot's real-time interactions.

## Rationale

### Why WebSockets Fit Moltbot's Requirements

**Bidirectional Communication**

- Agents need to send and receive messages simultaneously
- Real-time status updates from channels to agents
- Gateway can push configuration changes to active sessions
- Supports conversational AI patterns effectively

**Low Latency**

- Sub-millisecond overhead after connection establishment
- Critical for responsive AI interactions
- No repeated TCP handshake overhead
- Efficient message framing

**Ecosystem Maturity**

- Wide support across all major platforms
- Mature libraries in Node.js/TypeScript ecosystem
- Extensive documentation and tooling
- Enterprise-grade deployment options

### Why Other Options Were Rejected

**HTTP Long Polling**

- Higher latency due to connection cycles
- More resource-intensive on server side
- Complex timeout and error handling
- Not suitable for sustained conversations

**Server-Sent Events**

- Unidirectional only (server to client)
- Insufficient for two-way agent interactions
- Would require separate channel for client-to-server
- Limited browser support on older platforms

**WebRTC**

- Over-complexity for text-based messaging
- Primarily designed for media streaming
- NAT traversal complexity
- Limited WebSocket benefits for text scenarios

## Implementation Details

### WebSocket Architecture

```
Channel Adapter <--WebSocket--> Gateway <--WebSocket--> Agent Runtime
```

### Connection Management

- Connection pooling at Gateway level
- Automatic reconnection with exponential backoff
- Health checks and heartbeat messages
- Graceful degradation to HTTP when WebSocket unavailable

### Message Protocol

```json
{
  "type": "message|status|config|error",
  "channelId": "whatsapp|telegram|...",
  "sessionId": "unique-session-id",
  "timestamp": "ISO-8601",
  "payload": { ... }
}
```

### Security Considerations

- WSS (WebSocket Secure) enforced in production
- JWT-based authentication during handshake
- Rate limiting per connection
- Message size limits to prevent abuse

## Consequences

### Positive Consequences

- Real-time AI responses with minimal latency
- Efficient for sustained conversations
- Native support for push notifications
- Simplified state management across channels

### Negative Consequences

- Connection state management complexity
- Memory overhead for persistent connections
- NAT traversal challenges in some enterprise environments
- Requires careful resource cleanup to prevent leaks

### Monitoring and Observability

Connection metrics tracked:

- Active connections per channel
- Message throughput rates
- Connection lifecycle events
- Error rates and reconnection attempts

## Scalability Considerations

### Horizontal Scaling

- WebSocket connections can be distributed across instances
- Session affinity using consistent hashing
- State can be externalized to Redis/memory stores
- Load balancer support for WebSocket upgrade

### Performance Optimization

- Message batching for high-throughput scenarios
- Binary protocol option for future performance needs
- Connection multiplexing for multiple sessions
- Adaptive compression based on message content

## Related Decisions

- [ADR-001: Gateway Architecture vs Microservices](./adr-001-gateway-architecture.md)
- [ADR-003: Multi-Agent Session Management](./adr-003-session-management.md)
