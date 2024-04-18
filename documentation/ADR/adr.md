# ADR

## 1 - Using WebSockets for client-server communication

#### Context

The project requires bi-directional low-latency client-server communication

#### Decision

We will use WebSockets for communication

#### Status

Accepted

#### Consequences

WebSockets take longer to set up but provide faster Communication

## 2 - Using PostgreSQL for storage

#### Context

This project requires data persistence across multiple sessions

#### Decision

We will use a relational databsae, specifically PostgreSQL

#### Status

Accepted

#### Consequences

Provides consistent database design which is easily queryable, but may have limitations for high-volume transactions
