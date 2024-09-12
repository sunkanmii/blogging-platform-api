## Public API Endpoints

The following endpoints are accessible without authentication:

### `GET /api/posts` - Get a list of all posts

**Query Params** (all are optional):
- `limit`: Number of posts to get (example: 4, default is 8).
- `cursor`: Cursor to the next set of posts (example: `66d0f68369a2dcd4d9444554`).
- `sort`: Sorting the result, three options: `newest`, `oldest`, `top` (default is `newest`).
- `search`: Search for words in the title or description of the post.
- `tags`: Filter posts by tags. Provide a comma-separated list (example: `tags=WOODEN,panel,liking`).

**Response Example**:
```json
{
    "cursor": "66d0f72469a2dcd4d9444556",
    "posts": [
        {
            "_id": "66d1d3c74bad05be1b18a65e",
            "title": "Understanding JavaScript Closures",
            "description": "An in-depth guide to understanding closures in JavaScript.",
            "author": {
                "_id": "66e038559b9bb0ffc46836fc",
                "fullName": "Abdallah Radfi",
                "profileImage": null
            },
            "tags": [
                "javaScript",
                "closures",
                "programming"
            ]
        },
        {
            "_id": "66d0f72469a2dcd4d9444556",
            "title": "Licensed reboot Lead",
            "description": "We need to parse the 1080p SAS alarm!",
            "author": {
                "_id": "66e038559b9bb0ffc46836fc",
                "fullName": "Abdallah Radfi",
                "profileImage": null
            },
            "tags": [
                "wooden",
                "teal"
            ]
        }
    ]
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid query param value
- `500`: Server error

---

### `GET /api/posts/:postId` - Get a single post by ID

**Path Variables**:
- `:postId`: The post ID to retrieve

**Response Example**:
```json
{
    "_id": "66d1d3c74bad05be1b18a65e",
    "title": "Understanding JavaScript Closures",
    "description": "An in-depth guide to understanding closures in JavaScript.",
    "content": [
        {
            "type": "header",
            "value": "Introduction to Closures"
        },
        {
            "type": "text",
            "value": "Closures are a fundamental concept in JavaScript that every developer should understand..."
        },
        {
            "type": "code",
            "value": "function outerFunction() { ... }",
            "language": "javascript"
        },
        {
            "type": "text",
            "value": "In this example, `innerFunction` forms a closure that gives it access to `outerVariable`..."
        },
        {
            "type": "image",
            "value": "https://example.com/js-closures-diagram.png"
        }
    ],
    "author": {
        "_id": "66e038559b9bb0ffc46836fc",
        "fullName": "Abdallah Radfi",
        "profileImage": null
    },
    "tags": [
        "javaScript",
        "closures",
        "programming"
    ],
    "likes": 4,
    "dislikes": 0,
    "comments": 1,
    "createdAt": "2024-08-30T14:14:31.651Z"
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid post ID
- `404`: Post not found
- `500`: Server error

---

### `GET /api/posts/:postId/comments` - Get a list of comments on a specific post

**Query Params** (all are optional):
- `sort`: Sort order (`newest`, `top`, `oldest`), default is `top`.
- `limit`: Number of comments to get. (default is 10)
- `cursor`: Cursor for pagination.

**Path Variables**:
- `:postId`: The post ID

**Response Example**:
```json
{
    "cursor": null,
    "comments": [
        {
            "_id": "66cf13eb39cabc7ec5d1fcf0",
            "post": "66cf136c39cabc7ec5d1fce0",
            "owner": {
                "_id": "66e038559b9bb0ffc46836fc",
                "username": "RafXi",
                "profileImage": null
            },
            "body": "haptic Handmade Beauty",
            "likes": 0,
            "dislikes": 3,
            "replies": 1,
            "createdAt": "2024-08-28T12:11:23.226Z"
        }
    ]
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid query params or post ID
- `404`: Post not found
- `500`: Server error

---

### `GET /api/posts/:postId/comments/:commentId` - Get a specific comment on a post

**Path Variables**:
- `:postId`: Post ID
- `:commentId`: Comment ID

**Response Example**:
```json
{
    "_id": "66cf13eb39cabc7ec5d1fcf0",
    "post": "66cf136c39cabc7ec5d1fce0",
    "owner": {
        "_id": "66e038559b9bb0ffc46836fc",
        "username": "RafXi",
        "profileImage": null
    },
    "body": "haptic Handmade Beauty",
    "likes": 0,
    "dislikes": 3,
    "replies": 1,
    "createdAt": "2024-08-28T12:11:23.226Z"
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid comment or post ID
- `404`: Post or comment not found
- `500`: Server error

---

### `GET /api/posts/:postId/comments/:commentId/replies` - Get a list of replies to a specific comment

**Path Variables**:
- `:postId`: Post ID
- `:commentId`: Comment ID

**Response Example**:
```json
{
    "replies": [
        {
            "_id": "66cf13eb39cabc7ec5d1fcf0",
            "post": "66cf136c39cabc7ec5d1fce0",
            "owner": {
                "_id": "66e038559b9bb0ffc46836fc",
                "username": "RafXi",
                "profileImage": null
            },
            "body": "haptic Handmade Beauty",
            "likes": 0,
            "dislikes": 3,
            "createdAt": "2024-08-28T12:11:23.226Z"
        }
    ]
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid comment or post ID
- `404`: Post or comment not found
- `500`: Server error