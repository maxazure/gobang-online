## ADDED Requirements

### Requirement: Lobby chat
The system SHALL provide a public chat room for all online users.

#### Scenario: Send message
- **WHEN** user types and sends message in lobby
- **THEN** message appears in lobby chat
- **AND** all online users see the message

#### Scenario: Message limit
- **WHEN** user sends more than 5 messages per minute
- **THEN** system applies rate limit
- **AND** displays warning message

#### Scenario: Chat history
- **WHEN** user joins lobby
- **THEN** system shows last 50 messages
- **AND** older messages are not loaded

### Requirement: Game room chat
The system SHALL provide chat functionality within game rooms.

#### Scenario: In-game chat
- **WHEN** player sends message in game room
- **THEN** opponent receives message immediately
- **AND** spectators also see message

#### Scenario: Quick chat
- **WHEN** player uses quick chat phrases
- **THEN** predefined phrases are sent
- **AND** phrases include: "GG", "Good luck", "Well played"

#### Scenario: Chat during game
- **WHEN** game is in progress
- **THEN** players can chat
- **AND** chat doesn't interfere with gameplay

### Requirement: Private messaging
The system SHALL allow users to send private messages to friends.

#### Scenario: Send PM
- **WHEN** user sends private message to friend
- **THEN** friend receives message
- **AND** conversation is private

#### Scenario: Block user
- **WHEN** user blocks another user
- **THEN** blocked user cannot send messages
- **AND** previous messages are hidden

### Requirement: Chat moderation
The system SHALL implement basic chat moderation.

#### Scenario: Profanity filter
- **WHEN** message contains profanity
- **THEN** system filters offensive words
- **AND** displays asterisks instead

#### Scenario: Spam detection
- **WHEN** user sends identical messages repeatedly
- **THEN** system detects spam
- **AND** may mute user temporarily

#### Scenario: Report functionality
- **WHEN** user reports inappropriate message
- **THEN** report is logged
- **AND** moderators can review

### Requirement: Chat settings
The system SHALL allow users to customize chat experience.

#### Scenario: Disable chat
- **WHEN** user disables chat
- **THEN** no messages are displayed
- **AND** user cannot send messages

#### Scenario: Chat notifications
- **WHEN** user receives message
- **THEN** system shows notification
- **AND** notification can be disabled
