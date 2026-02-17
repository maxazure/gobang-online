## ADDED Requirements

### Requirement: Multiple difficulty levels
The system SHALL provide at least 4 difficulty levels for AI opponents.

#### Scenario: Easy difficulty
- **WHEN** player selects easy AI
- **THEN** AI uses search depth of 2
- **AND** responds within 100ms
- **AND** makes occasional mistakes

#### Scenario: Medium difficulty
- **WHEN** player selects medium AI
- **THEN** AI uses search depth of 4
- **AND** responds within 300ms
- **AND** plays reasonably well

#### Scenario: Hard difficulty
- **WHEN** player selects hard AI
- **THEN** AI uses search depth of 6
- **AND** responds within 1000ms
- **AND** plays at advanced level

#### Scenario: Master difficulty
- **WHEN** player selects master AI
- **THEN** AI uses search depth of 8
- **AND** responds within 3000ms
- **AND** plays at expert level

### Requirement: Minimax algorithm implementation
The system SHALL implement the Minimax algorithm for AI decision making.

#### Scenario: Position evaluation
- **WHEN** AI evaluates a board position
- **THEN** system calculates score based on:
  - Number of open rows of 4, 3, 2
  - Blocked rows
  - Center control
  - Threat patterns

#### Scenario: Move selection
- **WHEN** AI needs to make a move
- **THEN** system searches through possible moves
- **AND** selects move with highest minimax value

#### Scenario: Terminal state detection
- **WHEN** search reaches terminal state (win/loss/draw)
- **THEN** system returns appropriate score
- **AND** backtracks through the tree

### Requirement: Alpha-Beta pruning optimization
The system SHALL implement Alpha-Beta pruning to improve search efficiency.

#### Scenario: Pruning effectiveness
- **WHEN** AI performs minimax search with alpha-beta pruning
- **THEN** system prunes unnecessary branches
- **AND** search time is reduced by at least 50%

#### Scenario: Move ordering
- **WHEN** AI evaluates moves
- **THEN** system orders moves by heuristic value
- **AND** better moves are evaluated first
- **AND** pruning is more effective

#### Scenario: Transposition table
- **WHEN** same position is encountered multiple times
- **THEN** system uses cached evaluation
- **AND** avoids redundant calculation

### Requirement: Response time limits
The system SHALL ensure AI responds within configurable time limits.

#### Scenario: Time limit enforcement
- **WHEN** AI calculation exceeds time limit
- **THEN** system returns best move found so far
- **AND** displays "thinking..." indicator while calculating

#### Scenario: Iterative deepening
- **WHEN** AI is calculating with time limit
- **THEN** system uses iterative deepening
- **AND** returns best result when time expires
- **AND** ensures a move is always available

### Requirement: Opening book
The system SHALL use an opening book for common starting positions.

#### Scenario: Opening move lookup
- **WHEN** game is in early stage (first 10 moves)
- **THEN** system checks opening book
- **AND** uses book move if available
- **AND** responds instantly

#### Scenario: Book move quality
- **WHEN** opening book is used
- **THEN** moves are strategically sound
- **AND** follow established opening theory

#### Scenario: Fallback to calculation
- **WHEN** position is not in opening book
- **THEN** system uses minimax calculation
- **AND** continues normally

### Requirement: Endgame optimization
The system SHALL optimize play in endgame situations.

#### Scenario: Forced win detection
- **WHEN** AI detects a forced winning sequence
- **THEN** system executes the winning moves
- **AND** doesn't deviate from winning path

#### Scenario: Defensive play
- **WHEN** AI is in losing position
- **THEN** system plays defensively
- **AND** tries to extend the game
- **AND** hopes for opponent mistake

### Requirement: Resource usage control
The system SHALL limit CPU and memory usage during AI calculation.

#### Scenario: Web Worker isolation
- **WHEN** AI is calculating
- **THEN** calculation runs in Web Worker
- **AND** doesn't block UI thread
- **AND** user interface remains responsive

#### Scenario: Memory limit
- **WHEN** AI uses transposition table
- **THEN** table size is limited to 50MB
- **AND** old entries are evicted when full

#### Scenario: CPU throttling
- **WHEN** AI calculates for extended period
- **THEN** system yields control periodically
- **AND** allows other operations to proceed

### Requirement: Adaptive difficulty
The system MAY adjust AI difficulty based on player skill level.

#### Scenario: Skill estimation
- **WHEN** player plays multiple games against AI
- **THEN** system estimates player skill
- **AND** suggests appropriate difficulty

#### Scenario: Dynamic adjustment
- **WHEN** player consistently wins or loses
- **THEN** system may suggest difficulty change
- **AND** player can accept or reject suggestion
