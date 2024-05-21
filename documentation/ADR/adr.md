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

## 5 - Enforcing User Authentication for Application Access

#### Context

The project requires that users must be authenticated before accessing the different parts of the application.

#### Decision

Users must log in to access the application, either by registering for an account or signing in as a guest. Only authenticated users will be able to access the landing page and proceed to create or join a game.

#### Status

Accepted

#### Consequences

- Enhances the security and integrity of user data by ensuring that access is limited to authenticated users.
- Provides a streamlined navigation flow, reducing unauthorized access to game features.

## 6 - Creating Public and Private Games with Minimum Player Requirement

#### Context

The project requires a system that allows users to create games with different access levels and maintain a minimum number of players before starting.

#### Decision

Users can create either:

1. A **Public Game:** Any user can join a public game visible in the list of available games.
2. A **Private Game:** Accessible only through a unique room code provided by the host.

Additionally, the host can only start a game if there are at least three players joined.

#### Status

Accepted

#### Consequences

- Enables flexibility for different gameplay styles (open vs. private games).
- Requires proper validation to ensure games are only started with the minimum player requirement.
- Public games provide broader participation but may require additional management to handle room visibility.
- Private games enhance security and allow selective participation by trusted users.

## 7 - Handling Player Departure During a Game

#### Context

The project needs to handle scenarios where players leave a game during an active session to maintain gameplay integrity and user experience.

#### Decision

If a player leaves the game, the following actions will be taken based on the round's status:

1. **If the round is incomplete:**

   - **Less than 3 players left:** The remaining players are redirected to the landing page as the game cannot continue.
   - **3 or more players remain:** A new round is started with the remaining players.

2. **If the round is complete:**
   - A new round can only be started if more than 2 players remain.

#### Status

Accepted

#### Consequences

- Ensures that games only proceed with the minimum required number of players.
- Redirecting players to the landing page prevents incomplete games from continuing, maintaining a fair and enjoyable experience.
- Requires real-time updates and checks to handle player departures efficiently.
- May require additional communication to players about game status when a player leaves.
