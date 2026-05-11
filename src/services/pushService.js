const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_GET_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts';

/**
 * Send a push notification via Expo's push service.
 * Mirrors the logic from the production cURL test.
 *
 * @param {Object} payload
 * @param {string} payload.to - The Expo push token (e.g. ExponentPushToken[...]).
 * @param {string} payload.title - Notification title.
 * @param {string} payload.body - Notification body.
 * @param {string} [payload.sound='default'] - Sound to play.
 * @param {Object} [payload.data={}] - Optional extra data payload.
 * @returns {Promise<Object>} The Expo push receipt (e.g. { status: 'ok', id: '...' }).
 */
export async function sendExpoPushNotification({ to, title, body, sound = 'default', data = {} }) {
  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      title,
      body,
      sound,
      data,
    }),
  });

  const result = await response.json();

  if (!response.ok || result.data?.status !== 'ok') {
    const message = result.errors?.[0]?.message || JSON.stringify(result);
    throw new Error(`Push send failed: ${message}`);
  }

  return result.data;
}

/**
 * Fetch push receipts from Expo to verify delivery status.
 *
 * @param {string[]} receiptIds
 * @returns {Promise<Object>}
 */
export async function getPushReceipts(receiptIds) {
  if (!receiptIds?.length) return {};
  const response = await fetch(EXPO_GET_RECEIPTS_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids: receiptIds }),
  });
  return response.json();
}

/**
 * Send the production test notification from the original cURL command.
 * Defaults to the hard-coded test token; pass your own token to target a different device.
 *
 * @param {string} [token='ExponentPushToken[fVjdt1FMfGugsR3Y6NFiYU]']
 * @returns {Promise<Object>}
 */
export async function sendProductionTestNotification(token = 'ExponentPushToken[fVjdt1FMfGugsR3Y6NFiYU]') {
  return sendExpoPushNotification({
    to: token,
    title: 'בדיקת פרודקשן סופית',
    body: 'אם זה הגיע - שברנו את הקללה! 🎉',
    sound: 'default',
  });
}
