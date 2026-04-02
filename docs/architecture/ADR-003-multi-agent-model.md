# ADR-003: Multi-Agent Model

**Date:** 2026-01-30
**Status:** Accepted

## Context

Moltbot needs to handle multiple concurrent conversations, potentially with different personas, contexts, or specialized knowledge domains. The multi-agent model decision affects how user sessions are isolated, how resources are managed, and how the system scales to handle multiple simultaneous interactions.

## Options Considered

### Option 1: Session Isolation with Independent Agents

**Approach:** Each conversation spawns a separate agent instance with isolated memory, context, and resources. Sessions don't interact unless explicitly linked.

**Gains:**

- Strong isolation between different conversation contexts
- Memory and resource constraints per session are clear
- Easier to reason about and debug individual conversations
- Can run different AI models per session if needed
- Simpler security and permission model

**Loses:**

- Higher memory usage with multiple concurrent sessions
- Duplication of shared knowledge and model loading
- Harder to share context between related conversations
- More complex session lifecycle management
- Potential resource contention on local hardware

**Fits when:** Privacy between sessions is critical and hardware resources are sufficient.

### Option 2: Centralized Processing with Session Routing

**Approach:** Single central agent that manages multiple conversations through context switching and routing. Shared memory and model instances.

**Gains:**

- More efficient resource utilization (shared model, common knowledge)
- Lower memory footprint for multiple sessions
- Easier to share context between related conversations
- Simpler monitoring and debugging at system level
- Better for resource-constrained environments

**Loses:**

- More complex internal state management
- Risk of context bleeding between conversations
- Harder to apply different models or configurations per session
- Single point of failure for all conversations
- More complex permission management within shared space

**Fits when:** Resource efficiency is critical and the team can implement robust isolation mechanisms.

### Option 3: Hybrid Model with Specialized Agents

**Approach:** Core agent for general conversations plus specialized agents for specific domains (code, writing, analysis). Intelligent routing determines which agent handles each request.

**Gains:**

- Optimized performance for specialized tasks
- Can use different models optimized for specific domains
- Better accuracy for specialized use cases
- Modular development approach
- Users get "best of breed" for different needs

**Loses:**

- Complex routing and handoff logic
- More development and testing surface area
- Potential inconsistent user experience across agents
- Resource overhead of running multiple specialized models
- Harder to maintain context continuity across domains

**Fits when:** Moltbot needs to excel at specific specialized tasks beyond general conversation.

## Decision

**Chosen option:** Session Isolation with Independent Agents

**Rationale:** The session isolation model best aligns with Moltbot's privacy-first approach and local deployment constraints:

1. Strong isolation ensures data from different sessions can't accidentally mix, reinforcing the privacy promise
2. Independent sessions make resource usage transparent and predictable on user hardware
3. Clear boundaries simplify permission and security models
4. The model scales naturally with hardware improvements over time
5. Enables future features like session export/import without privacy risks

The memory trade-off is acceptable given modern hardware capabilities and the ability to inactive idle sessions.

## Consequences

### Enables

- Strong privacy and data isolation between conversations
- Clear resource boundaries per conversation
- Ability to use different AI models per session type
- Simple session export/import without cross-contamination
- Easier debugging of individual conversation issues

### Constrains

- Higher memory usage with concurrent sessions
- Can't easily share context between related conversations
- May need session limits on resource-constrained devices
- More complex session lifecycle management
- Requires efficient session state persistence

### Assumes

- User devices have sufficient RAM for multiple agent instances
- Strong isolation between conversations is a user priority
- The team can implement efficient session hibernation
- Most users won't maintain dozens of concurrent sessions

## Reversal Cost

**How hard to change:** Hard

**What reversal requires:** Would need to fundamentally rearchitect the agent management system, implement context switching mechanisms, redesign session storage, update security models to handle shared resources, and rewrite significant portions of the agent core. The isolation boundaries that currently simplify the architecture would need to be replaced with complex coordination logic.

## Validation

- [x] At least 2 options were genuinely considered
- [x] Trade-offs are explicit (every option loses something)
- [x] Decision rationale references project context, not generic best practices
- [x] Assumptions are identified
- [x] Reversal cost is assessed
