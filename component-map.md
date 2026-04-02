# Moltbot Component Architecture Map

## Overview

This document outlines the modular architecture of Moltbot, showing how components interact and depend on each other in the Gateway + multi-agent system.

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
│                      Gateway Core                           │
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
```

## Detailed Component Breakdown

### 1. Channel Adapters Layer

#### WhatsApp Adapter

```typescript
interface WhatsAppAdapter {
  connect(): Promise<void>
  sendMessage(chatId: string, content: Message): Promise<void>
  onMessage(callback: (message: ExternalMessage) => void): void
  disconnect(): Promise<void>
}
```

- Handles WhatsApp Business API integration
- Manages webhook endpoints and authentication
- Translates WhatsApp message format to internal format
- Handles rate limiting and error recovery

#### Telegram Adapter

```typescript
interface TelegramAdapter {
  connect(): Promise<void>
  sendMessage(chatId: string, content: Message): Promise<void>
  onMessage(callback: (message: ExternalMessage) => void): void
  disconnect(): Promise<void>
}
```

- Integrates with Telegram Bot API
- Supports both polling and webhook modes
- Handles rich media and inline keyboards
- Manages bot commands and permissions

#### Plugin Interface

```typescript
interface ChannelPlugin {
  initialize(config: ChannelConfig): Promise<void>
  sendMessage(channelId: string, content: Message): Promise<void>
  onMessage(callback: (message: ExternalMessage) => void): void
  getCapabilities(): ChannelCapabilities
}
```

### 2. Gateway Core

#### Message Router

```typescript
interface MessageRouter {
  route(message: InternalMessage): Promise<AgentAssignment>
  addRoute(pattern: RoutePattern, handler: RouteHandler): void
  removeRoute(routeId: string): void
  getRoutingRules(): RoutingRule[]
}
```

**Responsibilities:**

- Message format normalization
- Content-based routing
- Load balancing across agents
- Routing rule management

#### Session Manager

```typescript
interface SessionManager {
  createSession(userId: string, channelId: string): Promise<Session>
  getSession(sessionId: string): Promise<Session | null>
  updateSession(sessionId: string, updates: Partial<Session>): Promise<void>
  deleteSession(sessionId: string): Promise<void>
}
```

**Responsibilities:**

- Session lifecycle management
- Cross-channel session continuity
- Session persistence and recovery
- Session analytics and monitoring

#### Routing Engine

```typescript
interface RoutingEngine {
  findBestAgent(message: InternalMessage): Promise<AgentId>
  registerAgent(agent: AgentInfo): Promise<void>
  unregisterAgent(agentId: AgentId): Promise<void>
  getAgentLoad(agentId: AgentId): Promise<LoadMetrics>
}
```

**Responsibilities:**

- Agent capability matching
- Load-based distribution
- Agent health monitoring
- Fallback routing

#### Security & Authentication Layer

```typescript
interface SecurityLayer {
  authenticate(request: IncomingRequest): Promise<AuthResult>
  authorize(user: User, resource: Resource): Promise<boolean>
  encrypt(data: any): Promise<EncryptedData>
  decrypt(encryptedData: EncryptedData): Promise<any>
}
```

**Responsibilities:**

- JWT token validation
- API key management
- Rate limiting
- Data encryption/decryption

### 3. Agent Runtime System

#### Agent Manager

```typescript
interface AgentManager {
  loadAgent(agentId: string): Promise<Agent>
  unloadAgent(agentId: string): Promise<void>
  executeAgent(agentId: string, context: ExecutionContext): Promise<AgentResponse>
  listAgents(): Promise<AgentInfo[]>
}
```

**Responsibilities:**

- Agent lifecycle management
- Resource allocation and limits
- Agent health monitoring
- Performance metrics collection

#### Plugin Manager

```typescript
interface PluginManager {
  loadPlugin(pluginPath: string): Promise<Plugin>
  unloadPlugin(pluginId: string): Promise<void>
  getPlugin(pluginId: string): Promise<Plugin | null>
  listPlugins(): Promise<PluginInfo[]>
}
```

**Responsibilities:**

- Plugin discovery and loading
- Sandbox creation and management
- Plugin communication channels
- Plugin resource monitoring

#### State Manager

```typescript
interface StateManager {
  getAgentState(agentId: string): Promise<AgentState>
  setAgentState(agentId: string, state: AgentState): Promise<void>
  persistState(agentId: string): Promise<void>
  restoreState(agentId: string): Promise<AgentState>
}
```

**Responsibilities:**

- Agent state persistence
- State synchronization across instances
- State versioning and rollback
- State migration utilities

#### Event System

```typescript
interface EventSystem {
  emit(event: Event): Promise<void>
  subscribe(pattern: EventPattern, handler: EventHandler): Promise<Subscription>
  unsubscribe(subscriptionId: string): Promise<void>
  getEventHistory(filter: EventFilter): Promise<Event[]>
}
```

**Responsibilities:**

- Event-driven communication
- Event persistence and replay
- Event filtering and routing
- Dead letter queue management

### 4. Core Services Layer

#### Storage Service

```typescript
interface StorageService {
  store(key: string, data: any): Promise<void>
  retrieve(key: string): Promise<any>
  delete(key: string): Promise<void>
  query(filter: StorageFilter): Promise<any[]>
}
```

**Storage Types:**

- PostgreSQL for relational data
- MongoDB for document storage
- File system for large objects
- Archive storage for historical data

#### Cache Service

```typescript
interface CacheService {
  get(key: string): Promise<any>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
}
```

**Cache Layers:**

- In-memory L1 cache (per instance)
- Redis L2 cache (shared)
- CDN for static content
- Browser cache for web components

#### Config Service

```typescript
interface ConfigService {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
  watch(key: string, callback: ConfigChangeCallback): Promise<void>
  reload(): Promise<void>
}
```

**Configuration Sources:**

- Environment variables
- Configuration files
- Remote config service
- Database-stored config

#### Monitoring & Telemetry

```typescript
interface MonitoringService {
  recordMetric(name: string, value: number, tags?: Tags): Promise<void>
  recordEvent(event: Event): Promise<void>
  recordError(error: Error): Promise<void>
  getMetrics(query: MetricQuery): Promise<Metric[]>
}
```

**Monitoring Components:**

- Metrics collection (Prometheus)
- Distributed tracing
- Error tracking
- Performance profiling

## Data Flow Architecture

### Message Processing Flow

```
External Message → Channel Adapter → Gateway → Message Router → Agent Runtime → Agent → Response → Gateway → Channel Adapter → External System
```

### Session Management Flow

```
User Request → Session Manager → Cache Service → Storage Service → Session Context → Agent Runtime → Session Update → Session Manager
```

### Plugin Loading Flow

```
Plugin Install → Plugin Manager → Sandbox Creation → Security Validation → Registration → Agent Runtime Integration
```

## Component Dependencies

### Dependency Graph

```
Channel Adapters → Gateway Core → Agent Runtime → Core Services
     ↑                ↑              ↑              ↑
   Plugins       Security Layer   Plugins       External APIs
```

### Critical Paths

1. **Message Processing**: Channel → Router → Agent → Response
2. **Session Management**: Session → Cache → Storage → Agent State
3. **Plugin Execution**: Plugin → Sandbox → Agent Runtime → Event System

## Scalability Considerations

### Horizontal Scaling

- Stateless components can be scaled freely
- Session data externalized for scale-out
- Load balancing at multiple layers
- Auto-scaling based on metrics

### Bottleneck Analysis

- WebSocket connection limits per instance
- Cache saturation under high load
- Database contention for session writes
- Plugin resource consumption

## Security Boundaries

### Trust Zones

1. **Untrusted**: External systems and messages
2. **Semi-trusted**: Channel adapters and plugins
3. **Trusted**: Gateway core and agent runtime
4. **Highly-trusted**: Core services and configuration

### Data Flow Security

- All external communications encrypted
- Internal service authentication
- Plugin sandbox isolation
- Data classification and handling
