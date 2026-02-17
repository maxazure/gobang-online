## ADDED Requirements

### Requirement: Send friend request
The system SHALL allow users to send friend requests to other users.

#### Scenario: Send request
- **WHEN** user sends friend request
- **THEN** recipient receives notification
- **AND** request appears in pending list

#### Scenario: Accept request
- **WHEN** user accepts friend request
- **THEN** both users become friends
- **AND** appear in each other's friend list

#### Scenario: Decline request
- **WHEN** user declines friend request
- **THEN** requester is notified
- **AND** no friendship is created

#### Scenario: Cancel request
- **WHEN** requester cancels pending request
- **THEN** request is removed
- **AND** recipient doesn't see it

### Requirement: Friend list management
The system SHALL maintain a friend list for each user.

#### Scenario: View friend list
- **WHEN** user views friend list
- **THEN** shows all friends
- **AND** indicates online status
- **AND** shows current activity (in game, in lobby)

#### Scenario: Remove friend
- **WHEN** user removes friend
- **THEN** friendship is terminated
- **AND** both users are removed from friend lists

#### Scenario: Friend list limit
- **WHEN** user has 200 friends
- **THEN** cannot add more friends
- **AND** must remove friend first

### Requirement: Online status
The system SHALL show friends' online status.

#### Scenario: Online indicator
- **WHEN** friend is online
- **THEN** green indicator is shown
- **AND** last activity is displayed

#### Scenario: Offline indicator
- **WHEN** friend is offline
- **THEN** gray indicator is shown
- **AND** last online time is displayed

#### Scenario: In-game status
- **WHEN** friend is in game
- **THEN** special indicator is shown
- **AND** game info is displayed (if public)

### Requirement: Block users
The system SHALL allow users to block other users.

#### Scenario: Block user
- **WHEN** user blocks another user
- **THEN** blocked user cannot:
  - Send friend request
  - Send messages
  - Invite to games
  - See online status

#### Scenario: Unblock user
- **WHEN** user unblocks user
- **THEN** restrictions are removed
- **AND** normal interaction is restored

#### Scenario: Block list
- **WHEN** user views block list
- **THEN** shows all blocked users
- **AND** can unblock from list

### Requirement: Invite friends to games
The system SHALL allow inviting friends to games.

#### Scenario: Invite from friend list
- **WHEN** user clicks invite on friend
- **THEN** friend receives game invitation
- **AND** can accept or decline

#### Scenario: Invite accepted
- **WHEN** friend accepts invitation
- **THEN** game room is created
- **AND** both players join automatically

#### Scenario: Invite declined
- **WHEN** friend declines invitation
- **THEN** requester is notified
- **AND** can invite others

### Requirement: Friend suggestions
The system MAY suggest potential friends.

#### Scenario: Recent opponents
- **WHEN** user finishes game
- **THEN** system suggests adding opponent as friend
- **AND** can accept or dismiss

#### Scenario: Mutual friends
- **WHEN** user has mutual friends with another user
- **THEN** system may suggest friendship
- **AND** shows mutual connection

### Requirement: Friend activity feed
The system SHALL show friends' recent activity.

#### Scenario: Activity notifications
- **WHEN** friend achieves milestone
- **THEN** activity appears in feed
- **AND** shows: achieved Master tier, won tournament

#### Scenario: Feed display
- **WHEN** user views activity feed
- **THEN** shows recent friend activities
- **AND** sorted by recency
- **AND** limited to last 50 activities

### Requirement: Privacy settings
The system SHALL allow controlling friend-related privacy.

#### Scenario: Hide online status
- **WHEN** user enables "appear offline"
- **THEN** friends see user as offline
- **AND** can still play games

#### Scenario: Friend-only mode
- **WHEN** user enables friend-only mode
- **THEN** only friends can:
  - Send messages
  - Invite to games
  - View profile

#### Scenario: Activity visibility
- **WHEN** user disables activity sharing
- **THEN** activity doesn't appear in friends' feeds
- **AND** maintains privacy
