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

/**
 * Registers the Expo Push Token with the backend.
 */
export async function registerDeviceToken(accessToken, token) {
  const res = await fetch(`${BASE_URL}/api/notifications/register-device`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error('Failed to register device token');
  return res.json();
}

/**
 * Update notification settings for the user.
 */
export async function updateNotificationSettings(accessToken, settings) {
  console.log("📡 Attempting fetch to:", `${BASE_URL}/api/notifications/settings`);
  console.log("📦 Payload:", JSON.stringify(settings));
  const res = await fetch(`${BASE_URL}/api/notifications/settings`, {
    method: 'POST', // או PUT, לפי מה שתגדיר ב-Backend
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

/**
 * Fetch all submitted tasks that are not yet archived.
 */
export async function fetchSubmittedTasks(accessToken) {
  const res = await fetch(`${BASE_URL}/api/assignments/submitted`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch submitted tasks');
  return res.json();
}

/**
 * Fetch all archived tasks (manual + auto-expired).
 */
export async function fetchArchivedTasks(accessToken) {
  const res = await fetch(`${BASE_URL}/api/assignments/archived`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch archived tasks');
  return res.json();
}

/**
 * Unmark an assignment as submitted.
 */
export async function unmarkSubmitted(accessToken, assignmentId) {
  const res = await fetch(`${BASE_URL}/api/assignments/${assignmentId}/unsubmit`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('Failed to unmark as submitted');
  return res.json();
}

export async function fetchAllTasks(accessToken) {
  const res = await fetch(`${BASE_URL}/api/assignments/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch all tasks');
  return res.json();
}

export async function unmarkArchived(accessToken, assignmentId) {
  const res = await fetch(`${BASE_URL}/api/assignments/${assignmentId}/unarchive`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('Failed to unarchive');
  return res.json();
}