# ADR-002: Communication Protocol

**Date:** 2026-01-30
**Status:** Accepted

## Context

Moltbot needs a communication protocol between clients and the local gateway. This choice affects how efficiently conversational data flows, how easily new client implementations can be created, and how well the system handles streaming responses typical of AI interactions.

## Options Considered

### Option 1: Custom WebSocket Protocol

**Approach:** Binary WebSocket protocol with message types for commands, responses, streaming chunks, and state synchronization. Optimized specifically for AI conversational patterns.

**Gains:**

- Perfect fit for conversational streaming requirements
- Minimal overhead for rapid bidirectional messaging
- Native support for real-time streaming of AI responses
- Simple connection model (single persistent socket)
- Can be highly compressed for AI-specific data patterns

**Loses:**

- Requires custom client libraries for each platform
- Less familiar to developers than HTTP-based APIs
- Harder to debug with standard web tools
- May require custom proxy/firewall considerations
- Reinventing wheels already solved by web standards

**Fits when:** Real-time bidirectional communication is essential and the control plane is local-first.

### Option 2: Standard REST/gRPC

**Approach:** HTTP-based REST or gRPC APIs with long-polling or server-sent events for streaming. Follows web standards and common patterns.

**Gains:**

- Familiar to most developers
- Excellent tooling and ecosystem support
- Works well with existing web infrastructure
- Standard authentication patterns available
- Easy to document and test

**Loses:**

- Higher overhead for conversational messaging
- More complex streaming implementation
- REST is naturally stateless (conversational state requires workarounds)
- HTTP overhead can be significant for small messages
- Less efficient for high-frequency bidirectional messaging

**Fits when:** Developer ecosystem and standard tooling are more important than optimized conversational flow.

### Option 3: Hybrid Approach

**Approach:** REST for configuration and management, WebSockets for real-time conversational streaming. Uses each protocol for what it's best at.

**Gains:**

- Gets the benefits of both protocols
- REST for standard CRUD operations on configuration
- WebSockets optimized for conversational streaming
- Can adopt incrementally if starting from just one

**Loses:**

- More complex to implement and maintain
- Dual protocol client requirements
- Need to coordinate authentication across both
- Harder to document and reason about

**Fits when:** The system has both significant configuration needs AND high-performance streaming requirements.

## Decision

**Chosen option:** Custom WebSocket Protocol

**Rationale:** The custom WebSocket protocol best serves Moltbot's core use case of real-time conversational AI. This decision is driven by:

1. Conversational AI requires efficient bidirectional streaming that WebSockets provide natively
2. Local-first deployment means we control both client and server, eliminating concerns about ecosystem compatibility
3. Custom protocol can be optimized for AI-specific patterns like thinking token streams, tool use notifications, and partial responses
4. WebSocket's binary frames can efficiently compress the repetitive text patterns common in AI conversations

The protocol can be designed with versioning and extensibility from the start to mitigate reinvention concerns.

## Consequences

### Enables

- Efficient real-time conversational streaming
- Low-latency bidirectional messaging
- Protocol features specifically designed for AI interactions
- Binary compression optimized for text patterns
- Persistent connections reducing handshake overhead

### Constrains

- Requires custom client implementations
- Less familiar to third-party developers
- May need custom debugging tools
- Harder to integrate with standard web infrastructure
- Potential firewall/proxy issues in some networks

### Assumes

- Moltbot controls both client and server implementation
- Conversational streaming is a core requirement
- Performance of real-time messaging outweighs ecosystem benefits
- The team can maintain protocol documentation and client SDKs

## Reversal Cost

**How hard to change:** Hard

**What reversal requires:** Would need to rewrite the entire communication layer on both client and server, implement a new message serialization format, potentially add state management for REST's statelessness, and update all client implementations. The real-time streaming aspects would need to be reimplemented using server-sent events or polling mechanisms.

## Validation

- [x] At least 2 options were genuinely considered
- [x] Trade-offs are explicit (every option loses something)
- [x] Decision rationale references project context, not generic best practices
- [x] Assumptions are identified
- [x] Reversal cost is assessed
