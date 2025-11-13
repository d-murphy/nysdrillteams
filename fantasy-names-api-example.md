# Fantasy Names API

## Endpoints

### 1. Get Fantasy Team Names
`POST /fantasyNames/getFantasyTeamNames`

Get fantasy team names for multiple emails.

**Request:**
```json
{
  "emails": ["user1@example.com", "user2@example.com"]
}
```

**Response:**
```json
[
  {
    "email": "user1@example.com",
    "town": "New York",
    "name": "Fire Dragons"
  },
  {
    "email": "user2@example.com", 
    "town": "Boston",
    "name": "Rescue Squad"
  }
]
```

### 2. Check Team Name Availability
`GET /fantasyNames/isFantasyTeamNameAvailable?town=New York&name=Fire Dragons`

Check if a specific town/name combination is available.

**Response:**
```json
{
  "available": true
}
```

### 3. Create/Update Team Name
`POST /fantasyNames/upsertFantasyTeamName`

Create or update a fantasy team name.

**Request:**
```json
{
  "email": "user@example.com",
  "town": "New York", 
  "name": "Fire Dragons"
}
```

**Response:**
```json
{
  "acknowledged": true,
  "modifiedCount": 1,
  "upsertedId": "...",
  "upsertedCount": 1,
  "matchedCount": 1
}
```

### 4. Get Town Suggestions
`GET /fantasyNames/getFantasyTeamTowns?search=New&limit=10&offset=0`

Get town suggestions based on search string.

**Response:**
```json
[
  "New York",
  "New Jersey", 
  "New Hampshire"
]
```

### 5. Get Team Name Suggestions
`GET /fantasyNames/getTeamNameSuggestions?town=New York&limit=10&offset=0`

Get team name suggestions for a specific town.

**Response:**
```json
[
  "Fire Dragons",
  "Rescue Squad",
  "Brave Hearts"
]
```

## Usage Examples

### JavaScript/Fetch
```javascript
// Get team names for multiple users
const getTeamNames = async (emails) => {
  const response = await fetch('/fantasyNames/getFantasyTeamNames', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails })
  });
  return response.json();
};

// Check if team name is available
const checkAvailability = async (town, name) => {
  const response = await fetch(`/fantasyNames/isFantasyTeamNameAvailable?town=${encodeURIComponent(town)}&name=${encodeURIComponent(name)}`);
  const result = await response.json();
  return result.available;
};

// Create/update team name
const upsertTeamName = async (email, town, name) => {
  const response = await fetch('/fantasyNames/upsertFantasyTeamName', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, town, name })
  });
  return response.json();
};

// Get town suggestions
const getTownSuggestions = async (search, limit = 10) => {
  const response = await fetch(`/fantasyNames/getFantasyTeamTowns?search=${encodeURIComponent(search)}&limit=${limit}`);
  return response.json();
};

// Get team name suggestions
const getTeamNameSuggestions = async (town, limit = 10) => {
  const response = await fetch(`/fantasyNames/getTeamNameSuggestions?town=${encodeURIComponent(town)}&limit=${limit}`);
  return response.json();
};
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

function useFantasyNames() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkNameAvailability = async (town, name) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/fantasyNames/isFantasyTeamNameAvailable?town=${encodeURIComponent(town)}&name=${encodeURIComponent(name)}`);
      const result = await response.json();
      return result.available;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveTeamName = async (email, town, name) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/fantasyNames/upsertFantasyTeamName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, town, name })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save team name');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { checkNameAvailability, saveTeamName, loading, error };
}
```

## Database Collections

### `simulation-fantasy-name-suggestions`
Contains name suggestions for towns and teams:
```json
{
  "name": "New York",
  "type": "town"
}
```

### `simulation-fantasy-players`
Contains user's fantasy team names:
```json
{
  "email": "user@example.com",
  "town": "New York", 
  "name": "Fire Dragons"
}
```

## Validation Rules

- **Email**: Required for team name operations
- **Town**: Required, used for suggestions and availability checking
- **Name**: Required, must be unique per town
- **Limit**: Between 1-100 (default: 10)
- **Offset**: Minimum 0 (default: 0)
