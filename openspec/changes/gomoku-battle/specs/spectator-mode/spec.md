## ADDED Requirements

### Requirement: Real-time spectating
The system SHALL allow users to spectate ongoing games in real-time with configurable delay.

#### Scenario: Join as spectator
- **WHEN** user selects a game to spectate
- **THEN** user joins as spectator
- **AND** receives current board state
- **AND** sees 3-5 move delayed game

#### Scenario: Delayed broadcast
- **WHEN** spectator is watching
- **THEN** moves are delayed by 3-5 moves
- **AND** spectator cannot see current position
- **AND** prevents cheating via spectator

#### Scenario: Multiple spectators
- **WHEN** multiple users spectate same game
- **THEN** all see same delayed state
- **AND** spectator count is displayed

### Requirement: Spectator UI
The system SHALL provide dedicated UI for spectators.

#### Scenario: Spectator controls
- **WHEN** user is spectating
- **THEN** UI shows game info (players, ratings)
- **AND** shows move history
- **AND** provides chat for spectators
- **AND** doesn't allow interaction with board

#### Scenario: Leave spectating
- **WHEN** spectator clicks leave
- **THEN** spectator exits game room
- **AND** returns to lobby

### Requirement: Anti-cheating measures
The system SHALL prevent spectators from cheating.

#### Scenario: Delay enforcement
- **WHEN** spectator tries to view live position
- **THEN** system enforces delay
- **AND** cannot bypass delay

#### Scenario: Spectator anonymity
- **WHEN** game is ranked
- **THEN** spectators may be hidden
- **AND** players don't see spectator names

### Requirement: Spectator permissions
The system SHALL control who can spectate games.

#### Scenario: Public games
- **WHEN** game is public
- **THEN** any user can spectate
- **AND** game appears in game list

#### Scenario: Private games
- **WHEN** game is private
- **THEN** only invited users can spectate
- **AND** game doesn't appear in public list

#### Scenario: Friend-only spectating
- **WHEN** player sets friend-only spectating
- **THEN** only friends can spectate
- **AND** strangers are blocked
