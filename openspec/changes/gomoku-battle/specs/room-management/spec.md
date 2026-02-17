## ADDED Requirements

### Requirement: Create game room
The system SHALL allow users to create game rooms with customizable settings.

#### Scenario: Room creation
- **WHEN** user creates new room
- **THEN** system generates unique room ID
- **AND** user becomes room host
- **AND** room appears in room list

#### Scenario: Room settings
- **WHEN** host creates room
- **THEN** host can set:
  - Game mode (ranked/casual)
  - Time control
  - AI difficulty (if AI game)
  - Public/private visibility

#### Scenario: Room capacity
- **WHEN** room is created
- **THEN** room supports 2 players + unlimited spectators
- **AND** room exists until game ends

### Requirement: Join game room
The system SHALL allow users to join existing game rooms.

#### Scenario: Join public room
- **WHEN** user selects room from list
- **THEN** user joins as player if slot available
- **OR** joins as spectator if game in progress

#### Scenario: Join private room
- **WHEN** user enters room code
- **THEN** system validates code
- **AND** user joins if valid

#### Scenario: Room full
- **WHEN** user tries to join full room
- **THEN** system shows "Room full" message
- **AND** offers to spectate instead

### Requirement: Quick match
The system SHALL provide quick match functionality for instant games.

#### Scenario: Quick match ranked
- **WHEN** user clicks "Quick Match" for ranked
- **THEN** system searches for opponent
- **AND** creates room automatically when match found

#### Scenario: Quick match casual
- **WHEN** user clicks "Quick Match" for casual
- **THEN** system finds any available game
- **OR** creates new room if none available

#### Scenario: Match timeout
- **WHEN** no match found within 30 seconds
- **THEN** system offers to create room
- **OR** continue searching

### Requirement: Room management
The system SHALL allow hosts to manage their rooms.

#### Scenario: Kick player
- **WHEN** host kicks player
- **THEN** player is removed from room
- **AND** game is cancelled

#### Scenario: Change settings
- **WHEN** host modifies settings before game starts
- **THEN** settings are updated
- **AND** other player is notified

#### Scenario: Transfer host
- **WHEN** host leaves before game starts
- **THEN** host is transferred to other player
- **OR** room is closed if no players

### Requirement: Room listing
The system SHALL display available rooms to users.

#### Scenario: Room list display
- **WHEN** user views room list
- **THEN** system shows:
  - Room name/host
  - Game mode
  - Current players
  - Time control
  - Join button

#### Scenario: Filter rooms
- **WHEN** user filters room list
- **THEN** list can be filtered by:
  - Game mode
  - Time control
  - Friends only

#### Scenario: Sort rooms
- **WHEN** user sorts room list
- **THEN** list can be sorted by:
  - Creation time
  - Rating range
  - Player count

### Requirement: Invite system
The system SHALL allow users to invite others to games.

#### Scenario: Invite friend
- **WHEN** user invites friend to game
- **THEN** friend receives invitation
- **AND** can accept or decline

#### Scenario: Invite link
- **WHEN** user generates invite link
- **THEN** link can be shared externally
- **AND** clicking link joins room

#### Scenario: Invitation expiry
- **WHEN** invitation is sent
- **THEN** invitation expires after 5 minutes
- **AND** game starts or cancels based on response

### Requirement: Spectator slots
The system SHALL support unlimited spectators in game rooms.

#### Scenario: Spectator joins
- **WHEN** spectator joins room
- **THEN** spectator is added to spectator list
- **AND** can watch game with delay

#### Scenario: Spectator list
- **WHEN** viewing room info
- **THEN** system shows spectator count
- **AND** shows spectator names (if not anonymous)
