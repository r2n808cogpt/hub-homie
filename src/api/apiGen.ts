import * as fs from 'fs';
import * as path from 'path';
import { Router, Express, Request, Response, NextFunction } from 'express';

/**
 * Configuration interface for API generation
 */
export interface ApiGeneratorConfig {
  basePath: string;
  outputDir: string;
  port?: number;
  enableCors?: boolean;
  enableLogging?: boolean;
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
}

/**
 * Route definition interface
 */
export interface RouteDefinition {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  handler: (req: Request, res: Response, next?: NextFunction) => void;
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
  description?: string;
}

/**
 * Router module definition
 */
export interface RouterModuleDefinition {
  name: string;
  basePath: string;
  routes: RouteDefinition[];
  description?: string;
}

/**
 * API Generator class - Creates Express server files and routing infrastructure
 */
export class ApiGenerator {
  private config: ApiGeneratorConfig;
  private routers: Map<string, Router> = new Map();
  private routerModules: Map<string, RouterModuleDefinition> = new Map();

  constructor(config: ApiGeneratorConfig) {
    this.config = {
      port: 3000,
      enableCors: true,
      enableLogging: true,
      ...config,
    };
    this.ensureOutputDirectory();
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Register a router module definition
   */
  public registerRouterModule(module: RouterModuleDefinition): void {
    this.routerModules.set(module.name, module);
  }

  /**
   * Register multiple router modules
   */
  public registerRouterModules(modules: RouterModuleDefinition[]): void {
    modules.forEach((module) => this.registerRouterModule(module));
  }

  /**
   * Create a router from a module definition
   */
  public createRouter(module: RouterModuleDefinition): Router {
    const router = Router();

    module.routes.forEach((route) => {
      const routeHandler = route.middleware
        ? [...route.middleware, route.handler]
        : [route.handler];

      switch (route.method) {
        case 'get':
          router.get(route.path, ...routeHandler);
          break;
        case 'post':
          router.post(route.path, ...routeHandler);
          break;
        case 'put':
          router.put(route.path, ...routeHandler);
          break;
        case 'delete':
          router.delete(route.path, ...routeHandler);
          break;
        case 'patch':
          router.patch(route.path, ...routeHandler);
          break;
      }
    });

    this.routers.set(module.name, router);
    return router;
  }

  /**
   * Generate Express server file
   */
  public generateServerFile(app: Express, filename: string = 'server.ts'): void {
    const serverContent = this.buildServerFileContent(app);
    const filePath = path.join(this.config.outputDir, filename);
    
    fs.writeFileSync(filePath, serverContent, 'utf8');
    console.log(`✓ Generated server file: ${filePath}`);
  }

  /**
   * Build server file content
   */
  private buildServerFileContent(app: Express): string {
    const imports = `import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';`;

    const corsConfig = this.config.enableCors
      ? `
// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200,
}));`
      : '';

    const loggingConfig = this.config.enableLogging
      ? `
// Request Logging
app.use(morgan('dev'));`
      : '';

    const middlewareSetup = this.config.middleware
      ? `
// Custom Middleware
${this.config.middleware.map((_, i) => `app.use(customMiddleware${i});`).join('\n')}`
      : '';

    const routerMounts = Array.from(this.routerModules.values())
      .map((module) => `app.use('${module.basePath}', ${module.name}Router);`)
      .join('\n');

    const healthCheck = `
// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});`;

    const errorHandler = `
// Error Handler Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});`;

    const serverStart = `
// Start Server
const PORT = process.env.PORT || ${this.config.port};
app.listen(PORT, () => {
  console.log(\`🚀 Server is running on port \${PORT}\`);
  console.log(\`📍 Base URL: http://localhost:\${PORT}\`);
});`;

    return `${imports}

const app: Express = express();

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
${corsConfig}${loggingConfig}${middlewareSetup}

// Router Mounts
${routerMounts}

// Route Handlers${healthCheck}

// Error Handling${errorHandler}
${serverStart}

export default app;
`;
  }

  /**
   * Generate router module file
   */
  public generateRouterFile(
    module: RouterModuleDefinition,
    filename?: string
  ): void {
    const routerContent = this.buildRouterFileContent(module);
    const file = filename || `${module.name}.router.ts`;
    const filePath = path.join(this.config.outputDir, file);
    
    fs.writeFileSync(filePath, routerContent, 'utf8');
    console.log(`✓ Generated router file: ${filePath}`);
  }

  /**
   * Build router file content
   */
  private buildRouterFileContent(module: RouterModuleDefinition): string {
    const imports = `import { Router, Request, Response, NextFunction } from 'express';`;

    const routeHandlers = module.routes
      .map((route) => {
        const handlerName = `${route.method}${route.path.split('/').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('')}Handler`;
        return `
/**
 * ${route.description || `${route.method.toUpperCase()} ${route.path}`}
 */
const ${handlerName} = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // TODO: Implement handler logic
    res.status(200).json({ message: '${handlerName} not implemented' });
  } catch (error) {
    next(error);
  }
};`;
      })
      .join('\n');

    const router = `
const router = Router();

// Routes`;

    const routeMappings = module.routes
      .map((route) => {
        const handlerName = `${route.method}${route.path.split('/').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('')}Handler`;
        return `router.${route.method}('${route.path}', ${handlerName});`;
      })
      .join('\n');

    return `${imports}

/**
 * ${module.name} Router Module
 * Base Path: ${module.basePath}
 * ${module.description ? `Description: ${module.description}` : ''}
 */
${routeHandlers}

${router}
${routeMappings}

export default router;
`;
  }

  /**
   * Generate all router files for registered modules
   */
  public generateAllRouterFiles(): void {
    Array.from(this.routerModules.values()).forEach((module) => {
      this.generateRouterFile(module);
    });
  }

  /**
   * Generate routing documentation
   */
  public generateRoutingDocumentation(filename: string = 'ROUTING.md'): void {
    const documentation = this.buildRoutingDocumentation();
    const filePath = path.join(this.config.outputDir, filename);
    
    fs.writeFileSync(filePath, documentation, 'utf8');
    console.log(`✓ Generated routing documentation: ${filePath}`);
  }

  /**
   * Build routing documentation content
   */
  private buildRoutingDocumentation(): string {
    let doc = '# API Routing Documentation\n\n';
    doc += `Generated on: ${new Date().toISOString()}\n\n`;

    Array.from(this.routerModules.values()).forEach((module) => {
      doc += `## ${module.name}\n`;
      doc += `**Base Path:** \`${module.basePath}\`\n\n`;
      
      if (module.description) {
        doc += `${module.description}\n\n`;
      }

      doc += '### Routes\n\n';
      doc += '| Method | Path | Description |\n';
      doc += '|--------|------|-------------|\n';

      module.routes.forEach((route) => {
        const method = route.method.toUpperCase().padEnd(6);
        const fullPath = `${module.basePath}${route.path}`;
        const description = route.description || '-';
        doc += `| ${method} | \`${fullPath}\` | ${description} |\n`;
      });

      doc += '\n';
    });

    return doc;
  }

  /**
   * Get all registered routers
   */
  public getRouters(): Map<string, Router> {
    return this.routers;
  }

  /**
   * Get all registered router modules
   */
  public getRouterModules(): Map<string, RouterModuleDefinition> {
    return this.routerModules;
  }

  /**
   * Get configuration
   */
  public getConfig(): ApiGeneratorConfig {
    return this.config;
  }
}

/**
 * Factory function to create and configure API generator
 */
export function createApiGenerator(config: Partial<ApiGeneratorConfig>): ApiGenerator {
  return new ApiGenerator(config as ApiGeneratorConfig);
}

/**
 * Utility function to create route definitions
 */
export function createRoute(
  path: string,
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  handler: (req: Request, res: Response, next?: NextFunction) => void,
  options?: {
    middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
    description?: string;
  }
): RouteDefinition {
  return {
    path,
    method,
    handler,
    middleware: options?.middleware,
    description: options?.description,
  };
}

/**
 * Utility function to create router module definitions
 */
export function createRouterModule(
  name: string,
  basePath: string,
  routes: RouteDefinition[],
  description?: string
): RouterModuleDefinition {
  return {
    name,
    basePath,
    routes,
    description,
  };
}

export default ApiGenerator;
