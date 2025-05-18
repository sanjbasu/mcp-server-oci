// Mock incident logs for testing
export const systemLogs = [
  {
    id: "log1",
    timestamp: "2025-05-16T14:22:10Z",
    level: "ERROR",
    service: "api-gateway",
    message: "Connection timeout when calling authentication service"
  },
  {
    id: "log2",
    timestamp: "2025-05-16T14:22:15Z",
    level: "ERROR",
    service: "authentication",
    message: "Database connection pool exhausted"
  },
  {
    id: "log3",
    timestamp: "2025-05-16T14:23:05Z",
    level: "WARN",
    service: "user-service",
    message: "Slow query performance on user lookup"
  },
  {
    id: "log4",
    timestamp: "2025-05-16T14:24:30Z",
    level: "ERROR",
    service: "database",
    message: "High CPU utilization (95%) on database server"
  },
  {
    id: "log5",
    timestamp: "2025-05-16T14:25:10Z",
    level: "ERROR",
    service: "authentication",
    message: "Authentication service not responding to health checks"
  }
];

// Historical incidents for knowledge base
export const historicalIncidents = [
  {
    id: "INC001",
    title: "Authentication Service Outage",
    timestamp: "2025-03-10T08:15:00Z",
    symptoms: [
      "API gateway timeouts",
      "Database connection pool exhaustion",
      "Authentication service health check failures"
    ],
    rootCause: "Database connection leak in authentication service",
    resolution: "Deployed hotfix to properly close database connections in authentication service error paths",
    preventionSteps: [
      "Added connection pool monitoring",
      "Implemented circuit breaker pattern",
      "Set up automated alerts for connection pool utilization"
    ]
  },
  {
    id: "INC002",
    title: "Database Performance Degradation",
    timestamp: "2025-04-22T16:45:00Z",
    symptoms: [
      "Slow query responses",
      "High CPU utilization on database server",
      "Increased latency across all services"
    ],
    rootCause: "Missing index on frequently queried table",
    resolution: "Added proper indexing for high-frequency queries",
    preventionSteps: [
      "Scheduled regular query performance reviews",
      "Implemented query performance monitoring",
      "Set up automated testing for query execution plans"
    ]
  },
  {
    id: "INC003",
    title: "API Rate Limiting Failure",
    timestamp: "2025-02-05T12:30:00Z",
    symptoms: [
      "Sudden spike in API traffic",
      "Service resource exhaustion",
      "Cascading failures across microservices"
    ],
    rootCause: "Rate limiting service failure due to configuration error",
    resolution: "Fixed configuration and added redundancy to rate limiting service",
    preventionSteps: [
      "Implemented backup rate limiting mechanism",
      "Added configuration validation tests",
      "Set up better monitoring for traffic patterns"
    ]
  }
];

// Remediation strategies database
export const remediationStrategies = [
  {
    id: "REM001",
    issue: "Database connection pool exhaustion",
    strategies: [
      {
        name: "Increase pool size",
        description: "Temporarily increase the connection pool size to handle the immediate load",
        implementation: "Update the database.pool.maxConnections setting in the service configuration",
        considerations: "This is a temporary solution and doesn't address potential connection leaks"
      },
      {
        name: "Fix connection leaks",
        description: "Identify and fix connection leaks in the application code",
        implementation: "Review code paths that use database connections and ensure all connections are properly closed",
        considerations: "Requires application restart after deployment"
      },
      {
        name: "Implement connection timeout",
        description: "Add connection timeouts to prevent indefinite waiting",
        implementation: "Set database.pool.connectionTimeout in the service configuration",
        considerations: "May cause some legitimate long-running queries to fail"
      }
    ]
  },
  {
    id: "REM002",
    issue: "High CPU utilization",
    strategies: [
      {
        name: "Scale horizontally",
        description: "Add more instances of the affected service to distribute load",
        implementation: "Increase replica count in the orchestration platform",
        considerations: "Temporary solution that increases cost"
      },
      {
        name: "Optimize resource-intensive queries",
        description: "Identify and optimize the queries consuming the most resources",
        implementation: "Use database monitoring tools to identify top resource-consuming queries and refactor them",
        considerations: "Requires detailed analysis and potential code changes"
      },
      {
        name: "Implement caching",
        description: "Add caching for frequently accessed data",
        implementation: "Integrate a caching layer such as Redis",
        considerations: "Introduces complexity with cache invalidation"
      }
    ]
  },
  {
    id: "REM003",
    issue: "Service health check failures",
    strategies: [
      {
        name: "Restart service",
        description: "Restart the failing service",
        implementation: "Execute service restart procedure on the affected nodes",
        considerations: "Quick solution but doesn't address root cause"
      },
      {
        name: "Review resource allocation",
        description: "Check if the service has sufficient resources",
        implementation: "Analyze resource usage patterns and adjust CPU/memory allocation",
        considerations: "May require service restart to apply changes"
      },
      {
        name: "Check dependent services",
        description: "Verify that all dependencies are functioning correctly",
        implementation: "Run health checks on all upstream and downstream dependencies",
        considerations: "May uncover cascading failures across the system"
      }
    ]
  }
];
