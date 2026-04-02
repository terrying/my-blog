# Moltbot Component Architecture Map

## Overview

This document provides a comprehensive component architecture map for the Moltbot project, detailing how components interact, their dependencies, and the data flow between them. The map serves as a reference for developers to understand the system's modular architecture.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    External Systems                         │
├─────────────────────────────────────────────────────────────┤
│  WhatsApp   │  Telegram   │  Slack   │  Custom Channels   │
│   API       │    API      │   API    │       API          │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Channel Adapters                          │
├─────────────────────────────────────────────────────────────┤
│  WhatsApp   │  Telegram   │  Slack   │  Plugin Interface   │
│  Adapter    │  Adapter    │  Adapter │   (Extensible)      │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Gateway Control Plane                     │
├─────────────────────────────────────────────────────────────┤
│  Message   │ Session    │ Routing   │ Security & Auth     │
│  Router    │ Manager    │ Engine    │ Layer               │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Agent Runtime System                       │
├─────────────────────────────────────────────────────────────┤
│  Agent     │ Plugin     │ State     │ Event              │
│  Manager   │ Manager    │ Manager   │ System             │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Core Services Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Storage   │ Cache      │ Config    │ Monitoring         │
│  Service   │ Service    │ Service   │ & Telemetry       │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Platform Applications & CLI                    │
├─────────────────────────────────────────────────────────────┤
│  Web App    │ Desktop    │ Mobile    │ CLI Interface      │
│  (React)    │ (Electron)  │ (React    │ & Management       │
│             │            │ Native)   │ Tools              │
└─────────────────────────────────────────────────────────────┘
```

## Core Components Analysis

### 1. Gateway Control Plane

#### Responsibility

The central WebSocket server and control hub that orchestrates all communication and manages the overall system state.

#### Dependencies

- Channel Adapters (for receiving external messages)
- Core Services Layer (for persistence and configuration)
- Agent Runtime System (for processing messages)
- Security Layer (for authentication and authorization)

#### Provides

- WebSocket server interface for client connections
- Message routing and dispatching capabilities
- Session management API
- Authentication and authorization endpoints
- Configuration management interface

#### Key Technologies

- Node.js with ws library for WebSocket server
- Custom binary protocol for message serialization
- JWT for authentication
- Express.js for REST management endpoints

#### Configuration

```yaml
gateway:
  port: 8080
  ws:
    maxConnections: 1000
    heartbeatInterval: 30000
    maxMessageSize: 1MB
  security:
    jwtSecret: ${JWT_SECRET}
    sessionTimeout: 24h
  plugins:
    enabled: true
    sandboxTimeout: 30s
```

### 2. Channel Adapters

#### Responsibility

Modular adapters that translate between external messaging platform APIs and the internal message format.

#### Dependencies

- Gateway Control Plane (for message delivery)
- External platform APIs (WhatsApp, Telegram, etc.)
- Core Services Layer (for adapter configuration)

#### Provides

- Standardized message interface to the gateway
- Plugin system for adding new channels
- Rate limiting and error recovery for each platform
- Message format translation between platforms

#### Key Technologies

- WhatsApp Business API SDK
- Telegram Bot API (node-telegram-bot-api)
- Slack API ( @slack/web-api )
- Webhook servers with express.js

#### Configuration

```yaml
channels:
  whatsapp:
    webhookUrl: '/webhooks/whatsapp'
    apiVersion: 'v2'
    rateLimit: 1000/min
  telegram:
    token: ${TELEGRAM_BOT_TOKEN}
    webhookMode: true
    allowedUpdates: ['message', 'callback_query']
  slack:
    botToken: ${SLACK_BOT_TOKEN}
    signingSecret: ${SLACK_SIGNING_SECRET}
```

### 3. Agent Runtime

#### Responsibility

The isolated agent execution environment that processes messages and generates responses.

#### Dependencies

- Gateway Control Plane (for receiving messages and sending responses)
- Plugin System (for extending agent capabilities)
- State Manager (for maintaining agent state)
- Core Services Layer (for persistence)

#### Provides

- Agent execution interface
- Plugin loading and management capabilities
- State persistence for agents
- Event-driven communication system

#### Key Technologies

- V8 isolates for sandboxing
- Worker threads for parallel execution
- Plugin system with dynamic loading
- Event-driven architecture with EventEmitter

#### Configuration

```yaml
agentRuntime:
  maxConcurrentAgents: 10
  timeout: 30s
  memoryLimit: 512MB
  plugins:
    directory: './plugins'
    autoLoad: true
    securityLevel: 'medium'
```

### 4. Security Layer

#### Responsibility

Authentication, authorization, and security enforcement across the entire system.

#### Dependencies

- Gateway Control Plane (to enforce security policies)
- Core Services Layer (for storing user credentials and permissions)
- External authentication providers (optional)

#### Provides

- JWT token generation and validation
- Permission management API
- Encryption/decryption services
- Rate limiting and abuse prevention

#### Key Technologies

- bcrypt for password hashing
- jsonwebtoken for JWT management
- crypto module for encryption
- helmet.js for security headers

#### Configuration

```yaml
security:
  jwt:
    algorithm: 'HS256'
    expiresIn: '24h'
  encryption:
    algorithm: 'aes-256-gcm'
    keyDerivation: 'pbkdf2'
  rateLimit:
    windowMs: 900000
    maxRequests: 100
```

### 5. Plugin System

#### Responsibility

Extensible framework for loading and managing agent skills and custom functionality.

#### Dependencies

- Agent Runtime (to execute plugins)
- Security Layer (to sandbox plugins)
- Core Services Layer (for plugin storage)

#### Provides

- Plugin discovery and loading API
- Sandbox environment for secure execution
- Plugin lifecycle management
- Inter-plugin communication channels

#### Key Technologies

- Dynamic import() for plugin loading
- VM module for sandboxing
- Plugin manifest system
- Event bus for plugin communication

#### Configuration

```yaml
plugins:
  directory: './plugins'
  registry: './plugins/registry.json'
  sandbox:
    enabled: true
    allowedModules: ['lodash', 'axios']
    memoryLimit: 128MB
    executionTimeout: 10s
```

### 6. Media Pipeline

#### Responsibility

Audio/video processing capabilities for handling rich media in conversations.

#### Dependencies

- Gateway Control Plane (for media requests)
- Agent Runtime (for processing media)
- Core Services Layer (for media storage)

#### Provides

- Audio transcription and synthesis
- Video processing and frame extraction
- Image analysis and manipulation
- Media format conversion

#### Key Technologies

- FFmpeg for video/audio processing
- Whisper for speech-to-text
- OpenAI TTS for text-to-speech
- Sharp for image processing

#### Configuration

```yaml
media:
  transcription:
    model: 'whisper-1'
    language: 'auto'
  synthesis:
    model: 'tts-1'
    voice: 'alloy'
  video:
    maxResolution: '1080p'
    supportedFormats: ['mp4', 'webm', 'mov']
  image:
    maxSize: 10MB
    supportedFormats: ['jpg', 'png', 'webp']
```

### 7. Platform Apps

#### Responsibility

Native applications for different platforms that provide user interfaces to the Moltbot system.

#### Dependencies

- Gateway Control Plane (via WebSocket protocol)
- Authentication endpoints
- Core Services Layer (for user preferences)

#### Provides

- User interface for interacting with agents
- Configuration management UI
- Real-time message display
- Media viewing and creation capabilities

#### Key Technologies

- React with TypeScript for web and mobile
- Electron for desktop application
- React Native for mobile applications
- WebSocket client for real-time communication

#### Configuration

```yaml
apps:
  web:
    buildPath: './apps/web/dist'
    apiUrl: 'ws://localhost:8080'
  desktop:
    buildPath: './apps/desktop/dist'
    autoUpdate: true
  mobile:
    buildPath: './apps/mobile/dist'
    apiEndpoint: 'ws://localhost:8080'
```

### 8. CLI Interface

#### Responsibility

Command-line interface for system administration, configuration, and direct interaction with the gateway.

#### Dependencies

- Gateway Control Plane (for management commands)
- Core Services Layer (for configuration access)

#### Provides

- Administrative commands for system management
- Direct interaction with agents
- Configuration management utilities
- Debugging and diagnostic tools

#### Key Technologies

- Commander.js for CLI framework
- chalk for colored output
- inquirer for interactive prompts
- WebSocket client for gateway communication

#### Configuration

```yaml
cli:
  configPath: '~/.moltbot/config.json'
  defaultGateway: 'ws://localhost:8080'
  timeout: 30s
  logLevel: 'info'
```

## Data Flow Architecture

### Message Processing Flow

```
External Platform → Channel Adapter → Message Normalization → Gateway Control Plane
      ↓                                                       ↓
Rate Limiting ← Auth/Security ← Session Manager ← Router ← Agent Runtime
      ↓                                                       ↓
Channel Adapter ← Response Formatter ← Security Layer ← Agent Execution
      ↓
External Platform
```

### Session Management Flow

```
Client Connect → Authentication → Session Creation → State Initialization
      ↓                 ↓              ↓               ↓
WebSocket Connect → Token Validate → Session Store → Memory Cache
      ↓                 ↓              ↓               ↓
Message Process → Session Update → State Persist → Activity Tracking
      ↓                 ↓              ↓               ↓
Client Disconnect → Session Cleanup → State Backup → Analytics Update
```

### Plugin Loading Flow

```
Plugin Discovery → Security Validation → Sandbox Creation → Plugin Registration
       ↓                  ↓                ↓               ↓
Directory Scan → Manifest Verify → Resource Limits → API Registration
       ↓                  ↓                ↓               ↓
Dependency Load → Permission Grant → Event Subscribe → Runtime Integration
```

## External Integrations

| Component        | External System       | Integration Type | Risk Assessment                  |
| ---------------- | --------------------- | ---------------- | -------------------------------- |
| Channel Adapters | WhatsApp Business API | REST/Webhook     | Medium - API rate limits         |
| Channel Adapters | Telegram Bot API      | REST/Webhook     | Low - Stable API                 |
| Channel Adapters | Slack API             | REST/Webhook     | Low - Mature API                 |
| Media Pipeline   | OpenAI Whisper        | HTTP API         | High - Cost and privacy          |
| Media Pipeline   | OpenAI TTS            | HTTP API         | High - Cost and privacy          |
| Security Layer   | OAuth Providers       | OAuth2           | Medium - Dependency on providers |
| Core Services    | PostgreSQL Database   | TCP Connection   | Low - Internal control           |
| Core Services    | Redis Cache           | TCP Connection   | Low - Internal control           |
| Agent Runtime    | Custom Plugins        | Dynamic Load     | High - Security sandbox critical |

## Interface Boundaries

### Internal Component Boundaries

1. **Gateway-Channel Interface**
   - Purpose: Standardize message exchange between gateway and adapters
   - Protocol: Internal message objects with type safety
   - Security: Validation and sanitization at gateway entry

2. **Gateway-Agent Interface**
   - Purpose: Execute agent logic with proper isolation
   - Protocol: Job queue with results callback
   - Security: Sandbox execution with resource limits

3. **Agent-Plugin Interface**
   - Purpose: Extend agent capabilities dynamically
   - Protocol: Plugin API with event communication
   - Security: Sandboxed plugin execution

### External Boundaries

1. **Client-Gateway Boundary**
   - Purpose: Secure client connections
   - Protocol: Encrypted WebSocket with custom binary protocol
   - Security: JWT authentication, TLS encryption

2. **Channel-Platform Boundary**
   - Purpose: Integration with external messaging platforms
   - Protocol: Platform-specific APIs and webhooks
   - Security: API key management, webhook verification

3. **Media-Service Boundary**
   - Purpose: External media processing services
   - Protocol: HTTPS API calls
   - Security: API key management, data privacy controls

### Security Boundaries

1. **Untrusted Zone**
   - External systems and network traffic
   - All external API connections
   - User-provided input and media

2. **Semi-Trusted Zone**
   - Channel adapters after input validation
   - Plugin sandbox environments
   - Client applications

3. **Trusted Zone**
   - Gateway core components
   - Agent runtime with resource limits
   - Internal service communications

4. **Highly-Trusted Zone**
   - Security and authentication systems
   - Configuration management
   - Core services and storage

## Scalability Considerations

### Horizontal Scaling

- **Stateless Components**: Gateway API endpoints can be load-balanced
- **Stateful Components**: WebSocket connections require sticky sessions
- **Database**: Read replicas can distribute query load
- **Cache**: Redis cluster for distributed caching

### Bottleneck Analysis

1. **WebSocket Connection Limits**
   - Impact: Limits concurrent users per instance
   - Mitigation: Connection pooling, multiple gateway instances

2. **Agent Execution Resources**
   - Impact: Limits concurrent conversations
   - Mitigation: Resource-based scheduling, queue management

3. **Database Write Throughput**
   - Impact: Session persistence under load
   - Mitigation: Batch writes, time-series optimization

4. **Media Processing Time**
   - Impact: Response latency for rich content
   - Mitigation: Asynchronous processing, progress updates

## Failure Mode Analysis

### Single Points of Failure

1. **Gateway Control Plane**
   - Detection: Health checks, heartbeat monitoring
   - Recovery: Automatic restart, state recovery from storage
   - Prevention: Process monitoring, graceful degradation

2. **Database Connectivity**
   - Detection: Connection pool exhaustion, query timeouts
   - Recovery: Connection retry, read-only fallback mode
   - Prevention: Connection pooling, circuit breakers

3. **Plugin System**
   - Detection: Plugin errors, sandbox violations
   - Recovery: Plugin restart, disable problematic plugins
   - Prevention: Resource limits, comprehensive testing

### Graceful Degradation Strategies

1. **Connection Overload**: Queue incoming requests, return retry-after headers
2. **Agent Unavailability**: Fallback to predefined responses, queue for later
3. **Media Processing Failure**: Send text-only responses, log error for later
4. **Plugin Errors**: Disable failing plugin, continue with core functionality

## Monitoring and Observability

### Key Metrics

1. **Gateway Metrics**
   - Active WebSocket connections
   - Message throughput per channel
   - Authentication success/failure rates
   - Response latency percentiles

2. **Agent Runtime Metrics**
   - Active agents and resource utilization
   - Plugin execution time and errors
   - Queue depth and wait times
   - Memory usage per agent

3. **System Health Metrics**
   - Database connection pool status
   - Cache hit ratios
   - Storage utilization
   - Error rates by component

### Alerting Thresholds

- WebSocket connections > 90% capacity
- Message queue depth > 1000 items
- Authentication failures > 5% in 5 minutes
- Agent response time > 10 seconds (95th percentile)
- Database connection pool > 80% utilization
- Plugin sandbox violations > 1 per hour

## Recovery Procedures

### Automatic Recovery

1. **Component Restart**
   - Health check failures trigger automatic restarts
   - Exponential backoff for repeated failures
   - Circuit breakers to prevent cascading failures

2. **State Recovery**
   - Session state restored from persistent storage
   - Agent state recovered from snapshots
   - In-flight messages reprocessed from queues

### Manual Recovery

1. **Database Recovery**
   - Point-in-time recovery from backups
   - Schema migration procedures
   - Data consistency validation

2. **Plugin Recovery**
   - Manual plugin disable/enable
   - Plugin rollback to previous versions
   - Plugin configuration restoration

## Development Guidelines

### Component Integration

1. **Interface Contracts**: All components must implement defined interfaces
2. **Error Handling**: Consistent error propagation and logging
3. **Testing**: Unit tests for components, integration tests for boundaries
4. **Documentation**: API documentation for all interfaces

### Security Development

1. **Input Validation**: All external inputs must be validated and sanitized
2. **Least Privilege**: Components should have minimal required permissions
3. **Secure Defaults**: Secure configurations should be the default
4. **Security Reviews**: All changes undergo security review before deployment

This component map serves as the foundation for understanding Moltbot's architecture and guides development decisions as the system evolves.
