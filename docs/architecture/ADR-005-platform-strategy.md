# ADR-005: Platform Strategy

**Date:** 2026-01-30
**Status:** Accepted

## Context

Moltbot needs a platform strategy to determine how users interact with their personal AI assistant. This decision impacts development resources, user experience, and the overall business model. The fundamental choice is between native applications leveraging platform capabilities versus web-based interfaces prioritizing accessibility.

## Options Considered

### Option 1: Native Applications

**Approach:** Platform-specific applications (macOS, Windows, Linux) built with native frameworks and tools. Deep integration with operating system features.

**Gains:**

- Native look, feel, and performance
- Deep OS integration (system tray, notifications, file access)
- Better resource management and performance
- App store distribution channels
- Rich offline capabilities with local storage

**Loses:**

- Multiple codebases to maintain (platform proliferation)
- Slower development cycle across platforms
- Harder to provide consistent experience
- Larger development team required
- Platform-specific bugs and quirks

**Fits when:** Native integration and performance are critical, and resources exist for multi-platform development.

### Option 2: Web-based Interfaces

**Approach:** Browser-based UI with progressive web app capabilities. Single codebase deployed to all platforms via web standards.

**Gains:**

- Single codebase for all platforms
- Instant updates without app store processes
- Lower development and maintenance overhead
- Easier to achieve consistency
- No platform review processes or restrictions

**Loses:**

- Limited OS integration capabilities
- Browser sandbox restrictions
- Dependent on browser implementations and quirks
- Weaker offline capabilities
- Performance limitations compared to native apps

**Fits when:** Development efficiency and cross-platform consistency are more important than deep OS integration.

### Option 3: Hybrid Approach

**Approach:** Native gateway with web-based UI. Core local server provides API, while multiple UI clients (web, native wrapper, CLI) connect to it.

**Gains:**

- Flexibility of UI choices
- Single core system to maintain
- Can start simple and add native UIs later
- Users can choose preferred interface
- Enables both simple and advanced clients

**Loses:**

- More complex initial architecture
- Need to maintain API stability across UI changes
- Installation becomes more complex
- Potential inconsistency between different UIs
- More testing surface area

**Fits when:** The system has multiple user types with different UI needs, or the team wants to enable UI experimentation.

## Decision

**Chosen option:** Hybrid Approach

**Rationale:** The hybrid approach best serves Moltbot's diverse user base and technical constraints:

1. Separates the complex AI gateway from the relatively simpler UI concerns
2. Enables starting with a web UI while leaving room for native apps later
3. Different user personas (developers, writers, general users) may prefer different interfaces
4. The local gateway can provide rich OS integration while the UI remains web-based
5. Future-proofed for additional clients like CLI, IDE plugins, or third-party integrations

This approach aligns with Moltbot's philosophy of providing a powerful core system that users can interact with in their preferred way.

## Consequences

### Enables

- Multiple interface options for different user types
- Simpler initial development with web UI
- Future native applications without rearchitecting core
- Third-party integration opportunities
- Progressive enhancement of UI capabilities

### Constrains

- More complex installation process (gateway + UI)
- Need to maintain stable API contracts
- Potential for inconsistent experiences between UIs
- Higher testing complexity
- More moving parts in production

### Assumes

- Users will tolerate a slightly more complex installation
- The team can maintain a stable internal API
- The web UI can provide sufficient functionality initially
- Native UIs can leverage the same local gateway effectively

## Reversal Cost

**How hard to change:** Moderate

**What reversal requires:** Moving to a pure native approach would require rewriting the UI in platform-specific frameworks and moving UI-specific logic from the web UI into the native apps. Moving to a pure web approach would be easier (just dropping the client-server separation) but would lose the flexibility. The core gateway architecture would likely remain similar in either case.

## Validation

- [x] At least 2 options were genuinely considered
- [x] Trade-offs are explicit (every option loses something)
- [x] Decision rationale references project context, not generic best practices
- [x] Assumptions are identified
- [x] Reversal cost is assessed
