# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for Moltbot, documenting key architectural choices and their rationale.

## ADR Index

| ADR                                          | Title                  | Status   |
| -------------------------------------------- | ---------------------- | -------- |
| [ADR-001](ADR-001-gateway-architecture.md)   | Gateway Architecture   | Accepted |
| [ADR-002](ADR-002-communication-protocol.md) | Communication Protocol | Accepted |
| [ADR-003](ADR-003-multi-agent-model.md)      | Multi-Agent Model      | Accepted |
| [ADR-004](ADR-004-plugin-system.md)          | Plugin System          | Accepted |
| [ADR-005](ADR-005-platform-strategy.md)      | Platform Strategy      | Accepted |
| [ADR-006](ADR-006-security-model.md)         | Security Model         | Accepted |

## Overview

These ADRs document Moltbot's core architectural decisions, focusing on the unique local-first approach to personal AI assistants. The decisions collectively establish:

1. **Local-first operation** with WebSocket control plane for maximum privacy and offline capability
2. **Custom communication protocol** optimized for conversational AI streaming
3. **Session isolation** to ensure privacy between different conversations
4. **Workspace skills** for maximum user customization
5. **Hybrid platform strategy** separating core capabilities from UI concerns
6. **Layered security model** providing defense-in-depth protection

## Decision Themes

### Privacy by Design

Every architectural decision prioritizes user data privacy, from local-first operation to session isolation. Moltbot keeps user data on their device by default.

### Offline-First Capability

The architecture is designed to work without internet connectivity for core features, ensuring reliability and independence from network conditions.

### User Customization

The workspace skills approach gives users unlimited ability to tailor Moltbot to their specific needs, accepting that power users may prefer to write their own extensions.

### Clear Boundaries

Each component has well-defined responsibilities and interfaces, making the system easier to understand, maintain, and evolve.

### Security Depth

Multiple independent security layers provide comprehensive protection while allowing users to configure their preferred balance of security and convenience.
