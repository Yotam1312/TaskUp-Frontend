export const translations = {
    he: {
        greeting: {
            morning: "בוקר טוב",
            afternoon: "צהריים טובים",
            evening: "ערב טוב",
            night: "לילה טוב"
        },
        tasks: {
            pendingCount: "מטלות לביצוע",
            days: "ימ'",
            hours: "שע'",
            minutes: "דק'",
            seconds: "שנ'",
            timeLeft: "זמן שנותר:",
            late: "באיחור",
            submittedLate: "הוגש באיחור",
            noTasks: "אין מטלות להצגה כרגע 🎉"
        },
        tabs: {
            pending: "לביצוע",
            completed: "הושלמו",
            archive: "ארכיון"
        },
        buttons: {
            submit: "הגש מטלה",
            markAsSubmitted: "סמן כהוגש",
            undoSubmit: "בטל הגשה",
            moveToArchive: "העבר לארכיון",
            removeFromArchive: "החזר מארכיון"
        },
        // --- הוספנו את החלק הזה להערות ---
        notes: {
            addNote: "הוסף הערה",
            title: "הערה למטלה",
            placeholder: "אין הערה כרגע...",
            limitWarning: "אין לחרוג מ-50 תווים",
            chars: "תווים",
            close: "שמור",
            expand: "פתח לעריכה",
            preview: "הצצה",
            empty: "אין הערה כרגע...",
            clear: "נקה הכל"
        },
        // --------------------------------
        menu: {
            tasks: "מטלות ",
            archive: "ארכיון",
            settings: "הגדרות",
            logout: "התנתק",
            logoutConfirm: "האם אתה בטוח שברצונך להתנתק?"
        },
        helpModal: {
            title: "עזרה ושימוש",
            close: "סגור",
            body: "ניהול וסטטוס מטלות:\n\nלביצוע: מטלות פתוחות שעוד לא הגשת.\n\nהוגשו: מטלות שסומנו כהוגשו.\n\nארכיון: מטלה עוברת לארכיון אוטומטית כאשר הקורס מסתיים או אם בחרת להעביר אותה לשם ידנית כדי לנקות את התצוגה. לכל קורס תיפתח תיקייה באופן אוטומטי כאשר מטלה עוברת לארכיון.\n\nהוגש באיחור: תווית המופיעה אוטומטית במידה והמטלה סומנה כ\"הוגשה\" לאחר שתאריך היעד המקורי כבר חלף.\n\nפעולות וכלים חכמים:\n\nהגש מטלה: לחיצה כאן תפתח את הדפדפן ותעביר אותך ישירות לעמוד ההגשה של המטלה הזו באתר המודל.\n\nסמן כהוגש: מאפשר לך לעדכן באפליקציה שהמטלה בוצעה, כדי למנוע התראות עבורה.\n\nבטל הגשה: התחרטת או גילית שעליך לתקן? כפתור זה יחזיר את המטלה לסטטוס \"לביצוע\".\n\nהעבר לארכיון: מעלים את המטלה מרשימת המשימות השוטפות.\n\nשעון עצר: החלק על תאריך ההגשה של המטלה כדי לחשוף שעון ספירה לאחור המראה בדיוק כמה זמן נותר להגשה (זמין רק עבור מטלות שטרם חלף מועדן).\n\nפתק אישי: לכל מטלה מוצמד פתק שבו תוכל לכתוב לעצמך דגשים, תזכורות או סיכומים קצרים.\n\nמסך ההגדרות:\n\nמסך כהה: זמין לנוחיותכם.\n\nשפות הממשק: עברית ואנגלית.\n\nזמני התראה: שליטה מלאה על תזמון הפושים שתקבל.\n\nהתראות עדכונים: אפשרות להדליק או לכבות התראות על גילוי מטלות חדשות או שינוי בתאריכי ההגשה במודל.\n\nהתנתקות: יציאה מהחשבון שלך.\n\nדיווח על תקלות:\nנתקלתם בבעיה? דווחו לנו בכתובת: unitask.net",
        },
        settings: {
            title: "הגדרות",
            general: "כללי",
            language: "שפת ממשק",
            darkMode: "מצב כהה",
            notifications: "התראות ותזכורות",
            notifyLabel: "התראה לפני מועד הגשה:",
            newAssignment: "מטלה חדשה",
            dateChange: "שינוי מועד הגשה",
            emailNotif: "התראות במייל",
            smsNotif: "הודעות SMS",
            pushNotif: "התראות דחיפה (Push)",
            save: "שמור שינויים",
            back: "חזור"
        },
        warnings: {
            deleteMsg: "האם אתה בטוח שברצונך להחזיר את המטלה מהארכיון?"
        },
        login: {
            slogan: "ניהול המטלות האקדמיות שלך",
            idPlaceholder: "שם משתמש",
            passwordPlaceholder: "סיסמה",
            submitButton: "התחבר",
            or: "או",
            moodleButton: "התחבר דרך Moodle"
        },
        notificationsInbox: {
            title: "התראות",
            empty: "אין התראות",
            justNow: "ממש עכשיו",
            minutesAgo: "לפני {time} דקות",
            hoursAgo: "לפני {time} שעות",
            daysAgo: "לפני {time} ימים",
            weeksAgo: "לפני שבוע ומעלה"
        },
        filters: {
            title: "סנן לפי",
            sortBy: "מיון",
            dateAsc: "תאריך - מהישן לחדש",
            dateDesc: "תאריך - מהחדש לישן",
            courseAsc: "שם הקורס (א-ת)",
            courseDesc: "שם הקורס (ת-א)",
            dueIn: "זמן הגשה",
            next3Days: "3 ימים הבאים",
            nextWeek: "שבוע הקרוב",
            nextMonth: "חודש הקרוב",
            all: "הכל",
            close: "סגור"
        }
    },
    en: {
        greeting: {
            morning: "Good Morning",
            afternoon: "Good Afternoon",
            evening: "Good Evening",
            night: "Good Night"
        },
        tasks: {
            pendingCount: "tasks pending",
            days: "d",
            hours: "h",
            minutes: "m",
            seconds: "s",
            timeLeft: "Time Left:",
            late: "Overdue",
            submittedLate: "Submitted Late",
            noTasks: "No tasks to show right now 🎉"
        },
        tabs: {
            pending: "Pending",
            completed: "Completed",
            archive: "Archive"
        },
        buttons: {
            submit: "Submit",
            markAsSubmitted: "Mark Submitted",
            undoSubmit: "Undo Submit",
            moveToArchive: "Archive",
            removeFromArchive: "Restore"
        },
        // --- Note Section Added ---
        notes: {
            addNote: "Add Note",
            title: "Task Note",
            placeholder: "Write a note here...",
            limitWarning: "Max 50 characters",
            chars: "chars",
            close: "Save",
            expand: "Expand",
            preview: "Preview",
            empty: "No note right now...",
            clear: "Clear"
        },
        // --------------------------
        menu: {
            tasks: "Tasks",
            archive: "Archive",
            settings: "Settings",
            logout: "Logout",
            logoutConfirm: "Are you sure you want to logout?"
        },
        helpModal: {
            title: "Usage & Help",
            close: "Close",
            body: "Tasks Management & Status:\n\nPending: Open tasks that you haven't submitted yet.\n\nSubmitted: Tasks that have been marked as submitted.\n\nArchive: A task is automatically moved to the archive when the course ends, or if you manually choose to move it there to clear your view. A folder for each course will be created automatically when a task is archived.\n\nSubmitted Late: A label that appears automatically if the task was marked as \"Submitted\" after the original due date has passed.\n\nSmart Actions & Tools:\n\nSubmit Task: Clicking here will open your browser and take you directly to the submission page for this task on the Moodle website.\n\nMark as Submitted: Allows you to update the app that the task is done, preventing further notifications for it.\n\nUnsubmit: Changed your mind or realized you need to make a correction? This button will return the task to the \"Pending\" status.\n\nMove to Archive: Hides the task from your current task list.\n\nCountdown Timer: Swipe on the task's due date to reveal a countdown timer showing exactly how much time is left to submit (available only for tasks whose deadline hasn't passed).\n\nPersonal Note: Each task has an attached note where you can write down highlights, reminders, or short summaries for yourself.\n\nSettings Screen:\n\nDark Mode: Available for your convenience.\n\nInterface Languages: Hebrew and English.\n\nNotification Times: Full control over the timing of push notifications you receive.\n\nUpdate Notifications: Option to turn on or off notifications for newly discovered tasks or due date changes in Moodle.\n\nLog Out: Sign out of your account.\n\nReport Issues:\nEncountered a problem? Send us a message at: unitask.net",
        },
        settings: {
            title: "Settings",
            general: "General",
            language: "Interface Language",
            darkMode: "Dark Mode",
            notifications: "Notifications",
            notifyLabel: "Notify before due date:",
            newAssignment: "New Assignment",
            dateChange: "Date Change",
            emailNotif: "Email Notifications",
            smsNotif: "SMS Messages",
            pushNotif: "Push Notifications",
            save: "Save Changes",
            back: "Back",
            
        },
        warnings: {
            deleteMsg: "Are you sure you want to permanently delete this task?"
        },
        login: {
            slogan: "Manage your academic tasks smartly",
            idPlaceholder: "Username",
            passwordPlaceholder: "Password",
            submitButton: "Login",
            or: "OR",
            moodleButton: "Login with Moodle"
        },notificationsInbox: {
            title: "Notifications",
            empty: "No notifications",
            justNow: "Just now",
            minutesAgo: "{time} minutes ago",
            hoursAgo: "{time} hours ago",
            daysAgo: "{time} days ago",
            weeksAgo: "A week ago or more"
        },
        filters: {
            title: "Filter & Sort",
            sortBy: "Sort By",
            dateAsc: "Date - Oldest to Newest",
            dateDesc: "Date - Newest to Oldest",
            courseAsc: "Course Name (A-Z)",
            courseDesc: "Course Name (Z-A)",
            dueIn: "Due In",
            next3Days: "Next 3 Days",
            nextWeek: "Next Week",
            nextMonth: "Next Month",
            all: "All",
            close: "Close"
        }
    }
};