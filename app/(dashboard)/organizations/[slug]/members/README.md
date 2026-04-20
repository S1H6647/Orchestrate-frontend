# Member Management Implementation

## Query Parameters
The members page synchronizes the following state with the URL query parameters:
- `q`: Search query for name or email (debounced by 400ms).
- `status`: Member status filter (`ALL`, `ACTIVE`, `INVITED`, `REMOVED`).
- `role`: Organization role filter (`ALL`, `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
- `page`: 0-based page index.
- `size`: Page size selector (10, 20, 50).
- `sortBy`: Sorting criteria (default: `joinedAt,desc`).

## Behavior
1. **Debounced Search**: Input changes are debounced by 400ms before triggering an API request.
2. **Auto-Reset**: Changing search query, status, role, or page size automatically resets the page index to 0.
3. **Race Condition Handling**: Powered by TanStack Query, which automatically cancels stale requests and ensures only the latest response updates the UI.
4. **Invite Restrictions**: To maintain organization security, new invitations are restricted to `MEMBER` or `VIEWER` roles only.
5. **Role hierarchy**: Actions like removing members or changing roles are restricted based on the current user's role relative to the target member (must have a strictly higher role).
6. **Responsive Design**: The page switches from a detailed table view on desktop to a stacked card layout on mobile devices.
