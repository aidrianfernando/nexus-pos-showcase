# Selected Code Samples

This public showcase includes a curated set of representative production-derived code samples from NEXUS.

The goal is to demonstrate coding style, architecture, error handling, frontend component design, database access patterns, and automated testing without publishing the complete proprietary application.

## Backend Layering

Files:

- `code-samples/backend/categoryRoutes.js`
- `code-samples/backend/categoryController.js`
- `code-samples/backend/categoryService.js`
- `code-samples/backend/categoryRepository.js`

These files demonstrate the layered backend flow:

`Route -> Middleware -> Controller -> Service -> Repository -> PostgreSQL`

Highlights include:

- authentication and role authorization
- HTTP/controller separation
- service-layer validation
- conflict and not-found handling
- parameterized PostgreSQL queries
- persistence isolated behind a repository layer

The public repository copy omits unrelated implementation details for clarity and source protection.

## Frontend API Client

File:

- `code-samples/frontend/apiClient.js`

This sample demonstrates:

- environment-based API configuration
- bounded request timeouts
- safe retry behavior for GET and HEAD requests
- exponential backoff with jitter
- `Retry-After` handling
- Bearer token attachment
- centralized unauthorized-session handling

Business mutations are not generically retried.

## Error Mapping

File:

- `code-samples/frontend/getErrorMessage.js`

This sample demonstrates centralized user-facing error handling with network, permission, backend, fallback, and request-reference support.

## React Component

File:

- `code-samples/frontend/PosProductCard.jsx`

This sample demonstrates:

- functional React component design
- defensive product-data normalization
- stock-state presentation
- Philippine Peso formatting
- accessible button labeling
- derived UI state and add-to-cart constraints

The showcase version uses a local icon implementation so the component remains self-contained.

## Automated Testing

File:

- `code-samples/tests/observability.test.js`

The selected tests demonstrate:

- request ID propagation
- rejection of unsafe request identifiers
- server-generated UUID fallback
- structured logging
- sensitive-value redaction
- query-string suppression in request logs
- error-handler observability contracts

Tests that expose internal transaction, Return/Void, RBAC, or reconciliation implementation details are intentionally excluded from the public showcase.

## Source Boundary

These samples are representative excerpts and curated adaptations of the private production codebase.

The complete application source, database migrations, transaction-concurrency implementation, Return/Void internals, full RBAC implementation, production configuration, and other proprietary implementation details remain private.
