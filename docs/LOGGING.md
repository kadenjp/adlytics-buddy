# Logger Implementation Guide

## Overview

This project now uses Winston-based structured logging instead of console.log/console.error statements. The logger provides:

- Environment-specific log levels and output formats
- Structured logging with metadata
- Context-aware logging with custom prefixes
- Specialized logging methods for common patterns (API requests, Stripe events, database operations)
- Test environment compatibility

## Usage

### Basic Usage

```typescript
import { createLogger } from '@/lib/providers/logger';

const logger = createLogger('MyService');

logger.info('Operation completed successfully');
logger.error('Something went wrong', { userId: '123', operation: 'update' });
logger.warn('Deprecated feature used', { feature: 'oldApi' });
logger.debug('Debug information', { data: someObject });
```

### Context-Specific Loggers

Create loggers with specific context names for better organization:

```typescript
// For API routes
const logger = createLogger('UserAPI');

// For services
const logger = createLogger('UserService');

// For providers
const logger = createLogger('StripeProvider');
```

### Specialized Logging Methods

The logger includes convenient methods for common logging patterns:

```typescript
// API request logging
logger.apiRequest('POST', '/api/users', 201);
logger.apiError('POST', '/api/users', error, 500);

// Stripe event logging
logger.stripeEvent('customer.subscription.created', 'evt_123');
logger.stripeError('customer.subscription.created', error, 'evt_123');

// Database operation logging
logger.databaseOperation('insert', 'users', true);
logger.databaseOperation('update', 'profiles', false);

// User action logging
logger.userAction('user_123', 'profile_update', { field: 'email' });
```

## Log Levels

The logger uses the following log levels (in order of severity):

1. **error** - Error conditions that need attention
2. **warn** - Warning conditions
3. **info** - General informational messages
4. **http** - HTTP request/response logging
5. **debug** - Detailed debugging information

## Environment Configuration

### Development
- **Log Level**: `debug` (shows all logs)
- **Format**: Colorized console output with timestamps
- **Output**: Console only

### Production
- **Log Level**: `warn` (shows warn and error only)
- **Format**: JSON format for structured logging
- **Output**: Console + log files (`logs/combined.log`, `logs/error.log`)

### Test
- **Log Level**: `error` (minimal logging)
- **Format**: Simple format
- **Output**: Silent by default (can be enabled with `LOGGER_ENABLED=true`)

## Files Modified

The following files were updated to use the new logger:

### API Routes
- `app/api/create-subscription/route.ts`
- `app/api/stripe/webhook/route.ts`

### Services
- `lib/services/UserService.ts`

### Providers
- `lib/providers/stripe/StripeProvider.ts`
- `lib/providers/supabase/SupabaseSubscriptionDatabaseProvider.ts`

## Migration Summary

All `console.log`, `console.error`, `console.warn`, etc. statements have been replaced with structured logging calls:

```typescript
// Before
console.error('Error fetching user profile:', error);

// After
logger.error('Error fetching user profile', { 
  userId, 
  error: error instanceof Error ? error.message : error 
});
```

## Best Practices

1. **Use descriptive context names** when creating loggers
2. **Include relevant metadata** in log calls (user IDs, operation details, etc.)
3. **Use appropriate log levels** (error for failures, info for successful operations, debug for detailed traces)
4. **Structure error information** properly by including error messages and stack traces
5. **Avoid logging sensitive information** (passwords, API keys, personal data)

## Benefits

- **Structured Output**: JSON format in production enables better log analysis
- **Environment Awareness**: Different log levels and formats for different environments
- **Context Preservation**: Each logger instance maintains its context for better traceability
- **Test Compatibility**: Handles test environments gracefully without interfering with test output
- **Professional Standards**: Industry-standard logging practices for production applications
