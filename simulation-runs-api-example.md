# Simulation Runs API

## Endpoint

`POST /simulationRuns/getSimulationRuns`

## Description

Retrieves simulation runs from the database based on an array of keys. Maximum 400 keys per request.

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "keys": [
    "team1|2024|Contest1|0",
    "team2|2024|Contest2|1",
    "team3|2024|Contest3|2"
  ]
}
```

### Validation Rules
- `keys` must be an array
- `keys` cannot be empty
- Maximum 400 keys per request

## Response

### Success (200 OK)
```json
[
  {
    "key": "team1|2024|Contest1|0",
    "finalRun": 12.5
  },
  {
    "key": "team2|2024|Contest2|1",
    "finalRun": 15.3
  },
  {
    "key": "team3|2024|Contest3|2",
    "finalRun": 14.1
  }
]
```

### Error Responses

#### 400 Bad Request - Missing keys
```json
{
  "error": "Bad Request",
  "message": "keys must be an array"
}
```

#### 400 Bad Request - Empty array
```json
{
  "error": "Bad Request",
  "message": "keys array cannot be empty"
}
```

#### 400 Bad Request - Too many keys
```json
{
  "error": "Bad Request",
  "message": "Cannot request more than 400 keys. Received: 450"
}
```

#### 500 Internal Server Error
```json
"Internal server error."
```

## Usage Examples

### JavaScript/Fetch
```javascript
const keys = [
  'team1|2024|Contest1|0',
  'team2|2024|Contest2|1',
  'team3|2024|Contest3|2'
];

fetch('/simulationRuns/getSimulationRuns', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ keys })
})
.then(response => response.json())
.then(runs => {
  console.log('Simulation runs:', runs);
})
.catch(error => {
  console.error('Error:', error);
});
```

### React Hook
```javascript
import { useState } from 'react';

function useSimulationRuns() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSimulationRuns = async (keys) => {
    if (keys.length > 400) {
      setError('Cannot request more than 400 keys');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/simulationRuns/getSimulationRuns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch simulation runs');
      }

      const runs = await response.json();
      setLoading(false);
      return runs;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return { getSimulationRuns, loading, error };
}
```

### Axios
```javascript
import axios from 'axios';

async function getSimulationRuns(keys) {
  try {
    const response = await axios.post('/simulationRuns/getSimulationRuns', {
      keys
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    }
    throw error;
  }
}
```

## Performance Considerations

- **Batch Requests**: The 400-key limit helps prevent overwhelming the database
- **Indexing**: Ensure the `key` field is indexed in MongoDB for optimal query performance
- **Network**: Larger key arrays will result in larger request/response payloads

## Database Collection

- **Collection Name**: `simulation-runs`
- **Key Format**: `{team}|{year}|{contest}|{iteration}`
- **Example Key**: `"Fire Department|2024|Three Man Ladder|42"`
