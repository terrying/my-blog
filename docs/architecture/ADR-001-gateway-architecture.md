# ADR-001: Gateway Architecture

**Date:** 2026-01-30
**Status:** Accepted

## Context

Moltbot needs a core gateway architecture to manage how users interact with their personal AI assistant. The decision impacts how control flows, where state lives, and how the system scales. The fundamental question is whether to prioritize local-first operation with direct WebSocket connections or adopt a distributed microservices approach.

## Options Considered

### Option 1: Local-first WebSocket Control Plane

**Approach:** Single local gateway with persistent WebSocket connections for real-time bidirectional communication. State lives locally on the user's device.

**Gains:**

- Immediate response times with no network latency
- Full offline capability when disconnected
- Complete user data privacy and control
- Simpler deployment (single binary installation)
- Direct control over resource usage

**Loses:**

- Limited to device resources (CPU, memory)
- Scaling constrained by single machine capabilities
- Harder to provide web-based access from multiple devices
- Updates require client-side installation

**Fits when:** Privacy and offline capability are primary concerns; users operate primarily from a single device.

### Option 2: Distributed Microservices Gateway

**Approach:** Cloud-hosted microservices with REST APIs, load balancing, and stateful services. Communication via HTTP/gRPC with optional WebSockets for streaming.

**Gains:**

- Horizontal scaling capabilities
- Easy multi-device synchronization
- Centralized monitoring and management
- Simpler client applications (thin clients)
- Continuous deployment without user action

**Loses:**

- Internet dependency (no offline mode)
- Privacy concerns with data in the cloud
- Monthly operational costs at scale
- Network latency for all operations
- Complexity of distributed systems

**Fits when:** Multi-device access and scalability are primary concerns; privacy requirements allow cloud hosting.

### Option 3: Hybrid Approach

**Approach:** Local gateway with optional cloud sync. Core functionality local, with opt-in cloud services for backup and cross-device access.

**Gains:**

- Best of both worlds when implemented well
- Gradual migration path to cloud features
- Privacy by default, convenience by choice
- Can work offline with degraded functionality

**Loses:**

- Increased architectural complexity
- Potential sync conflicts and resolution logic
- More development and testing surface area
- Harder to explain to users

**Fits when:** Users want both privacy AND convenience, and the team has resources for the complexity.

## Decision

**Chosen option:** Local-first WebSocket Control Plane

**Rationale:** Moltbot's value proposition centers on personal AI that respects user privacy and works reliably regardless of network conditions. The local-first approach aligns with this mission by:

1. Ensuring user data never leaves their device without explicit consent
2. Providing rock-solid reliability during internet outages
3. Creating a competitive moat in a market of cloud-only solutions
4. Simplifying the initial implementation and reducing operational costs

The WebSocket approach provides the real-time interactivity needed for conversational AI while keeping state management straightforward.

## Consequences

### Enables

- True offline capability for core features
- Instantaneous response times without network delay
- Complete user data sovereignty and privacy
- Simple deployment model for end users
- Predictable resource usage on user's device

### Constrains

- Harder to implement multi-device synchronization
- Performance limited by single device capabilities
- Cannot leverage cloud economics for heavy operations
- More challenging to provide web-only access

### Assumes

- Users have sufficient device resources for AI workloads
- The primary value proposition is privacy and offline capability
- Most users operate primarily from a single main device
- The team can optimize local performance sufficiently

## Reversal Cost

**How hard to change:** Hard

**What reversal requires:** Would need to fundamentally rearchitect the communication layer, migrate existing local state to cloud services, implement authentication and multi-user concerns, and rewrite large portions of the gateway code. The WebSocket protocol would need to be replaced with REST/gRPC equivalents, requiring changes to all client implementations.

## Validation

- [x] At least 2 options were genuinely considered
- [x] Trade-offs are explicit (every option loses something)
- [x] Decision rationale references project context, not generic best practices
- [x] Assumptions are identified
- [x] Reversal cost is assessed
