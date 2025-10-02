# AWS Cognito Setup Guide

## Quick Fix for Development

If you want to run the application without setting up Cognito immediately, the middleware now includes development mode support.

### Option 1: Development Mode (No Cognito Setup Required)

Set your environment to development mode:

```bash
# In your .env file or environment
NODE_ENV=development
```

This will allow the application to start without Cognito configuration and use a mock user for testing.

### Option 2: Full Cognito Setup

If you want to use real Cognito authentication, add these environment variables:

```bash
# Required for Cognito authentication
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id-here

# Optional: Set environment
NODE_ENV=production
```

## Getting Cognito Credentials

### 1. Create User Pool in AWS Console

1. Go to AWS Cognito in the AWS Console
2. Click "Create user pool"
3. Configure your user pool settings
4. Note down the **User Pool ID** (format: `us-east-1_XXXXXXXXX`)

### 2. Create App Client

1. In your user pool, go to "App integration" tab
2. Click "Create app client"
3. Configure the app client
4. Note down the **Client ID**

### 3. Configure App Client Settings

1. In "App integration" → "App client settings"
2. Enable the identity providers you want to use
3. Set callback URLs for your application
4. Configure OAuth flows if needed

## Environment Variables Reference

```bash
# Required for Cognito
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id-here

# Optional
NODE_ENV=development  # Enables development mode with mock user
```

## Testing Authentication

### Development Mode
- No tokens required
- Uses mock user: `devuser`
- All routes work without authentication

### Production Mode
- Requires valid Cognito tokens
- Real user authentication
- Full security validation

## Troubleshooting

### Error: "Cannot read properties of undefined (reading 'match')"
- **Cause**: Missing `COGNITO_USER_POOL_ID` environment variable
- **Fix**: Set `NODE_ENV=development` or add the required environment variables

### Error: "Authentication service is not configured"
- **Cause**: Cognito environment variables are missing
- **Fix**: Either set up Cognito credentials or use development mode

### Error: "Token verification failed"
- **Cause**: Invalid or expired tokens
- **Fix**: Ensure you're sending valid Cognito tokens in the request headers
