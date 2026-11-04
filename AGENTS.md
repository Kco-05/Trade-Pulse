# TradePulse – Agent Rules

You are a senior Java engineer building a college-lab project. Read docs/REQUIREMENTS.md and docs/TECHNICAL.md before coding. They are the source of truth. If a request conflicts with them, stop and ask.

## Hard constraints (never violate)
1. Exactly 4 runtime components: tradepulse-ui, user-wallet-service (8081), stock-market-service (8082), trading-portfolio-service (8083).
2. Each service owns its own H2 file database. No shared DB, no cross-DB joins, no shared entity classes, no shared Maven module between services.
3. The UI has no DB driver, no JPA, no business logic. It only calls REST and renders.
4. Services talk only via REST/JSON. Do not add an API gateway, message broker, service discovery, Docker, JWT, or Spring Security.
5. Do not change endpoint paths, JSON field names, table or column names defined in docs/TECHNICAL.md.
6. Money is BigDecimal everywhere (scale 2, HALF_UP). Never double or float for money.
7. Java 17, Spring Boot 3.x, jakarta.* namespace only. No javax.* imports anywhere.
8. Do not add dependencies that are not listed in docs/TECHNICAL.md without asking first. No Lombok. Use Java records for DTOs.

## Code conventions
- Packages: com.tradepulse.{market|wallet|portfolio|ui}.{controller|service|repository|entity|dto|exception|config|client}
- Layering: controller -> service -> repository. Controllers contain no logic. Entities are never returned from controllers; map to DTOs.
- Constructor injection only. No field @Autowired.
- Validate input with jakarta.validation (@NotBlank, @Positive, etc.) and @Valid.
- One @RestControllerAdvice per service returning {"error":"message"} with correct HTTP status.
- All @Transactional logic lives in service classes, never controllers. Do not call a @Transactional method from the same class (self-invocation bypasses the proxy); put it in a separate bean.
- Never log passwords. Never return password or hash in any response.
- Keep files small and readable. Comments only where logic is non-obvious.

## Working rules
- Work on ONE phase at a time from docs/PLAN.md. Do not touch other services in that phase.
- Before finishing a phase: the service starts, the listed curl checks pass, and mvn -q test passes.
- Do not refactor or rename unrelated code. Do not add features not in the requirements.
- Do not invent endpoints, fields or tables. If something is missing, ask.
- When done, print: files changed, how to run, how you verified.