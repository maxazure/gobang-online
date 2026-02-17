## ADDED Requirements

### Requirement: Game recording
The system SHALL automatically record all completed games.

#### Scenario: Record game data
- **WHEN** game completes
- **THEN** system saves:
  - All moves with timestamps
  - Player information
  - Game result
  - Rating changes
  - Game duration

#### Scenario: Game storage
- **WHEN** game is recorded
- **THEN** game is stored permanently
- **AND** data is indexed for retrieval

### Requirement: Game replay
The system SHALL allow users to replay recorded games.

#### Scenario: Load game
- **WHEN** user selects game from history
- **THEN** system loads complete game
- **AND** displays initial board position

#### Scenario: Step through moves
- **WHEN** user navigates replay
- **THEN** user can move forward/backward
- **AND** jump to specific move
- **AND** see move number and time

#### Scenario: Auto-play replay
- **WHEN** user starts auto-play
- **THEN** moves play automatically
- **AND** speed is adjustable

### Requirement: Personal game history
The system SHALL maintain game history for each user.

#### Scenario: View own history
- **WHEN** user views game history
- **THEN** system shows list of games
- **AND** games are sorted by date
- **AND** shows result and opponent

#### Scenario: Filter history
- **WHEN** user filters game history
- **THEN** can filter by:
  - Win/loss/draw
  - Ranked/casual
  - Opponent name
  - Date range

#### Scenario: History pagination
- **WHEN** user has many games
- **THEN** history is paginated
- **AND** shows 20 games per page

### Requirement: Game statistics
The system SHALL calculate and display game statistics.

#### Scenario: Win rate calculation
- **WHEN** user views stats
- **THEN** system calculates:
  - Overall win rate
  - Win rate vs AI
  - Win rate vs players
  - Win rate by opening

#### Scenario: Performance trends
- **WHEN** user views performance
- **THEN** system shows:
  - Recent form (last 10 games)
  - Rating changes over time
  - Average game length

#### Scenario: Achievement tracking
- **WHEN** user reaches milestone
- **THEN** system records achievement
- **AND** displays in profile

### Requirement: Export game data
The system SHALL allow users to export their game data.

#### Scenario: Export single game
- **WHEN** user exports game
- **THEN** system provides SGF format
- **AND** includes all moves and metadata

#### Scenario: Export all games
- **WHEN** user requests full export
- **THEN** system creates archive
- **AND** includes all games in SGF
- **AND** sends download link via email

### Requirement: Game sharing
The system SHALL allow users to share games with others.

#### Scenario: Share game link
- **WHEN** user shares game
- **THEN** system generates shareable link
- **AND** link opens game replay

#### Scenario: Embed game
- **WHEN** user wants to embed game
- **THEN** system provides embed code
- **AND** game can be embedded in websites

### Requirement: Public game database
The system SHALL maintain a public database of high-level games.

#### Scenario: Featured games
- **WHEN** high-rated players compete
- **THEN** game may be featured
- **AND** appears in public database

#### Scenario: Search games
- **WHEN** user searches public games
- **THEN** can search by player
- **AND** filter by rating range
- **AND** filter by opening
