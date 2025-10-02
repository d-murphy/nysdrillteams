import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Check if Cognito environment variables are configured
const isCognitoConfigured = () => {
    return !!(process.env.COGNITO_USER_POOL_ID && process.env.COGNITO_CLIENT_ID);
};

// Configure the JWT verifiers only if environment variables are present
let verifier: any = null;
let idTokenVerifier: any = null;

if (isCognitoConfigured()) {
    try {
        verifier = CognitoJwtVerifier.create({
            userPoolId: process.env.COGNITO_USER_POOL_ID!,
            tokenUse: 'access',
            clientId: process.env.COGNITO_CLIENT_ID!,
        });

        idTokenVerifier = CognitoJwtVerifier.create({
            userPoolId: process.env.COGNITO_USER_POOL_ID!,
            tokenUse: 'id',
            clientId: process.env.COGNITO_CLIENT_ID!,
        });
    } catch (error) {
        console.error('Failed to initialize Cognito JWT verifiers:', error);
    }
}

// Extend Express Request type to include user information
declare global {
    namespace Express {
        interface Request {
            user?: {
                sub: string;
                email?: string;
                username: string;
                email_verified?: boolean;
                'cognito:groups'?: string[];
                'custom:role'?: string;
                [key: string]: any;
            };
            accessToken?: string;
            idToken?: string;
        }
    }
}

export function awsCognitoAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    // Check if Cognito is configured
    if (!isCognitoConfigured()) {        
        return res.status(503).json({ 
            error: 'Service Unavailable', 
            message: 'Authentication service is not configured' 
        });
    }

    if (!verifier || !idTokenVerifier) {
        return res.status(503).json({ 
            error: 'Service Unavailable', 
            message: 'Authentication service is not available' 
        });
    }

    // Extract tokens from headers
    const authHeader = req.headers.authorization;
    const idToken = req.headers['x-id-token'] as string;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Access token required in Authorization header' 
        });
    }
    
    if (!idToken) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'ID token required in X-Id-Token header' 
        });
    }
    
    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify both tokens
    Promise.all([
        verifier.verify(accessToken),
        idTokenVerifier.verify(idToken)
    ])
    .then(([accessTokenPayload, idTokenPayload]) => {
        // Check if tokens belong to the same user
        if (accessTokenPayload.sub !== idTokenPayload.sub) {
            return res.status(401).json({ 
                error: 'Unauthorized', 
                message: 'Access token and ID token do not match' 
            });
        }
        
        // Check token expiration
        const now = Math.floor(Date.now() / 1000);
        if (accessTokenPayload.exp < now || idTokenPayload.exp < now) {
            return res.status(401).json({ 
                error: 'Unauthorized', 
                message: 'Token has expired' 
            });
        }
        
        // Attach user information to request
        req.user = {
            sub: idTokenPayload.sub as string,
            email: idTokenPayload.email as string | undefined,
            username: (idTokenPayload['cognito:username'] || idTokenPayload.username) as string,
            email_verified: idTokenPayload.email_verified as boolean | undefined,
            'cognito:groups': idTokenPayload['cognito:groups'] as string[] | undefined,
            'custom:role': idTokenPayload['custom:role'] as string | undefined
        };

        console.log("req.user: ", req.user);
        req.accessToken = accessToken;
        req.idToken = idToken;
        
        next();
    })
    .catch((error) => {
        console.error('Token verification failed:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Unauthorized', 
                message: 'Token has expired' 
            });
        }
        
        if (error.name === 'NotAuthorizedError') {
            return res.status(401).json({ 
                error: 'Unauthorized', 
                message: 'Invalid token' 
            });
        }
        
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Token verification failed' 
        });
    });
}

// Optional: Middleware for role-based access control
export function requireRole(requiredRole: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Unauthorized', 
                message: 'User not authenticated' 
            });
        }
        
        const userRole = req.user['custom:role'];
        const userGroups = req.user['cognito:groups'] || [];
        
        if (userRole !== requiredRole && !userGroups.includes(requiredRole)) {
            return res.status(403).json({ 
                error: 'Forbidden', 
                message: `Required role: ${requiredRole}` 
            });
        }
        
        next();
    };
}

// Optional: Middleware for group-based access control
export function requireGroup(requiredGroup: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Unauthorized', 
                message: 'User not authenticated' 
            });
        }
        
        const userGroups = req.user['cognito:groups'] || [];
        
        if (!userGroups.includes(requiredGroup)) {
            return res.status(403).json({ 
                error: 'Forbidden', 
                message: `Required group: ${requiredGroup}` 
            });
        }
        
        next();
    };
}

// Optional: Middleware to require email verification
export function requireEmailVerification(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'User not authenticated' 
        });
    }
    
    if (!req.user.email_verified) {
        return res.status(403).json({ 
            error: 'Forbidden', 
            message: 'Email verification required' 
        });
    }
    
    next();
}

// Helper function to check if Cognito authentication is available
export function isCognitoAuthAvailable(): boolean {
    return isCognitoConfigured() && verifier !== null && idTokenVerifier !== null;
}
