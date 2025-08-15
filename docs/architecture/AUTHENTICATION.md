# Authentication Architecture Documentation

## Overview
DINO uses Supabase Auth for comprehensive authentication and authorization, providing secure user management, session handling, and multi-factor authentication capabilities. The system integrates seamlessly with Row Level Security (RLS) for data isolation and protection.

## Technology Stack

### Supabase Auth
```typescript
// Core Features
- Email/Password authentication
- Magic link authentication
- OAuth providers (Google, GitHub)
- Multi-factor authentication (MFA)
- Session management
- JWT tokens
- Row Level Security integration
- Password recovery
- Email verification
```

### Security Architecture
1. **Zero-Trust Model**: Every request verified
2. **JWT Tokens**: Secure, stateless authentication
3. **RLS Integration**: Database-level security
4. **HTTPS Only**: Encrypted communication
5. **CSRF Protection**: Token-based verification

## Authentication Flow

### 1. Sign Up Flow

#### Email/Password Registration
```typescript
interface SignUpFlow {
  // 1. User submits registration form
  email: string
  password: string
  
  // 2. Client-side validation
  validateEmail(email: string): boolean
  validatePassword(password: string): boolean
  
  // 3. Supabase Auth call
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        signup_source: 'web'
      }
    }
  })
  
  // 4. Email verification sent
  // 5. Profile creation trigger
  // 6. Session establishment
}
```

#### Visual Flow
```
User Input → Validation → Supabase Auth → Email Verification
     ↓                                            ↓
Profile Creation ← Database Trigger ← Confirmation Click
     ↓
Session Start → Dashboard Access
```

#### Implementation
```typescript
export async function signUp(
  email: string, 
  password: string
): Promise<AuthResponse> {
  // Input validation
  if (!validateEmail(email)) {
    throw new AuthError('Invalid email format')
  }
  
  if (!validatePassword(password)) {
    throw new AuthError('Password requirements not met')
  }
  
  try {
    // Create user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          created_at: new Date().toISOString()
        }
      }
    })
    
    if (error) throw error
    
    // Handle different scenarios
    if (data.user && !data.session) {
      // Email confirmation required
      return {
        success: true,
        requiresEmailConfirmation: true,
        message: 'Please check your email to confirm your account'
      }
    }
    
    if (data.session) {
      // Auto-signed in (email confirmation disabled)
      await initializeUserData(data.user)
      return {
        success: true,
        user: data.user,
        session: data.session
      }
    }
    
  } catch (error) {
    handleAuthError(error)
    throw error
  }
}
```

### 2. Sign In Flow

#### Email/Password Login
```typescript
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      if (error.message.includes('Invalid login')) {
        throw new AuthError('Invalid email or password')
      }
      throw error
    }
    
    // Update last login
    await updateLastLogin(data.user.id)
    
    // Load user data
    await loadUserProfile(data.user.id)
    await loadUserStays(data.user.id)
    
    return {
      success: true,
      user: data.user,
      session: data.session
    }
    
  } catch (error) {
    trackFailedLogin(email)
    throw error
  }
}
```

#### Magic Link Authentication
```typescript
export async function signInWithMagicLink(
  email: string
): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      shouldCreateUser: false
    }
  })
  
  if (error) {
    if (error.message.includes('not exist')) {
      throw new AuthError('No account found with this email')
    }
    throw error
  }
}
```

#### OAuth Provider Login
```typescript
export async function signInWithProvider(
  provider: 'google' | 'github'
): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: provider === 'github' ? 'read:user' : 'email profile'
    }
  })
  
  if (error) throw error
}
```

### 3. Session Management

#### Session Structure
```typescript
interface Session {
  access_token: string      // JWT for API calls
  refresh_token: string     // Token for refreshing session
  expires_in: number        // Seconds until expiration
  expires_at?: number       // Unix timestamp
  token_type: string        // "bearer"
  user: User               // User object
}

interface User {
  id: string               // UUID
  email: string
  email_confirmed_at?: string
  phone?: string
  confirmed_at?: string
  last_sign_in_at?: string
  app_metadata: {
    provider?: string
    providers?: string[]
  }
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
  created_at: string
  updated_at: string
}
```

#### Session Lifecycle
```typescript
class SessionManager {
  private refreshTimer?: NodeJS.Timeout
  
  async initializeSession() {
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      this.setupRefreshTimer(session)
      await this.validateSession(session)
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.handleAuthChange(event, session)
    })
  }
  
  private setupRefreshTimer(session: Session) {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
    
    // Calculate refresh time (5 minutes before expiry)
    const expiresAt = session.expires_at || 
      Math.floor(Date.now() / 1000) + session.expires_in
    const refreshAt = (expiresAt - 300) * 1000
    const timeout = refreshAt - Date.now()
    
    if (timeout > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshSession()
      }, timeout)
    }
  }
  
  private async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      // Session expired, redirect to login
      await this.handleSessionExpired()
    } else if (data.session) {
      this.setupRefreshTimer(data.session)
    }
  }
  
  private async validateSession(session: Session) {
    try {
      // Verify token is valid
      const { data, error } = await supabase.auth.getUser()
      
      if (error || !data.user) {
        throw new Error('Invalid session')
      }
      
      // Check if user is active
      const profile = await this.getUserProfile(data.user.id)
      if (profile.suspended) {
        throw new Error('Account suspended')
      }
      
    } catch (error) {
      await this.handleInvalidSession()
    }
  }
  
  private handleAuthChange(
    event: AuthChangeEvent,
    session: Session | null
  ) {
    switch (event) {
      case 'SIGNED_IN':
        this.handleSignIn(session!)
        break
      case 'SIGNED_OUT':
        this.handleSignOut()
        break
      case 'TOKEN_REFRESHED':
        this.setupRefreshTimer(session!)
        break
      case 'USER_UPDATED':
        this.handleUserUpdate(session!)
        break
    }
  }
}
```

### 4. Password Management

#### Password Reset Flow
```typescript
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })
  
  if (error) {
    // Don't reveal if email exists
    console.error('Password reset error:', error)
  }
  
  // Always show success message
  return {
    message: 'If an account exists, a password reset link has been sent'
  }
}
```

#### Password Update
```typescript
export async function updatePassword(
  newPassword: string
): Promise<void> {
  // Validate password strength
  const strength = calculatePasswordStrength(newPassword)
  if (strength < 0.6) {
    throw new Error('Password is too weak')
  }
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  if (error) throw error
  
  // Log password change
  await logSecurityEvent('password_changed', {
    timestamp: new Date().toISOString()
  })
}
```

#### Password Validation
```typescript
interface PasswordRequirements {
  minLength: 8
  requireUppercase: true
  requireLowercase: true
  requireNumbers: true
  requireSpecialChars: false
  preventCommonPasswords: true
}

function validatePassword(password: string): ValidationResult {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers')
  }
  
  if (isCommonPassword(password)) {
    errors.push('Password is too common')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  }
}

function calculatePasswordStrength(password: string): number {
  let strength = 0
  
  // Length score
  strength += Math.min(password.length / 20, 0.3)
  
  // Complexity score
  if (/[a-z]/.test(password)) strength += 0.1
  if (/[A-Z]/.test(password)) strength += 0.1
  if (/[0-9]/.test(password)) strength += 0.1
  if (/[^a-zA-Z0-9]/.test(password)) strength += 0.2
  
  // Variety score
  const uniqueChars = new Set(password).size
  strength += Math.min(uniqueChars / password.length, 0.2)
  
  // Entropy estimate
  const entropy = calculateEntropy(password)
  strength += Math.min(entropy / 100, 0.2)
  
  return Math.min(strength, 1)
}
```

## Authorization

### Role-Based Access Control (RBAC)

#### User Roles
```typescript
enum UserRole {
  FREE = 'free',        // Basic features
  PREMIUM = 'premium',  // Advanced features
  ADMIN = 'admin'      // Administrative access
}

interface UserPermissions {
  maxStays: number
  exportEnabled: boolean
  apiAccess: boolean
  customReports: boolean
  teamFeatures: boolean
}

const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  [UserRole.FREE]: {
    maxStays: 100,
    exportEnabled: false,
    apiAccess: false,
    customReports: false,
    teamFeatures: false
  },
  [UserRole.PREMIUM]: {
    maxStays: -1, // Unlimited
    exportEnabled: true,
    apiAccess: true,
    customReports: true,
    teamFeatures: true
  },
  [UserRole.ADMIN]: {
    maxStays: -1,
    exportEnabled: true,
    apiAccess: true,
    customReports: true,
    teamFeatures: true
  }
}
```

#### Permission Checking
```typescript
export function hasPermission(
  user: User,
  permission: keyof UserPermissions
): boolean {
  const role = user.app_metadata?.role || UserRole.FREE
  const permissions = ROLE_PERMISSIONS[role]
  
  return permissions[permission] === true || 
         permissions[permission] === -1
}

export function enforcePermission(
  user: User,
  permission: keyof UserPermissions
) {
  if (!hasPermission(user, permission)) {
    throw new AuthorizationError(
      `Permission denied: ${permission} requires ${UserRole.PREMIUM} role`
    )
  }
}
```

### Row Level Security (RLS)

#### Database Policies
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Stay policies
CREATE POLICY "Users can view own stays"
  ON stays FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stays"
  ON stays FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stays"
  ON stays FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stays"
  ON stays FOR DELETE
  USING (auth.uid() = user_id);
```

#### RLS Helper Functions
```sql
-- Function to check if user owns resource
CREATE OR REPLACE FUNCTION auth.user_owns_resource(
  resource_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = resource_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user role
CREATE OR REPLACE FUNCTION auth.has_role(
  required_role TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role')::TEXT 
  INTO user_role;
  
  RETURN user_role = required_role OR user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Security Features

### 1. Multi-Factor Authentication (MFA)

#### MFA Setup
```typescript
export async function setupMFA(): Promise<MFASetupResponse> {
  // Generate TOTP secret
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp'
  })
  
  if (error) throw error
  
  return {
    id: data.id,
    secret: data.totp.secret,
    qrCode: data.totp.qr_code,
    uri: data.totp.uri
  }
}

export async function verifyMFASetup(
  factorId: string,
  code: string
): Promise<void> {
  const { error } = await supabase.auth.mfa.challenge({
    factorId
  })
  
  if (error) throw error
  
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    code
  })
  
  if (verifyError) throw verifyError
}
```

#### MFA Login Flow
```typescript
export async function signInWithMFA(
  email: string,
  password: string,
  mfaCode?: string
): Promise<AuthResponse> {
  // First step: Email/password
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    if (error.message.includes('MFA')) {
      // MFA required
      return {
        requiresMFA: true,
        challengeId: error.challengeId
      }
    }
    throw error
  }
  
  // If MFA code provided, verify it
  if (mfaCode && data.challengeId) {
    const { data: mfaData, error: mfaError } = 
      await supabase.auth.mfa.verify({
        challengeId: data.challengeId,
        code: mfaCode
      })
    
    if (mfaError) throw mfaError
    
    return {
      success: true,
      session: mfaData.session
    }
  }
  
  return {
    success: true,
    session: data.session
  }
}
```

### 2. Rate Limiting

#### Implementation
```typescript
class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private readonly maxAttempts = 5
  private readonly windowMs = 15 * 60 * 1000 // 15 minutes
  
  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const userAttempts = this.attempts.get(identifier) || []
    
    // Clean old attempts
    const recentAttempts = userAttempts.filter(
      time => now - time < this.windowMs
    )
    
    this.attempts.set(identifier, recentAttempts)
    
    return recentAttempts.length >= this.maxAttempts
  }
  
  recordAttempt(identifier: string): void {
    const attempts = this.attempts.get(identifier) || []
    attempts.push(Date.now())
    this.attempts.set(identifier, attempts)
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

const loginRateLimiter = new RateLimiter()

export async function rateLimitedSignIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  const identifier = email.toLowerCase()
  
  if (loginRateLimiter.isRateLimited(identifier)) {
    throw new AuthError('Too many login attempts. Please try again later.')
  }
  
  try {
    const result = await signIn(email, password)
    loginRateLimiter.reset(identifier)
    return result
  } catch (error) {
    loginRateLimiter.recordAttempt(identifier)
    throw error
  }
}
```

### 3. Session Security

#### Secure Cookie Configuration
```typescript
const COOKIE_OPTIONS = {
  name: 'sb-auth-token',
  lifetime: 60 * 60 * 8, // 8 hours
  domain: process.env.COOKIE_DOMAIN,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true
}
```

#### CSRF Protection
```typescript
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function validateCSRFToken(token: string): boolean {
  const sessionToken = getSessionCSRFToken()
  return token === sessionToken && token.length === 64
}

// Middleware
export async function csrfMiddleware(
  req: Request,
  next: () => Promise<Response>
): Promise<Response> {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const token = req.headers.get('X-CSRF-Token')
    
    if (!token || !validateCSRFToken(token)) {
      return new Response('Invalid CSRF token', { status: 403 })
    }
  }
  
  return next()
}
```

### 4. Audit Logging

#### Security Events
```typescript
interface SecurityEvent {
  id: string
  user_id: string
  event_type: SecurityEventType
  ip_address: string
  user_agent: string
  metadata: Record<string, any>
  created_at: string
}

enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}
```

#### Event Logging
```typescript
export async function logSecurityEvent(
  type: SecurityEventType,
  metadata?: Record<string, any>
): Promise<void> {
  const user = await supabase.auth.getUser()
  
  await supabase.from('security_events').insert({
    user_id: user.data.user?.id,
    event_type: type,
    ip_address: getClientIP(),
    user_agent: navigator.userAgent,
    metadata,
    created_at: new Date().toISOString()
  })
}
```

## Client-Side Implementation

### Auth Provider Component
```typescript
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Handle specific events
        switch (event) {
          case 'SIGNED_IN':
            await handleSignIn(session!)
            break
          case 'SIGNED_OUT':
            await handleSignOut()
            break
          case 'USER_UPDATED':
            await handleUserUpdate(session!)
            break
        }
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Protected Routes
```typescript
export const ProtectedRoute: React.FC<{ 
  children: ReactNode,
  requiredRole?: UserRole 
}> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    
    if (user && requiredRole) {
      const userRole = user.app_metadata?.role
      if (!hasRole(userRole, requiredRole)) {
        router.push('/unauthorized')
      }
    }
  }, [user, loading, requiredRole])
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (!user) {
    return null
  }
  
  return <>{children}</>
}
```

### Auth Hooks
```typescript
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function useUser() {
  const { user } = useAuth()
  return user
}

export function useSession() {
  const { session } = useAuth()
  return session
}

export function useRequireAuth(redirectTo = '/login') {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, redirectTo])
  
  return { user, loading }
}
```

## Testing Strategy

### Unit Tests
```typescript
describe('Authentication', () => {
  describe('Sign Up', () => {
    it('should create new user with valid credentials')
    it('should reject weak passwords')
    it('should handle duplicate emails')
    it('should trigger profile creation')
  })
  
  describe('Sign In', () => {
    it('should authenticate with valid credentials')
    it('should reject invalid credentials')
    it('should handle MFA flow')
    it('should respect rate limiting')
  })
  
  describe('Session Management', () => {
    it('should refresh tokens before expiry')
    it('should handle session expiration')
    it('should validate session integrity')
  })
  
  describe('Password Management', () => {
    it('should send reset emails')
    it('should update passwords')
    it('should enforce password requirements')
  })
})
```

### Integration Tests
```typescript
describe('Auth Integration', () => {
  it('should complete full signup flow')
  it('should handle OAuth authentication')
  it('should enforce RLS policies')
  it('should log security events')
  it('should handle concurrent sessions')
})
```

## Security Best Practices

### 1. Input Validation
- Sanitize all user inputs
- Validate email formats
- Enforce password complexity
- Prevent SQL injection

### 2. Token Management
- Use secure, httpOnly cookies
- Implement token rotation
- Set appropriate expiration times
- Clear tokens on logout

### 3. Error Handling
- Don't reveal user existence
- Use generic error messages
- Log security events
- Implement account lockout

### 4. Network Security
- Enforce HTTPS everywhere
- Implement CSRF protection
- Use secure headers
- Enable CORS properly

## Monitoring and Analytics

### Key Metrics
```typescript
interface AuthMetrics {
  dailyActiveUsers: number
  signupConversionRate: number
  loginSuccessRate: number
  averageSessionDuration: number
  passwordResetRequests: number
  mfaAdoptionRate: number
  suspiciousLoginAttempts: number
}
```

### Alert Thresholds
- Failed login attempts > 10/minute
- Password reset requests > 5/minute
- New signups > 100/hour
- Session duration < 1 minute (potential issues)

## Troubleshooting

### Common Issues

#### "Invalid login credentials"
- Verify email and password
- Check if account is confirmed
- Ensure account isn't locked

#### "Session expired"
- Token refresh failed
- Network connectivity issues
- Browser cookie problems

#### "MFA code invalid"
- Time sync issues
- Expired codes
- Incorrect secret key

## Future Enhancements

### Planned Features
1. **Biometric Authentication**: FaceID/TouchID support
2. **SSO Integration**: SAML/OpenID Connect
3. **Passwordless Login**: WebAuthn support
4. **Account Recovery**: Security questions
5. **Session Management**: Device tracking

### Advanced Features
1. **Risk-Based Authentication**: Adaptive MFA
2. **Behavioral Analytics**: Anomaly detection
3. **Zero-Knowledge Proofs**: Enhanced privacy
4. **Delegated Access**: OAuth provider
5. **Compliance Features**: GDPR/CCPA tools

## Related Documentation
- [Database Architecture](./DATABASE.md)
- [State Management](./STATE-MANAGEMENT.md)
- [API Documentation](../api/SUPABASE-API.md)
- [Security Guidelines](../security/SECURITY.md)