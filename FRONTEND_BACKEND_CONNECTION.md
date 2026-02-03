# Step-by-Step Guide: Connecting Frontend to Backend

## 1. Add a Vite Proxy (Optional but Recommended)

**File:** `frontend/vite.config.js`

- Add a `server.proxy` configuration so that requests to `/api` get proxied to `http://localhost:3000` during development.
- This lets the frontend call `/api/auth/login` instead of `http://localhost:3000/auth/login`, avoiding CORS issues.

---

## 2. Create an API Base URL Constant

**File:** `frontend/src/constants/index.js` (add to existing or create)

- Add a constant such as `API_BASE_URL` that equals either:
  - `''` or `'/api'` when using the proxy, or
  - `import.meta.env.VITE_API_URL` if you use an environment variable.
- Use this constant wherever you make requests to the backend.

---

## 3. Create an Auth Service

**File:** `frontend/src/services/authService.js` (create new file)

- Create a `register(name, email, password)` function that:
  - Sends a `POST` request to `${API_BASE_URL}/auth/register` with the body `{ name, email, password }`.
  - Sets the `Content-Type: application/json` header.
  - Returns the response JSON (expect `{ success, token }`).
  - Throws or handles errors (e.g., "User already exists").
- Create a `login(email, password)` function that:
  - Sends a `POST` request to `${API_BASE_URL}/auth/login` with the body `{ email, password }`.
  - Same headers and error handling.
  - Returns the response including the token.
- You can use `fetch` or `axios` (already in your dependencies).

---

## 4. Add State and Logic to the Login Component

**File:** `frontend/src/login.jsx`

- Add state variables: `email`, `password`, `name` (for register), `isRegister`, `error`, and `isLoading`.
- Wire each input to its state with `value` and `onChange`.
- Create a `handleSubmit` function that:
  - Prevents default form submission.
  - Clears any previous error.
  - Sets `isLoading` to true.
  - Calls `authService.register()` or `authService.login()` depending on `isRegister`.
  - On success: store the token (e.g., in `localStorage`), then call `onLogin()`.
  - On failure: set the `error` state with the message from the API response.
  - Set `isLoading` to false when done (in a `finally` block or after both success/error paths).
- For register mode: validate that password and confirm password match before calling the API (optional but recommended).
- Render the `error` message somewhere visible in the form.
- Disable the submit button while `isLoading`.

---

## 5. Wire Up the Form Inputs

**File:** `frontend/src/login.jsx`

- Add `value={email}` and `onChange={(e) => setEmail(e.target.value)}` to the email input.
- Same for password, name (register mode), and confirm password (register mode).
- Ensure the form collects real values before submit.

---

## 6. Persist Login State in App

**File:** `frontend/src/App.jsx`

- On component mount (or initial render), check if a token exists in `localStorage`.
- If a token exists, set `isLoggedIn` to true so the user goes straight to the main app.
- (Optional) Add a logout button/function that clears the token and sets `isLoggedIn` to false.

---

## 7. Store and Retrieve the Token (Optional Helper)

**File:** `frontend/src/services/authService.js`

- Add a helper function to save the token to `localStorage` when login/register succeeds.
- Add a function to retrieve the token when needed (e.g., for API calls).
- Add a function to clear the token on logout.

---

## 8. Attach Token to Protected API Requests (If Applicable)

**File:** `frontend/src/services/api.js` (or wherever you make authenticated requests)

- For any API calls that require authentication, add an `Authorization: Bearer <token>` header.
- Get the token from `localStorage` (or your auth service) and include it in each request.

---

## 9. Environment Variables (Optional)

**File:** `frontend/.env` (create at `frontend` folder root, not inside `src`)

- Add something like `VITE_API_URL=http://localhost:3000`.
- In your constants or auth service, use `import.meta.env.VITE_API_URL`.
- This lets you switch URLs for development vs. production without changing code.

---

## Summary: Suggested Order of Implementation

1. Vite proxy (step 1)
2. API base URL constant (step 2)
3. Auth service with register and login (step 3)
4. Login component: state, controlled inputs, handleSubmit, error display (steps 4–5)
5. App.jsx: check for token on load, optional logout (step 6)
6. Token storage helpers in auth service (step 7)
7. Attach token to API requests if you have protected endpoints (step 8)
8. Environment variable for API URL (step 9)
