# Moltbot Walking Skeleton Definition

## Overview

This document defines the minimal end-to-end implementation path for Moltbot, demonstrating the core architectural patterns with the smallest possible feature set that validates the Gateway + multi-agent approach.

## Walking Skeleton Goals

### Primary Objectives

1. **Validate Architecture Choice**: Prove Gateway + multi-agent pattern works
2. **Establish Communication Flow**: End-to-end message processing
3. **Demonstrate Extensibility**: Plugin system feasibility
4. **Enable Rapid Iteration**: Foundation for incremental development

### Success Criteria

- User can send message through one channel and receive AI response
- System demonstrates session continuity across messages
- Plugin can be loaded and used without core changes
- Basic monitoring and logging functional
- Deployment in local-first mode operational

## Minimal Component Set

### Core Components (Required)

1. **Gateway Core** - Message routing and session management
2. **Single Channel Adapter** - WhatsApp (chosen for business relevance)
3. **Basic Agent Runtime** - Simple rule-based agent
4. **Session Store** - Redis for session persistence
5. **Configuration System** - Basic file-based config

### Explicitly Excluded

- Multiple channel adapters (just one)
- Complex AI models (simple responses)
- Advanced security (basic auth only)
- Plugin marketplace (manual loading)
- Advanced monitoring (basic logs only)
- Cloud synchronization (local only)

## Implementation Architecture

### Minimal Data Flow

```
User Message (WhatsApp) → WhatsApp Adapter → Gateway → Simple Agent → Response → Gateway → WhatsApp Adapter → User
```

### Component Interactions

#### Message Flow Sequence

```
1. WhatsApp Adapter receives message
2. Adapter normalizes to internal format
3. Gateway creates/updates session
4. Message routed to Simple Agent
5. Agent generates response
6. Response routed back through Gateway
7. WhatsApp Adapter sends response
8. Session updated with conversation
```

## Technical Implementation

### 1. Gateway Core (Minimal)

**Files:**

```
gateway/
├── core/
│   ├── gateway.ts          # Main gateway class
│   ├── message-router.ts   # Basic routing logic
│   └── session-manager.ts  # Session handling
├── types/
│   └── messages.ts         # Message type definitions
└── config/
    └── gateway-config.ts   # Configuration types
```

**Core Gateway Class:**

```typescript
export class MinimalGateway {
  private router: MessageRouter
  private sessionManager: SessionManager
  private channelAdapters: Map<string, ChannelAdapter>
  private agents: Map<string, Agent>

  async initialize(config: GatewayConfig): Promise<void> {
    this.sessionManager = new SessionManager(config.redis)
    this.router = new MessageRouter(this.agents)
    // Load minimal components
  }

  async handleMessage(channelId: string, message: ExternalMessage): Promise<void> {
    const sessionId = await this.sessionManager.getOrCreateSession(message.userId, channelId)
    const internalMessage = this.normalizeMessage(message, sessionId)
    const agent = this.router.route(internalMessage)
    const response = await agent.process(internalMessage)
    await this.sendResponse(channelId, response)
    await this.sessionManager.updateSession(sessionId, { message, response })
  }
}
```

### 2. WhatsApp Adapter (Minimal)

**Files:**

```
adapters/whatsapp/
├── whatsapp-adapter.ts     # Main adapter implementation
├── webhook-handler.ts      # HTTP webhook handling
└── message-mapper.ts       # Format conversion
```

**Adapter Implementation:**

```typescript
export class WhatsAppAdapter implements ChannelAdapter {
  private webhookUrl: string
  private messageHandler: (message: ExternalMessage) => void

  constructor(config: WhatsAppConfig) {
    this.webhookUrl = config.webhookUrl
  }

  async initialize(gateway: Gateway): Promise<void> {
    this.messageHandler = gateway.handleMessage.bind(gateway, 'whatsapp')
    this.setupWebhook()
  }

  private setupWebhook(): void {
    // Express.js endpoint for WhatsApp webhooks
    app.post('/webhook/whatsapp', this.handleWebhook.bind(this))
  }

  private async handleWebhook(req: Request, res: Response): Promise<void> {
    const whatsappMessage = req.body
    const externalMessage = this.mapToExternal(whatsappMessage)
    await this.messageHandler(externalMessage)
    res.sendStatus(200)
  }

  async sendMessage(chatId: string, message: InternalMessage): Promise<void> {
    const whatsappMessage = this.mapToWhatsApp(chatId, message)
    await this.callWhatsAppAPI(whatsappMessage)
  }
}
```

### 3. Simple Agent (Minimal)

**Files:**

```
agents/simple/
├── simple-agent.ts         # Basic agent implementation
├── response-generator.ts   # Rule-based responses
└── agent-config.ts         # Agent configuration
```

**Agent Implementation:**

```typescript
export class SimpleAgent implements Agent {
  private responses: Map<string, string>
  private sessionId: string

  constructor(config: AgentConfig) {
    this.responses = new Map([
      ['hello', "Hello! I'm a simple AI assistant. How can I help you?"],
      [
        'help',
        'I can respond to basic greetings and simple questions. Try saying "hello" or "what can you do?"',
      ],
      ['default', "I received your message. I'm still learning to respond better."],
    ])
  }

  async process(message: InternalMessage): Promise<AgentResponse> {
    const content = message.content.toLowerCase()
    const response = this.generateResponse(content)

    return {
      content: response,
      type: 'text',
      sessionId: this.sessionId,
      confidence: 0.8,
      metadata: { agentType: 'simple' },
    }
  }

  private generateResponse(content: string): string {
    for (const [key, value] of this.responses) {
      if (content.includes(key)) {
        return value
      }
    }
    return this.responses.get('default') || "I'm processing your request."
  }
}
```

### 4. Session Manager (Minimal)

**Files:**

```
sessions/
├── session-manager.ts      # Session handling
├── redis-client.ts         # Redis connection
└── session-types.ts        # Type definitions
```

**Session Implementation:**

```typescript
export class SessionManager {
  private redis: RedisClient
  private sessionTTL: number = 3600 // 1 hour

  constructor(redisConfig: RedisConfig) {
    this.redis = new RedisClient(redisConfig)
  }

  async getOrCreateSession(userId: string, channelId: string): Promise<string> {
    const sessionId = `${channelId}:${userId}`
    const exists = await this.redis.exists(`session:${sessionId}`)

    if (!exists) {
      const session: Session = {
        sessionId,
        userId,
        channelId,
        createdAt: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
        context: {},
      }
      await this.redis.setex(`session:${sessionId}`, this.sessionTTL, JSON.stringify(session))
    }

    return sessionId
  }

  async updateSession(sessionId: string, update: SessionUpdate): Promise<void> {
    const key = `session:${sessionId}`
    const sessionJson = await this.redis.get(key)
    const session = JSON.parse(sessionJson)

    session.lastActivity = new Date()
    session.messageCount += 1
    if (update.context) {
      session.context = { ...session.context, ...update.context }
    }

    await this.redis.setex(key, this.sessionTTL, JSON.stringify(session))
  }
}
```

## Deployment Configuration

### Local Development Setup

**Docker Compose File:**

```yaml
# docker-compose.yml
version: '3.8'
services:
  moltbot-gateway:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
      - WHATSAPP_WEBHOOK_URL=http://localhost:3000/webhook/whatsapp
    depends_on:
      - redis
    volumes:
      - ./config:/app/config

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - moltbot-gateway

volumes:
  redis_data:
```

**Configuration Files:**

```typescript
// config/development.ts
export const developmentConfig = {
  gateway: {
    port: 3000,
    sessionTTL: 3600,
    maxConcurrentSessions: 100,
  },

  channels: {
    whatsapp: {
      enabled: true,
      webhookPath: '/webhook/whatsapp',
      apiKey: process.env.WHATSAPP_API_KEY,
      phoneNumberId: process.env.WHATSAPP_PHONE_ID,
    },
  },

  agents: {
    simple: {
      enabled: true,
      maxConcurrentRequests: 50,
    },
  },

  redis: {
    host: 'localhost',
    port: 6379,
    database: 0,
  },
}
```

## Installation and Running

### Quick Start Script

```bash
#!/bin/bash
# start.sh

echo "Starting Moltbot Walking Skeleton..."

# Start infrastructure
docker-compose up -d redis

# Install dependencies
npm install

# Build the application
npm run build

# Start the gateway
npm run start

echo "Moltbot is running on http://localhost:3000"
echo "WhatsApp webhook: http://localhost:3000/webhook/whatsapp"
```

### Health Check Endpoint

```typescript
// health-check.ts
export class HealthCheck {
  static async checkSystem(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkRedis(),
      this.checkAgents(),
      this.checkChannels(),
    ])

    return {
      status: checks.every((c) => c.status === 'fulfilled') ? 'healthy' : 'degraded',
      checks: checks.map((c, i) => ({
        component: ['redis', 'agents', 'channels'][i],
        status: c.status === 'fulfilled' ? 'ok' : 'error',
        details: c.status === 'fulfilled' ? c.value : c.reason,
      })),
    }
  }
}
```

## Testing Strategy

### End-to-End Test

```typescript
// e2e.test.ts
describe('Moltbot Walking Skeleton E2E', () => {
  test('WhatsApp message should receive AI response', async () => {
    // 1. Send WhatsApp message via webhook
    const message = {
      from: '+1234567890',
      message: 'hello',
    }

    const response = await request(app).post('/webhook/whatsapp').send(message).expect(200)

    // 2. Verify session created
    const sessionId = await redis.get(`session:whatsapp:+1234567890`)
    expect(sessionId).toBeTruthy()

    // 3. Verify WhatsApp API called for response
    expect(mockWhatsAppAPI.sendMessage).toHaveBeenCalledWith(
      '+1234567890',
      expect.stringContaining("Hello! I'm a simple AI assistant")
    )
  })
})
```

### Performance Test

```typescript
// performance.test.ts
describe('Walking Skeleton Performance', () => {
  test('Should handle 10 concurrent messages', async () => {
    const messages = Array(10)
      .fill()
      .map((_, i) => ({
        from: `+123456789${i}`,
        message: 'hello',
      }))

    const startTime = Date.now()
    await Promise.all(messages.map((msg) => request(app).post('/webhook/whatsapp').send(msg)))
    const endTime = Date.now()

    // Should process all messages within 5 seconds
    expect(endTime - startTime).toBeLessThan(5000)
  })
})
```

## Success Metrics

### Technical Metrics

- **Response Time**: <200ms for simple messages
- **Concurrent Sessions**: Support 10+ concurrent users
- **Memory Usage**: <512MB for minimal deployment
- **Error Rate**: <1% for normal operations

### Functional Metrics

- **Message Success**: 95%+ messages processed successfully
- **Session Persistence**: Sessions survive restarts
- **Plugin Loading**: Simple plugins load without errors
- **Webhook Reliability**: Handles webhook retries gracefully

### Architecture Validation

- Gateway demonstrates centralized control
- Agents can be added without core changes
- Sessions work across multiple messages
- Plugin interface functional and extensible

## Next Steps After Walking Skeleton

### Increment 1: Additional Channels

- Add Telegram adapter
- Test multi-channel routing
- Channel-specific message formatting

### Increment 2: Enhanced Agents

- Replace simple agent with basic AI model
- Add agent capabilities and selection
- Implement agent health monitoring

### Increment 3: Advanced Features

- Plugin marketplace foundation
- Advanced security features
- Monitoring and analytics dashboard

This walking skeleton provides the foundation for validating the architectural decisions while enabling rapid incremental development of the full Moltbot platform.
