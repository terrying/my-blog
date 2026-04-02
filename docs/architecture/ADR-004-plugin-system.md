# ADR-004: Plugin System

**Date:** 2026-01-30
**Status:** Accepted

## Context

Moltbot needs an extensible architecture to support additional capabilities beyond core conversational AI. The plugin system decision affects how users can customize their experience, how the community can contribute extensions, and how the core system maintains stability and security.

## Options Considered

### Option 1: Bundled Plugin System

**Approach:** All plugins are included in the main application binary. Plugins are compiled and distributed with the core system, with no runtime loading capability.

**Gains:**

- Simpler deployment and installation
- No plugin compatibility or version issues
- Better performance (no runtime loading overhead)
- Stronger security (no arbitrary code execution)
- Easier testing and quality control

**Loses:**

- No user extensibility after installation
- Slower release cycle for plugin updates
- Larger binary size
- Cannot target specific user needs
- Limited community contribution opportunities

**Fits when:** Control, security, and simplicity are more important than extensibility.

### Option 2: Managed Plugin System

**Approach:** Curated plugin repository with vetted plugins. Users can install approved plugins that meet security and quality standards. Plugins run in sandboxed environments.

**Gains:**

- User choice and customization
- Quality control through curation process
- Community contribution opportunities
- Regular plugin updates independent of core releases
- Balanced approach to security through sandboxing

**Loses:**

- Complex curation and review process
- Still requires sandbox implementation overhead
- Smaller plugin ecosystem than open systems
- Potential approval bottlenecks
- Ongoing maintenance burden

**Fits when:** User customization is important but security and quality can't be compromised.

### Option 3: Workspace Skills (Local Development)

**Approach:** Users can create and load their own plugins from local workspaces. No central repository or approval process. Full developer freedom with local responsibility.

**Gains:**

- Maximum flexibility and customization
- No approval or review bottlenecks
- Perfect for personal automation and custom workflows
- Simple implementation (no central infrastructure)
- Developers can iterate quickly

**Loses:**

- Security risks from arbitrary code execution
- No quality control or standards
- Difficult to share between users
- Each user maintains their own plugins
- Support burden from custom plugins

**Fits when:** Power users and developers are the target audience, and they accept the security implications.

## Decision

**Chosen option:** Workspace Skills (Local Development)

**Rationale:** The workspace skills approach best serves Moltbot's mission of a personal AI assistant that adapts to individual needs:

1. Personal AI should be as unique as the individual user, requiring deep customization capability
2. Local-first philosophy extends to customizations - users should control their own extensions
3. No approval process enables rapid iteration and experimentation
4. Simplicity of implementation matches the overall architectural philosophy
5. Power users can create highly personalized workflows that cloud services can't match

The security concerns are mitigated by Moltbot's local deployment model - users are only risking their own systems, not a shared platform.

## Consequences

### Enables

- Unlimited customization and personalization
- Rapid development and iteration of custom capabilities
- Perfect alignment with local-first philosophy
- No bottlenecks or approval processes
- Powerful automation for individual workflows

### Constrains

- No easy sharing mechanism between users
- Each user bears full maintenance burden
- Security is user responsibility
- Steeper learning curve for non-developers
- No curated quality standards

### Assumes

- Users are comfortable with local development
- Security risks are acceptable in a local environment
- Individual customization outweighs ecosystem benefits
- Documentation and examples can lower the barrier to entry

## Reversal Cost

**How hard to change:** Moderate

**What reversal requires:** Would need to implement plugin curation infrastructure, sandbox execution environment, security review processes, and update mechanisms. The current approach has minimal infrastructure, so adding managed or bundled systems would require building those systems from scratch. However, the core skill loading mechanism could potentially be adapted.

## Validation

- [x] At least 2 options were genuinely considered
- [x] Trade-offs are explicit (every option loses something)
- [x] Decision rationale references project context, not generic best practices
- [x] Assumptions are identified
- [x] Reversal cost is assessed
