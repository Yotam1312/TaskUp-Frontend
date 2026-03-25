import { BASE_URL } from './config';

/**
 * Login to Moodle via the server.
 * Returns { name, access_token, refresh_token } on success.
 */
export async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json(); // { success, name, access_token, refresh_token }
}

/**
 * Fetch all pending tasks for the authenticated user.
 * Uses access_token in Authorization header.
 */
export async function fetchTasks(accessToken) {
  const res = await fetch(`${BASE_URL}/api/assignments/pending`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json(); // array of assignments
}

/**
 * Mark an assignment as submitted.
 */
export async function markSubmitted(accessToken, assignmentId) {
  const res = await fetch(`${BASE_URL}/api/assignments/${assignmentId}/submit`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('Failed to mark as submitted');
  return res.json();
}

/**
 * Move an assignment to archive.
 */
export async function markArchived(accessToken, assignmentId) {
  const res = await fetch(`${BASE_URL}/api/assignments/${assignmentId}/archive`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('Failed to archive');
  return res.json();
}

/**
 * Logout — revokes the refresh token.
 */
export async function logoutUser(refreshToken) {
  await fetch(`${BASE_URL}/api/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}