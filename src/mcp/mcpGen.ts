/**
 * MCP (Model Context Protocol) Generator
 * Implements MessageBus, SwarmRunner, and PolicyEngine for distributed agent coordination
 * 
 * @author MCP Generator
 * @version 1.0.0
 * @since 2025-12-26
 */

import { EventEmitter } from 'events';

/**
 * Message interface for MCP communication
 */
interface MCPMessage {
  id: string;
  type: string;
  sender: string;
  recipient?: string;
  payload: Record<string, unknown>;
  timestamp: number;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

/**
 * Agent interface for SwarmRunner
 */
interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'busy' | 'error';
  capabilities: string[];
  process(message: MCPMessage): Promise<MCPMessage>;
}

/**
 * Policy interface for PolicyEngine
 */
interface Policy {
  id: string;
  name: string;
  priority: number;
  condition: (message: MCPMessage, context: PolicyContext) => boolean;
  action: (message: MCPMessage, context: PolicyContext) => Promise<void>;
  enabled: boolean;
}

/**
 * Policy context for rule evaluation
 */
interface PolicyContext {
  swarmId: string;
  agents: Map<string, Agent>;
  messageQueue: MCPMessage[];
  metrics: {
    processedMessages: number;
    failedMessages: number;
    averageLatency: number;
  };
}

/**
 * MessageBus: Central communication hub for MCP agents
 */
class MessageBus extends EventEmitter {
  private messageQueue: MCPMessage[] = [];
  private subscribers: Map<string, Set<(msg: MCPMessage) => void>> = new Map();
  private messageHistory: MCPMessage[] = [];
  private maxHistorySize: number = 10000;
  private processingDelay: number = 0;

  constructor(maxHistorySize: number = 10000) {
    super();
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Publish a message to the bus
   */
  public publish(message: MCPMessage): void {
    const enrichedMessage: MCPMessage = {
      ...message,
      timestamp: message.timestamp || Date.now(),
      id: message.id || this.generateMessageId(),
      priority: message.priority || 'normal',
    };

    this.messageQueue.push(enrichedMessage);
    this.messageHistory.push(enrichedMessage);

    // Maintain max history size
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }

    this.emit('message:published', enrichedMessage);
    this.notifySubscribers(enrichedMessage);
  }

  /**
   * Subscribe to messages of a specific type
   */
  public subscribe(
    messageType: string,
    callback: (msg: MCPMessage) => void
  ): () => void {
    if (!this.subscribers.has(messageType)) {
      this.subscribers.set(messageType, new Set());
    }

    this.subscribers.get(messageType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(messageType)?.delete(callback);
    };
  }

  /**
   * Notify all subscribers of a message type
   */
  private notifySubscribers(message: MCPMessage): void {
    const typeSubscribers = this.subscribers.get(message.type);
    const broadcastSubscribers = this.subscribers.get('*');

    if (typeSubscribers) {
      typeSubscribers.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          this.emit('error', {
            error,
            message: 'Subscriber callback error',
            messageId: message.id,
          });
        }
      });
    }

    if (broadcastSubscribers) {
      broadcastSubscribers.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          this.emit('error', {
            error,
            message: 'Broadcast subscriber callback error',
            messageId: message.id,
          });
        }
      });
    }
  }

  /**
   * Get message queue
   */
  public getQueue(): MCPMessage[] {
    return [...this.messageQueue];
  }

  /**
   * Clear message queue
   */
  public clearQueue(): void {
    this.messageQueue = [];
  }

  /**
   * Get message history
   */
  public getHistory(limit?: number): MCPMessage[] {
    if (limit) {
      return this.messageHistory.slice(-limit);
    }
    return [...this.messageHistory];
  }

  /**
   * Set processing delay (for testing)
   */
  public setProcessingDelay(delayMs: number): void {
    this.processingDelay = delayMs;
  }

  /**
   * Get queue statistics
   */
  public getStatistics() {
    return {
      queueSize: this.messageQueue.length,
      historySize: this.messageHistory.length,
      subscriberCount: this.subscribers.size,
      averageQueueSize: this.messageHistory.length / Math.max(1, Date.now() / 1000),
    };
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * SwarmRunner: Orchestrates multiple agents in a swarm
 */
class SwarmRunner {
  private agents: Map<string, Agent> = new Map();
  private messageBus: MessageBus;
  private swarmId: string;
  private isRunning: boolean = false;
  private processInterval: NodeJS.Timeout | null = null;
  private metrics = {
    processedMessages: 0,
    failedMessages: 0,
    totalLatency: 0,
    startTime: 0,
  };

  constructor(swarmId: string, messageBus: MessageBus) {
    this.swarmId = swarmId;
    this.messageBus = messageBus;
    this.metrics.startTime = Date.now();
  }

  /**
   * Register an agent in the swarm
   */
  public registerAgent(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent ${agent.id} is already registered`);
    }

    this.agents.set(agent.id, agent);
    this.messageBus.emit('agent:registered', {
      agentId: agent.id,
      agentName: agent.name,
      swarmId: this.swarmId,
    });
  }

  /**
   * Unregister an agent from the swarm
   */
  public unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.delete(agentId);
      this.messageBus.emit('agent:unregistered', {
        agentId,
        swarmId: this.swarmId,
      });
    }
  }

  /**
   * Get an agent by ID
   */
  public getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  public getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Start the swarm runner
   */
  public start(intervalMs: number = 100): void {
    if (this.isRunning) {
      console.warn('SwarmRunner is already running');
      return;
    }

    this.isRunning = true;
    this.messageBus.emit('swarm:started', { swarmId: this.swarmId });

    this.processInterval = setInterval(() => {
      this.processMessages();
    }, intervalMs);
  }

  /**
   * Stop the swarm runner
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }

    this.messageBus.emit('swarm:stopped', { swarmId: this.swarmId });
  }

  /**
   * Process messages from the bus
   */
  private async processMessages(): Promise<void> {
    const queue = this.messageBus.getQueue();

    for (const message of queue) {
      try {
        const startTime = Date.now();

        // Find recipient agent
        const recipient = message.recipient
          ? this.agents.get(message.recipient)
          : this.findCapableAgent(message);

        if (!recipient) {
          this.messageBus.emit('message:unrouted', {
            messageId: message.id,
            messageType: message.type,
            swarmId: this.swarmId,
          });
          continue;
        }

        // Process message with agent
        const response = await recipient.process(message);

        const latency = Date.now() - startTime;
        this.metrics.processedMessages++;
        this.metrics.totalLatency += latency;

        this.messageBus.emit('message:processed', {
          messageId: message.id,
          agentId: recipient.id,
          latency,
          swarmId: this.swarmId,
        });
      } catch (error) {
        this.metrics.failedMessages++;
        this.messageBus.emit('message:failed', {
          messageId: message.id,
          error,
          swarmId: this.swarmId,
        });
      }
    }

    this.messageBus.clearQueue();
  }

  /**
   * Find an agent capable of handling the message type
   */
  private findCapableAgent(message: MCPMessage): Agent | undefined {
    return Array.from(this.agents.values()).find((agent) =>
      agent.capabilities.includes(message.type)
    );
  }

  /**
   * Get swarm metrics
   */
  public getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const averageLatency =
      this.metrics.processedMessages > 0
        ? this.metrics.totalLatency / this.metrics.processedMessages
        : 0;

    return {
      swarmId: this.swarmId,
      isRunning: this.isRunning,
      agentCount: this.agents.size,
      processedMessages: this.metrics.processedMessages,
      failedMessages: this.metrics.failedMessages,
      successRate:
        this.metrics.processedMessages > 0
          ? (this.metrics.processedMessages /
              (this.metrics.processedMessages + this.metrics.failedMessages)) *
            100
          : 0,
      averageLatency: Math.round(averageLatency * 100) / 100,
      uptime,
    };
  }

  /**
   * Get swarm status
   */
  public getStatus() {
    return {
      swarmId: this.swarmId,
      status: this.isRunning ? 'running' : 'stopped',
      agents: Array.from(this.agents.values()).map((agent) => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        capabilities: agent.capabilities,
      })),
      metrics: this.getMetrics(),
    };
  }
}

/**
 * PolicyEngine: Enforces policies and rules on messages
 */
class PolicyEngine {
  private policies: Map<string, Policy> = new Map();
  private messageBus: MessageBus;
  private swarmRunner: SwarmRunner;
  private policyContext: PolicyContext;

  constructor(
    messageBus: MessageBus,
    swarmRunner: SwarmRunner,
    swarmId: string
  ) {
    this.messageBus = messageBus;
    this.swarmRunner = swarmRunner;
    this.policyContext = {
      swarmId,
      agents: new Map(
        swarmRunner.getAgents().map((agent) => [agent.id, agent])
      ),
      messageQueue: [],
      metrics: {
        processedMessages: 0,
        failedMessages: 0,
        averageLatency: 0,
      },
    };

    // Subscribe to all messages
    this.messageBus.subscribe('*', (message) => {
      this.evaluatePolicies(message);
    });
  }

  /**
   * Register a policy
   */
  public registerPolicy(policy: Policy): void {
    if (this.policies.has(policy.id)) {
      throw new Error(`Policy ${policy.id} is already registered`);
    }

    this.policies.set(policy.id, policy);
    this.messageBus.emit('policy:registered', {
      policyId: policy.id,
      policyName: policy.name,
    });
  }

  /**
   * Unregister a policy
   */
  public unregisterPolicy(policyId: string): void {
    if (this.policies.delete(policyId)) {
      this.messageBus.emit('policy:unregistered', { policyId });
    }
  }

  /**
   * Enable a policy
   */
  public enablePolicy(policyId: string): void {
    const policy = this.policies.get(policyId);
    if (policy) {
      policy.enabled = true;
      this.messageBus.emit('policy:enabled', { policyId });
    }
  }

  /**
   * Disable a policy
   */
  public disablePolicy(policyId: string): void {
    const policy = this.policies.get(policyId);
    if (policy) {
      policy.enabled = false;
      this.messageBus.emit('policy:disabled', { policyId });
    }
  }

  /**
   * Get a policy by ID
   */
  public getPolicy(policyId: string): Policy | undefined {
    return this.policies.get(policyId);
  }

  /**
   * Get all policies
   */
  public getPolicies(): Policy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Evaluate all policies for a message
   */
  private async evaluatePolicies(message: MCPMessage): Promise<void> {
    const sortedPolicies = Array.from(this.policies.values())
      .filter((p) => p.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const policy of sortedPolicies) {
      try {
        if (policy.condition(message, this.policyContext)) {
          await policy.action(message, this.policyContext);

          this.messageBus.emit('policy:applied', {
            policyId: policy.id,
            policyName: policy.name,
            messageId: message.id,
          });
        }
      } catch (error) {
        this.messageBus.emit('policy:error', {
          policyId: policy.id,
          error,
          messageId: message.id,
        });
      }
    }
  }

  /**
   * Get policy engine status
   */
  public getStatus() {
    return {
      policyCount: this.policies.size,
      enabledPolicies: Array.from(this.policies.values()).filter(
        (p) => p.enabled
      ).length,
      policies: Array.from(this.policies.values()).map((p) => ({
        id: p.id,
        name: p.name,
        priority: p.priority,
        enabled: p.enabled,
      })),
      context: {
        agentCount: this.policyContext.agents.size,
        messageQueueSize: this.policyContext.messageQueue.length,
        metrics: this.policyContext.metrics,
      },
    };
  }
}

/**
 * MCPGenerator: Main class for creating and managing MCP systems
 */
class MCPGenerator {
  private messageBuses: Map<string, MessageBus> = new Map();
  private swarmRunners: Map<string, SwarmRunner> = new Map();
  private policyEngines: Map<string, PolicyEngine> = new Map();

  /**
   * Create a new MCP system
   */
  public createMCPSystem(systemId: string): {
    messageBus: MessageBus;
    swarmRunner: SwarmRunner;
    policyEngine: PolicyEngine;
  } {
    if (this.messageBuses.has(systemId)) {
      throw new Error(`MCP system ${systemId} already exists`);
    }

    const messageBus = new MessageBus();
    const swarmRunner = new SwarmRunner(systemId, messageBus);
    const policyEngine = new PolicyEngine(messageBus, swarmRunner, systemId);

    this.messageBuses.set(systemId, messageBus);
    this.swarmRunners.set(systemId, swarmRunner);
    this.policyEngines.set(systemId, policyEngine);

    return { messageBus, swarmRunner, policyEngine };
  }

  /**
   * Get MCP system components
   */
  public getMCPSystem(systemId: string) {
    return {
      messageBus: this.messageBuses.get(systemId),
      swarmRunner: this.swarmRunners.get(systemId),
      policyEngine: this.policyEngines.get(systemId),
    };
  }

  /**
   * Destroy an MCP system
   */
  public destroyMCPSystem(systemId: string): void {
    const swarmRunner = this.swarmRunners.get(systemId);
    if (swarmRunner) {
      swarmRunner.stop();
    }

    this.messageBuses.delete(systemId);
    this.swarmRunners.delete(systemId);
    this.policyEngines.delete(systemId);
  }

  /**
   * Get all MCP systems
   */
  public getAllSystems() {
    return Array.from(this.messageBuses.keys()).map((systemId) => ({
      systemId,
      messageBus: this.messageBuses.get(systemId),
      swarmRunner: this.swarmRunners.get(systemId),
      policyEngine: this.policyEngines.get(systemId),
    }));
  }

  /**
   * Get system status report
   */
  public getSystemStatus(systemId: string) {
    const swarmRunner = this.swarmRunners.get(systemId);
    const policyEngine = this.policyEngines.get(systemId);
    const messageBus = this.messageBuses.get(systemId);

    if (!swarmRunner || !policyEngine || !messageBus) {
      throw new Error(`MCP system ${systemId} not found`);
    }

    return {
      systemId,
      timestamp: Date.now(),
      swarm: swarmRunner.getStatus(),
      policies: policyEngine.getStatus(),
      bus: messageBus.getStatistics(),
    };
  }
}

// Export classes and interfaces
export {
  MessageBus,
  SwarmRunner,
  PolicyEngine,
  MCPGenerator,
  MCPMessage,
  Agent,
  Policy,
  PolicyContext,
};
