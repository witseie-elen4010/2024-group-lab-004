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

## 3 - Using AWS for database hosting

#### Context

This project requires data persistence across multiple sessions. This requires a non locally hosted database so all user traffic moves through a central point.

#### Decision

We will use AWS for this as they allow a one year free-tier hosting service. We also have previous experience with AWS.

#### Status

Accepted

#### Consequences

Provides consistent database design which is easily scalable to meet application requirements

## 4 - Using express-session and pg-simple for automatic session management

#### Context

This project requires session management so we are able to tailor experiences to the currently logged in user.

#### Decision

We will use pg-simple for this as it integrates seemlessly with our database choice and automates cookie creation and destrcution.

#### Status

Accepted

#### Consequences

Provides session information specific to the user which allows us to provide account specific functionality.
