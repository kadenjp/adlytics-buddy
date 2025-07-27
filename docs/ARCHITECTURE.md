# Architecture Overview

This project uses a layered architecture to enable clean separation of concerns, extensibility, and testability. The main layers are:

## 1. Interfaces
- Define contracts for database and integration providers.
- Example: `IUserInformationDatabase`, `IBusinessProfileDatabase`, `IPaymentProvider`.

## 2. Providers
- Implement interfaces for specific technologies (e.g., Supabase, Stripe).
- Example: `supabaseUserInformationDatabase`, `stripePaymentProvider`.

## 3. Services
- Coordinate related business logic across multiple providers.
- Services receive provider implementations via dependency injection.
- Example: `UserService` coordinates user and business profile providers.

## 4. Repositories
- Coordinate services and libraries, possibly unrelated, for higher-level workflows.
- Repositories receive services and other dependencies via injection.
- Example: `CustomerRepository` coordinates Stripe and Supabase services.

---

## Dependency Injection Example

```typescript
// Example: Injecting providers into a service
import { UserService } from './lib/supabase/UserService';
import { supabaseUserInformationDatabase } from './lib/supabaseUserInformationDatabase';
import { supabaseBusinessProfileDatabase } from './lib/supabaseBusinessProfileDatabase';

const userService = new UserService(
  supabaseUserInformationDatabase,
  supabaseBusinessProfileDatabase
);
```

---

## Adding a New Provider

1. Implement the relevant interface:
```typescript
// Example: New database provider
export const customUserInformationDatabase: IUserInformationDatabase = {
  // ...implement methods...
};
```
2. Inject into services as needed.

---

## Service Composition Example

```typescript
// Example: Repository coordinating multiple services
import { CustomerRepository } from './lib/customerRepository';
import { userService } from './lib/supabase/UserService';
import { paymentProvider } from './lib/stripePaymentProvider';

const customerRepo = new CustomerRepository(userService, paymentProvider);
```

---

## Best Practices
- Keep business logic in services, not UI components.
- Use interfaces for all external dependencies.
- Inject dependencies for testability and flexibility.
- Repositories should compose services and libraries for complex workflows.

---

## Folder Structure
- `/lib/interfaces.ts` — Interface definitions
- `/lib/*Provider.ts` — Provider implementations
- `/lib/*Service.ts` — Service classes
- `/lib/*Repository.ts` — Repository classes
- `/components/pages/*` — UI components (should only use services)

---

## Extending the Architecture
- To add a new integration, create a provider implementing the relevant interface.
- To add new business logic, create or extend a service.
- To coordinate multiple services/libraries, create a repository.

---

## Example Workflow
1. UI calls a service method (e.g., `userService.completeOnboarding`).
2. Service coordinates providers to perform business logic.
3. Repository (if needed) coordinates multiple services/libraries for complex flows.

---

For further details, see the code comments in each layer.
