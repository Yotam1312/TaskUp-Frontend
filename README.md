<p align="center">
  <img src="src/assets/icon.png" alt="UniTask Logo" width="120" />
</p>

<h1 align="center">UniTask</h1>

<p align="center">
  <strong>Never miss a Moodle deadline again.</strong><br/>
  A smart assignment tracker for academic students — available on iOS and Android.
</p>

<p align="center">
  <img alt="Platform" src="https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-blue" />
  <img alt="Built with" src="https://img.shields.io/badge/built%20with-React%20Native%20%2B%20Expo-61DAFB" />
  <img alt="Backend" src="https://img.shields.io/badge/backend-FastAPI%20%2B%20PostgreSQL-green" />
  <img alt="Cloud" src="https://img.shields.io/badge/cloud-Azure-0089D6" />
</p>

---

## Overview

**UniTask** (formely TaskUp) automatically pulls your Moodle assignments and organizes them in one clean, real-time dashboard. No more logging in to Moodle to remember what's due — UniTask syncs your courses, counts down to every deadline, and sends push notifications before time runs out.

The app is built for Israeli academic institutions and supports both Hebrew (RTL) and English interfaces. It integrates directly with Moodle via a secure backend, so your task list is always up to date without any manual entry.

UniTask is a **real production app** developed by B.Sc. Computer Science students and is available for free on the [App Store](https://unitask.net) and [Google Play](https://unitask.net).

---

## Screenshots

> _Screenshots coming soon — Login, Dashboard, Settings, Notifications_

| Login | Dashboard | Settings | Notifications |
|-------|-----------|----------|---------------|
| _(add screenshot)_ | _(add screenshot)_ | _(add screenshot)_ | _(add screenshot)_ |

---

## Features

### Task Management
- **Pending / Completed / Archive** tabs for clear task organization
- **Real-time countdown timers** — live days, hours, minutes, seconds to each deadline
- **Overdue detection** with visual indicators
- **Mark as submitted**, undo, or archive any task with a single tap
- **Direct Moodle submission links** — jump straight to the submission page

### Personal Notes
- Add a personal note to any task (up to 50 characters)
- Notes are synced to the backend and persist across devices

### Filtering & Sorting
- Filter by time window: Next 3 Days, Next Week, Next Month, or All
- Sort by due date (ascending / descending) or course name (A–Z / Z–A)

### Notifications
- **Configurable advance reminders**: 1h, 5h, 8h, 12h, 1 day, 2 days, 3 days, or 7 days before deadline
- Toggle notifications for new assignments and due-date changes
- **Notification history inbox** with 30-day history and read/unread state

### UI & Experience
- **Dark mode** and Light mode with persistent preference
- **Glassmorphism design** with animated background blobs
- Smooth animations via Moti and React Native Reanimated
- **Skeleton loading screens** while data is fetching
- Pull-to-refresh and auto-sync

### Internationalization
- Full **Hebrew and English** support
- RTL layout for Hebrew, LTR for English
- Switchable at any time from Settings

### Security & Privacy
- Token-based authentication (access + refresh token rotation)
- Tokens stored encrypted via `expo-secure-store`
- HTTPS-only backend communication
- Passwords are never stored on the device
- **Remember Me** option for seamless re-login
- Built-in Terms of Service and Privacy Policy

### Institutional Support
- Multi-institution login: Ruppin Academic Center, Ben-Gurion University
- Moodle course-level task organization

---

## Tech Stack

### Frontend (this repository)

| Category | Technology |
|---|---|
| Framework | React Native 0.81.5 + Expo 54 |
| Language | JavaScript + TypeScript (partial) |
| Navigation | React Navigation 6 |
| Styling | NativeWind 4 (Tailwind CSS for React Native) |
| Animations | Moti + React Native Reanimated 4 |
| Icons | Lucide React Native |
| Local Storage | AsyncStorage + expo-secure-store |
| Push Notifications | Expo Notifications |
| Build & Deploy | EAS (Expo Application Services) |

### Backend (separate repository)

| Category | Technology |
|---|---|
| Language | Python |
| Framework | FastAPI |
| Database | PostgreSQL |
| Containerization | Docker |
| Cloud | Microsoft Azure |
| Push Service | Firebase Cloud Messaging (FCM) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo`
- iOS Simulator, Android Emulator, or a physical device with [Expo Go](https://expo.dev/go)

---

## Project Structure

```
src/
├── pages/
│   ├── LoginPage.jsx        # Auth screen with institution picker & TOS
│   ├── DashBoard.jsx        # Main task management screen
│   └── SettingsPage.jsx     # Notification preferences & theme settings
├── components/
│   ├── TaskCard.jsx         # Individual task card with actions & notes
│   ├── TaskCardSkeleton.jsx # Shimmer loading placeholder
│   └── TOSCheckbox.tsx      # Bilingual Terms of Service modal
├── api.js                   # All API calls with automatic token refresh
├── config.js                # Base URL configuration
├── translations.js          # Hebrew / English i18n strings
└── App.jsx                  # Root component, navigation, global state
```

---

## Authentication Flow

```
User Login
    │
    ▼
POST /api/login  ──►  access_token + refresh_token
    │                       │
    │                   Stored in SecureStore (encrypted)
    │
    ▼
Every API request
    Authorization: Bearer {access_token}
    │
    ├─ 200 OK  ──►  Use response normally
    │
    └─ 401 Unauthorized
            │
            ▼
        POST /api/refresh
            │
            ├─ Success  ──►  New access_token stored → retry original request
            │
            └─ Failure  ──►  Clear tokens → redirect to Login
```

---

## API Reference

The app communicates with the UniTask backend over HTTPS. All endpoints require `Authorization: Bearer {token}`.

| Endpoint | Method | Description |
|---|---|---|
| `/api/login` | POST | Authenticate user |
| `/api/logout` | POST | Invalidate tokens |
| `/api/refresh` | POST | Rotate access token |
| `/api/assignments/pending` | GET | Fetch pending tasks |
| `/api/assignments/submitted` | GET | Fetch completed tasks |
| `/api/assignments/archived` | GET | Fetch archived tasks |
| `/api/assignments/sync` | POST | Sync with Moodle |
| `/api/assignments/{id}/submit` | PATCH | Mark task submitted |
| `/api/assignments/{id}/unsubmit` | PATCH | Undo submission |
| `/api/assignments/{id}/archive` | PATCH | Archive task |
| `/api/assignments/{id}/unarchive` | PATCH | Restore from archive |
| `/api/assignments/{id}/note` | PATCH | Save personal note |
| `/api/notifications/settings` | GET / POST | Get or update notification preferences |
| `/api/notifications/history` | GET | Fetch notification history |
| `/api/notifications/register-device` | POST | Register device push token |

---

## Team

| Name | Role |
|---|---|
| **Harel Cohen** | Fullstack Developer — System Operations & Networking |
| **Yotam Shpilman** | Software & Backend Developer |

Visit [unitask.net](https://unitask.net) for more information.

Visit [UniTask-Backend](https://github.com/Yotam1312/TaskUp-Backend) to look at the backend system.
---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
