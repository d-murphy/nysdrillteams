# AWS Cognito Authentication Middleware Usage

## Environment Variables Required

Add these to your `.env` file:

```bash
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id-here
```

## Basic Usage

### 1. Import the middleware

```typescript
import { awsCognitoAuthMiddleware, requireRole, requireGroup, requireEmailVerification } from './awsCognitoMdw';
```

### 2. Apply to routes

```typescript
// Basic authentication
router.post('/createGame', awsCognitoAuthMiddleware, async (req: Request, res: Response) => {
    // req.user is now available with user information
    const username = req.user?.username;
    const email = req.user?.email;
    const userId = req.user?.sub;
    
    // Your route logic here
});

// Role-based access
router.delete('/admin/deleteGame/:gameId', 
    awsCognitoAuthMiddleware, 
    requireRole('admin'), 
    async (req: Request, res: Response) => {
        // Only users with 'admin' role can access this
    }
);

// Group-based access
router.get('/premium/stats', 
    awsCognitoAuthMiddleware, 
    requireGroup('premium-users'), 
    async (req: Request, res: Response) => {
        // Only users in 'premium-users' group can access this
    }
);

// Email verification required
router.post('/sensitive-action', 
    awsCognitoAuthMiddleware, 
    requireEmailVerification, 
    async (req: Request, res: Response) => {
        // Only users with verified emails can access this
    }
);
```

## Client-Side Usage

### JavaScript/TypeScript

```javascript
// After user logs in with Cognito, get tokens
const accessToken = cognitoUser.getSignInUserSession().getAccessToken().getJwtToken();
const idToken = cognitoUser.getSignInUserSession().getIdToken().getJwtToken();

// Make authenticated requests
fetch('/fantasy/createGame', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Id-Token': idToken,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        gameType: '8-team',
        countAgainstRecord: true,
        isSeason: false
    })
});
```

### React Hook Example

```javascript
import { useAuth } from './auth-context'; // Your auth context

function useAuthenticatedFetch() {
    const { getTokens } = useAuth();
    
    return async (url, options = {}) => {
        const { accessToken, idToken } = await getTokens();
        
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
                'X-Id-Token': idToken,
            }
        });
    };
}

// Usage in component
function CreateGameButton() {
    const authenticatedFetch = useAuthenticatedFetch();
    
    const createGame = async () => {
        const response = await authenticatedFetch('/fantasy/createGame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameType: '8-team',
                countAgainstRecord: true,
                isSeason: false
            })
        });
        
        if (response.ok) {
            const game = await response.json();
            console.log('Game created:', game);
        }
    };
    
    return <button onClick={createGame}>Create Game</button>;
}
```

## Available User Information

After authentication, `req.user` contains:

```typescript
{
    sub: string;                    // Unique user ID
    email?: string;                 // User's email
    username: string;               // Cognito username
    email_verified?: boolean;       // Email verification status
    'cognito:groups'?: string[];    // User groups
    'custom:role'?: string;         // Custom role attribute
    // ... other Cognito attributes
}
```

## Error Responses

The middleware returns these error responses:

### 401 Unauthorized
```json
{
    "error": "Unauthorized",
    "message": "Access token required in Authorization header"
}
```

### 403 Forbidden
```json
{
    "error": "Forbidden", 
    "message": "Required role: admin"
}
```

## Security Features

1. **Token Validation**: Verifies both access and ID tokens
2. **Expiration Check**: Ensures tokens haven't expired
3. **User Matching**: Confirms both tokens belong to same user
4. **Role/Group Authorization**: Supports role and group-based access control
5. **Email Verification**: Can require verified email addresses

## Alternative Header Names

If you prefer different header names, you can modify the middleware:

```typescript
// Instead of X-Id-Token, use Authorization-Id
const idToken = req.headers['authorization-id'] as string;
```

Or use a single header with both tokens:

```typescript
// Custom format: "Bearer accessToken|idToken"
const authHeader = req.headers.authorization;
const [accessToken, idToken] = authHeader.substring(7).split('|');
```
