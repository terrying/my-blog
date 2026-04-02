# ADR-006: Security Model

**Date:** 2026-01-30
**Status:** Accepted

## Context

Moltbot needs a comprehensive security model to protect user data while enabling powerful AI capabilities. As a local-first personal AI assistant, the security approach differs from cloud-based services and must balance protection with usability. The decision affects user trust, data privacy, and system architecture.

## Options Considered

### Option 1: DM Pairing with Device Trust

**Approach:** Device management (DM) pairing model similar to Apple/Google device authentication. Initial secure pairing establishes trust, then signed tokens authorize subsequent access.

**Gains:**

- Familiar user experience (like phone pairing)
- Strong initial authentication
- Re-authorization without repeated authentication
- Support for multiple trusted devices
- Clear trust boundaries

**Loses:**

- Complex implementation of secure pairing protocols
- Requires secure storage of trust certificates
- Key rotation and revocation complexity
- Still vulnerable on compromised trusted devices
- Initial setup complexity for users

**Fits when:** Users have multiple devices that need to access their Moltbot instance securely.

### Option 2: Sandboxed Execution Environment

**Approach:** All code execution (including plugins and AI responses) runs in isolated sandbox containers with strict resource and permission limitations.

**Gains:**

- Strong containment of potentially harmful code
- Fine-grained permission control per plugin/session
- Resource usage limits prevent abuse
- Clear security boundaries for auditors
- Can audit and restrict file system access

**Loses:**

- Implementation complexity (containerization, permissions)
- Performance overhead of sandboxing
- May break legitimate AI capabilities that need broader access
- Complex permission model for users to understand
- Sandboxing bypass attempts by sophisticated attacks

**Fits when:** Code execution capabilities are a core feature and security must be air-tight.

### Option 3: Layered Permission Model

**Approach:** Multiple security layers: authentication, authorization, and capability-based permissions. Each layer can be independently configured and enforced.

**Gains:**

- Defense in depth - multiple security barriers
- Flexible configuration for different security needs
- Can progressively tighten or loosen layers
- Easier to audit specific security concerns
- Can implement different profiles for different use cases

**Loses:**

- Complex to design and implement correctly
- Users may struggle to understand all layers
- Performance impact from multiple checks
- More configuration surface area
- Risk of misconfiguration creating vulnerabilities

**Fits when:** Different users have different security requirements and need configurability.

## Decision

**Chosen option:** Layered Permission Model

**Rationale:** The layered approach provides the most comprehensive security for Moltbot's unique position as a local AI assistant:

1. Multiple independent layers provide defense in depth - if one layer fails, others still protect the user
2. Different users have different security needs - some want maximum lockdown, others want convenience
3. The model can evolve over time without fundamental rearchitecture
4. Each layer can focus on its specific security concern (authentication, authorization, capabilities)
5. Aligns with the overall architectural philosophy of clear boundaries and explicit trade-offs

The implementation combines elements of the other options within the layered framework.

## Consequences

### Enables

- Comprehensive defense-in-depth security
- Configurable security levels for different users
- Ability to evolve security posture over time
- Clear audit trails for security decisions
- Fine-grained control over AI and plugin capabilities

### Constrains

- Increased implementation complexity
- More configuration options for users to understand
- Performance overhead from multiple security checks
- Higher testing burden for security interactions
- Risk of misconfiguration creating vulnerabilities

### Assumes

- The team has security expertise to implement correctly
- Users want configurable security options
- Performance impact of multiple layers is acceptable
- Documentation can make complex security approachable

## Reversal Cost

**How hard to change:** Hard

**What reversal requires:** Would need to fundamentally rearchitect the entire security system, re-evaluate all threat models, update authentication/authorization flows throughout the system, and potentially break existing plugins or workflows that depend on current security behaviors. The interconnections between security layers make major changes ripple throughout the codebase.

## Validation

- [x] At least 2 options were genuinely considered
- [x] Trade-offs are explicit (every option loses something)
- [x] Decision rationale references project context, not generic best practices
- [x] Assumptions are identified
- [x] Reversal cost is assessed
