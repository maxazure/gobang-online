## ADDED Requirements

### Requirement: User registration
The system SHALL allow new users to create accounts with email and password.

#### Scenario: Successful registration
- **WHEN** user provides valid email and strong password
- **THEN** system creates new account
- **AND** sends verification email
- **AND** displays success message

#### Scenario: Duplicate email
- **WHEN** user registers with existing email
- **THEN** system rejects registration
- **AND** displays "Email already registered" message

#### Scenario: Weak password
- **WHEN** user provides password less than 8 characters
- **THEN** system rejects registration
- **AND** displays password requirements

#### Scenario: Invalid email format
- **WHEN** user provides malformed email
- **THEN** system rejects registration
- **AND** displays "Invalid email format" message

### Requirement: Email verification
The system SHALL require email verification before account activation.

#### Scenario: Verification email sent
- **WHEN** user completes registration
- **THEN** system sends verification email within 1 minute
- **AND** email contains verification link

#### Scenario: Successful verification
- **WHEN** user clicks verification link
- **THEN** account is activated
- **AND** user is redirected to login page

#### Scenario: Expired verification link
- **WHEN** user clicks verification link after 24 hours
- **THEN** link is expired
- **AND** user can request new verification email

#### Scenario: Resend verification
- **WHEN** user requests new verification email
- **THEN** system sends new link
- **AND** invalidates previous link

### Requirement: User login
The system SHALL authenticate users with email and password.

#### Scenario: Successful login
- **WHEN** user provides correct credentials
- **THEN** system generates JWT token
- **AND** user is logged in
- **AND** redirected to home page

#### Scenario: Invalid credentials
- **WHEN** user provides incorrect email or password
- **THEN** system rejects login
- **AND** displays "Invalid credentials" message
- **AND** doesn't reveal which field is incorrect

#### Scenario: Unverified account
- **WHEN** user tries to login with unverified email
- **THEN** system rejects login
- **AND** displays "Please verify your email" message
- **AND** offers to resend verification

#### Scenario: Account locked
- **WHEN** user fails login 5 times consecutively
- **THEN** account is temporarily locked for 15 minutes
- **AND** displays lockout message

### Requirement: JWT token management
The system SHALL use JWT tokens for session management.

#### Scenario: Token generation
- **WHEN** user logs in successfully
- **THEN** system generates JWT with 24-hour expiration
- **AND** token contains user ID and role
- **AND** token is signed with secret key

#### Scenario: Token validation
- **WHEN** user makes authenticated request
- **THEN** system validates token signature
- **AND** checks expiration time
- **AND** extracts user information

#### Scenario: Token refresh
- **WHEN** token is about to expire (within 1 hour)
- **THEN** system automatically refreshes token
- **AND** new token has fresh 24-hour expiration

#### Scenario: Token revocation
- **WHEN** user logs out
- **THEN** token is added to blacklist
- **AND** future requests with that token are rejected

### Requirement: Password management
The system SHALL provide secure password management features.

#### Scenario: Password change
- **WHEN** user requests password change
- **THEN** system requires current password
- **AND** validates new password strength
- **AND** updates password hash

#### Scenario: Password reset request
- **WHEN** user forgets password
- **THEN** system sends reset link to email
- **AND** link expires after 1 hour

#### Scenario: Password reset completion
- **WHEN** user clicks reset link and provides new password
- **THEN** password is updated
- **AND** all existing sessions are invalidated

#### Scenario: Password hashing
- **WHEN** password is stored
- **THEN** system uses bcrypt with cost factor 12
- **AND** plain text password is never stored

### Requirement: Session management
The system SHALL manage user sessions across multiple devices.

#### Scenario: Multiple sessions
- **WHEN** user logs in from different devices
- **THEN** each device gets separate session
- **AND** sessions are independent

#### Scenario: Session listing
- **WHEN** user views account settings
- **THEN** system displays active sessions
- **AND** shows device type and location

#### Scenario: Session termination
- **WHEN** user chooses to sign out a specific session
- **THEN** that session is terminated
- **AND** other sessions remain active

#### Scenario: Sign out all devices
- **WHEN** user chooses to sign out all devices
- **THEN** all sessions are terminated
- **AND** user must log in again everywhere

### Requirement: Profile management
The system SHALL allow users to manage their profile information.

#### Scenario: Display name change
- **WHEN** user updates display name
- **THEN** system validates name (3-20 characters)
- **AND** updates profile
- **AND** changes are visible immediately

#### Scenario: Avatar upload
- **WHEN** user uploads avatar image
- **THEN** system validates image format (PNG, JPG)
- **AND** validates size (< 2MB)
- **AND** resizes to standard dimensions
- **AND** stores in cloud storage

#### Scenario: Profile visibility
- **WHEN** user sets profile to private
- **THEN** only friends can see game history
- **AND** username is still visible in games

### Requirement: Account deletion
The system SHALL allow users to delete their accounts.

#### Scenario: Deletion request
- **WHEN** user requests account deletion
- **THEN** system asks for confirmation
- **AND** requires password verification

#### Scenario: Data anonymization
- **WHEN** account is deleted
- **THEN** personal data is removed
- **AND** game history is anonymized
- **AND** username shows as "[Deleted User]"

#### Scenario: Grace period
- **WHEN** user initiates deletion
- **THEN** account enters 7-day grace period
- **AND** user can cancel deletion
- **AND** after 7 days deletion is permanent

### Requirement: OAuth integration
The system MAY support OAuth providers for authentication.

#### Scenario: Google OAuth
- **WHEN** user clicks "Sign in with Google"
- **THEN** system redirects to Google OAuth
- **AND** receives user info from Google
- **AND** creates or links account

#### Scenario: OAuth account linking
- **WHEN** existing user uses OAuth with same email
- **THEN** accounts are automatically linked
- **AND** user can login with either method
