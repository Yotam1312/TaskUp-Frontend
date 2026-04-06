import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

/**
 * פונקציית מעטפת שעושה את כל הקסם מאחורי הקלעים:
 * בודקת טוקנים -> שולחת בקשה -> תופסת 401 -> מרעננת טוקן -> מנסה שוב
 */
async function fetchWithAuth(endpoint, options = {}) {
  let access_token = await AsyncStorage.getItem('access_token');
  let refresh_token = await AsyncStorage.getItem('refresh_token');

  let headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (access_token) {
    headers['Authorization'] = `Bearer ${access_token}`;
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // אם השרת זורק 401 (פג תוקף) ויש לנו ריפרש טוקן ביד
  if (response.status === 401 && refresh_token) {
    try {
      // מבקשים אסימון חדש (שים לב לוודא שזה הנתיב בשרת שלך)
      const refreshRes = await fetch(`${BASE_URL}/api/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
      });

      if (!refreshRes.ok) throw new Error('Refresh failed');

      const newTokens = await refreshRes.json();
      access_token = newTokens.access_token;
      
      await AsyncStorage.setItem('access_token', access_token);
      if (newTokens.refresh_token) {
        refresh_token = newTokens.refresh_token;
        await AsyncStorage.setItem('refresh_token', refresh_token);
      }

      // מנסים שוב את הבקשה המקורית עם האסימון החדש
      headers['Authorization'] = `Bearer ${access_token}`;
      response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

    } catch (err) {
      // אם הרענון נכשל, מנקים נתונים והאפליקציה תזרוק ללוגין בניסיון הבא
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      throw new Error('Session completely expired');
    }
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Request failed');
  }

  // חילוץ בטוח למקרה שהשרת מחזיר סטטוס ריק (כמו 204)
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ----------------------------------------------------
// הפעולות הרגילות
// ----------------------------------------------------

export async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json(); 
}

export async function logoutUser(refreshToken) {
  await fetch(`${BASE_URL}/api/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

// כל שאר הפונקציות פשוט משתמשות במעטפת שיצרנו למעלה (הטוקן נשלף אוטומטית)
// שמרתי את הפרמטר accessToken בחתימת הפונקציה כדי לא לשבור לך את הקריאות מהדשבורד

export const fetchTasks = (accessToken) => fetchWithAuth('/api/assignments/pending', { method: 'GET' });

export const markSubmitted = (accessToken, assignmentId) => fetchWithAuth(`/api/assignments/${assignmentId}/submit`, { method: 'PATCH' });

export const markArchived = (accessToken, assignmentId) => fetchWithAuth(`/api/assignments/${assignmentId}/archive`, { method: 'PATCH' });

export const registerDeviceToken = (accessToken, token) => fetchWithAuth('/api/notifications/register-device', { 
  method: 'POST', 
  body: JSON.stringify({ token }) 
});

export const updateNotificationSettings = (accessToken, settings) => fetchWithAuth('/api/notifications/settings', { 
  method: 'POST', 
  body: JSON.stringify(settings) 
});

export const fetchSubmittedTasks = (accessToken) => fetchWithAuth('/api/assignments/submitted', { method: 'GET' });

export const fetchArchivedTasks = (accessToken) => fetchWithAuth('/api/assignments/archived', { method: 'GET' });

export const unmarkSubmitted = (accessToken, assignmentId) => fetchWithAuth(`/api/assignments/${assignmentId}/unsubmit`, { method: 'PATCH' });

export const fetchAllTasks = (accessToken) => fetchWithAuth('/api/assignments/all', { method: 'GET' });

export const updateAssignmentNote = (accessToken, assignmentId, note) => fetchWithAuth(`/api/assignments/${assignmentId}/note`, {
  method: 'PATCH',
  body: JSON.stringify({ note: note && note.trim().length > 0 ? note : null }),
});

export const unmarkArchived = (accessToken, assignmentId) => fetchWithAuth(`/api/assignments/${assignmentId}/unarchive`, { method: 'PATCH' });

export const fetchNotificationSettings = (accessToken) => fetchWithAuth('/api/notifications/settings', { method: 'GET' });

export const syncAssignments = (accessToken) => fetchWithAuth('/api/assignments/sync', { method: 'POST' });