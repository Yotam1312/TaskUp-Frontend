import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { useColorScheme } from 'nativewind';

type CurrentLanguage = 'en' | 'he';

type TOSCheckboxProps = {
  currentLanguage: CurrentLanguage;
  isAccepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
};

type ContentItem = {
  type: 'title' | 'updated' | 'section' | 'clause';
  text: string;
};

const translations = {
  en: {
    checkboxPrefix: 'I agree to the ',
    checkboxLink: 'Terms of Service & Privacy Policy',
    close: 'Close',
    title: 'Terms of Service & Privacy Policy - MyTask',
    updatedAt: 'Last Updated: April 2026',
    sections: [
      {
        heading: 'Section 1: Terms of Service',
        items: [
          {
            type: 'clause',
            text: '1.1 Description of Service\nMyTask (hereinafter: "the App") is an independent productivity and task-management tool designed specifically for students. The App operates by synchronizing data from the user\'s institutional Moodle system. It is hereby clarified that the App is an independent development and is not affiliated with, sponsored by, endorsed by, or acting on behalf of Moodle HQ or any academic institution.',
          },
          {
            type: 'clause',
            text: '1.2 Limitation of Liability (As-Is)\nThe use of the App and its services is provided on an "As-Is" and "As-Available" basis. While the developers strive for accurate data synchronization and continuous operation, they do not guarantee that the service will be error-free, secure, or uninterrupted. MyTask, its developers, and affiliates shall not be held liable for any direct, indirect, incidental, or consequential damages, including but not limited to missed academic deadlines, resulting academic penalties or grades, data loss, or device damage arising from the use of the App. Users are strictly responsible for verifying all deadlines and academic requirements through official institutional channels.',
          },
          {
            type: 'clause',
            text: '1.3 Intellectual Property\nAll rights regarding the application, including but not limited to source code, graphic design, user interface (UI/UX), logos, brand name, and trademarks, are exclusively owned by the MyTask developers. You may not copy, reproduce, distribute, sell, reverse engineer, or perform any unauthorized use of the App\'s assets without prior explicit written consent from the developers. All Rights Reserved © 2026.',
          },
        ],
      },
      {
        heading: 'Section 2: Privacy Policy',
        items: [
          {
            type: 'clause',
            text: '2.1 Data Collection and Use\nThe App collects academic information (such as course names, assignments, and due dates) and User-Generated Content (UGC) solely to provide and operate the App\'s features. This data is used for task synchronization between team members and to display the student\'s personal schedule.',
          },
          {
            type: 'clause',
            text: '2.2 Security and Authentication\nMyTask DOES NOT collect, process, or store your Moodle password on its servers. Authentication is performed directly with your academic institution\'s servers. For ongoing synchronization, the App stores a strictly encrypted access token (using FERNET encryption) locally on the user\'s device. All data transmission between the App and the server is secured via the HTTPS protocol.',
          },
          {
            type: 'clause',
            text: '2.3 Third-Party Sharing\nWe are committed to the privacy of our users. We do not sell, rent, or share personal or academic data with third parties for marketing or advertising purposes. Data is stored on secure cloud servers exclusively for backup, synchronization, and technical operation of the service.',
          },
          {
            type: 'clause',
            text: '2.4 Data Deletion Rights\nUsers have the absolute right to request the deletion of their account and all associated personal and academic data from our systems at any time. This action can be performed by contacting the developers directly.',
          },
        ],
      },
    ],
  },
  he: {
    checkboxPrefix: 'אני מאשר/ת את ה',
    checkboxLink: 'תנאי השימוש ומדיניות פרטיות',
    close: 'סגור',
    title: 'תקנון, תנאי שימוש ומדיניות פרטיות - MyTask',
    updatedAt: 'עודכן לאחרונה: אפריל 2026',
    sections: [
      {
        heading: 'חלק 1: תנאי שימוש (Terms of Service)',
        items: [
          {
            type: 'clause',
            text: '1.1 מהות השירות\nאפליקציית MyTask (להלן: "האפליקציה") היא כלי עזר עצמאי לניהול משימות וזמן המיועד לסטודנטים. האפליקציה פועלת על בסיס סנכרון נתונים ממערכת ה-Moodle המוסדית של המשתמש. מובהר בזאת כי האפליקציה הינה פיתוח עצמאי ואינה קשורה, ממומנת, נתמכת או פועלת מטעם חברת Moodle העולמית או מטעם מוסד אקדמי כלשהו.',
          },
          {
            type: 'clause',
            text: '1.2 הגבלת אחריות (Limitation of Liability)\nהשימוש באפליקציה ובשירותיה ניתן כפי שהוא ("As-Is") ועל בסיס זמינות ("As-Available"). מפתחי האפליקציה עושים את מירב המאמצים להבטיח סנכרון נתונים תקין ופעילות רציפה, אך אינם יכולים להתחייב לשירות חסין מתקלות, שגיאות או הפסקות. מפתחי MyTask ונציגיהם לא יישאו בכל אחריות לכל נזק ישיר, עקיף, מקרי או תוצאתי, לרבות איחור בהגשת מטלות, השפעה על ציונים אקדמיים, אובדן מידע או נזק למכשיר, הנובעים משימוש באפליקציה או מהסתמכות על המידע המוצג בה. חובה על המשתמש לוודא את מועדי ההגשה ודרישות הקורסים מול המערכות הרשמיות של המוסד האקדמי בלבד.',
          },
          {
            type: 'clause',
            text: '1.3 קניין רוחני (Intellectual Property)\nכל הזכויות באפליקציה, לרבות אך לא רק: קוד המקור, העיצוב הגרפי, ממשק המשתמש (UI/UX), הלוגו, שם האפליקציה וסימני המסחר, שמורות באופן בלעדי למפתחי MyTask. אין להעתיק, לשכפל, להפיץ, למכור, לבצע הנדסה לאחור (Reverse Engineering) או לעשות כל שימוש מסחרי בנכסי האפליקציה ללא קבלת אישור מפורש בכתב ומראש מהמפתחים. כל הזכויות שמורות © 2026.',
          },
        ],
      },
      {
        heading: 'חלק 2: מדיניות פרטיות (Privacy Policy)',
        items: [
          {
            type: 'clause',
            text: '2.1 איסוף ושימוש במידע\nהאפליקציה אוספת מידע אקדמי (כגון שמות קורסים, מטלות ותאריכי הגשה) ותוכן המועלה על ידי המשתמש (User Generated Content) לצורך תפעול תכונות האפליקציה בלבד. המידע משמש לסנכרון משימות בין חברי צוות והצגת לוח הזמנים האישי של הסטודנט.',
          },
          {
            type: 'clause',
            text: '2.2 אבטחה ואימות נתונים\nאפליקציית MyTask אינה אוספת, אינה מעבדת ואינה שומרת את סיסמת ה-Moodle של המשתמש בשרתיה. תהליך האימות מבוצע ישירות מול שרתי המוסד האקדמי. לצורך סנכרון שוטף, האפליקציה שומרת אסימון גישה (Token) מוצפן בתקן FERNET באופן מקומי על גבי מכשיר המשתמש. כל התקשורת בין האפליקציה לשרת מוגנת באמצעות פרוטוקול HTTPS מאובטח.',
          },
          {
            type: 'clause',
            text: '2.3 שיתוף מידע עם צדדים שלישיים\nאנו מתחייבים כי המידע האישי והאקדמי של המשתמש אינו נמכר, מושכר או משותף עם גורמים חיצוניים למטרות פרסום או שיווק. המידע נשמר בשרתי ענן מאובטחים לצורכי גיבוי, סנכרון ותפעול טכני של השירות בלבד.',
          },
          {
            type: 'clause',
            text: '2.4 זכות למחיקת נתונים\nלמשתמש עומדת הזכות המלאה לבקש את מחיקת חשבונו וכל המידע האישי והאקדמי המשויך אליו ממערכותינו בכל עת. ניתן לבצע פעולה זו על ידי פנייה בכתב למפתחים.',
          },
        ],
      },
    ],
  },
} as const;

export default function TOSCheckbox({ currentLanguage, isAccepted, onAcceptChange }: TOSCheckboxProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const t = translations[currentLanguage];

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const cardBackground = isDark ? '#1e293b' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#f1f5f9';
  const bodyText = isDark ? '#cbd5e1' : '#475569';
  const headingText = isDark ? '#f8fafc' : '#0f172a';
  const closeButtonBg = '#4f46e5';

  return (
    <>
      <View
        style={{
          flexDirection: currentLanguage === 'he' ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Checkbox
          value={isAccepted}
          onValueChange={onAcceptChange}
          color={isAccepted ? '#4f46e5' : undefined}
          style={styles.checkbox}
        />

        <Text
          style={{
            flexShrink: 1,
            fontSize: 13,
            fontWeight: '500',
            color: isDark ? '#e2e8f0' : '#334155',
            textAlign: currentLanguage === 'he' ? 'right' : 'left',
            writingDirection: currentLanguage === 'he' ? 'rtl' : 'ltr',
          }}
        >
          {t.checkboxPrefix}
          <Text
            onPress={openModal}
            style={{
              color: '#4f46e5',
              fontWeight: '700',
              textDecorationLine: 'underline',
            }}
          >
            {t.checkboxLink}
          </Text>
        </Text>
      </View>

      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={closeModal}>
          <View style={styles.backdrop} />
        </Pressable>

        <View pointerEvents="box-none" style={styles.modalShell}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorder,
              },
            ]}
          >
            <Text
              style={{
                color: headingText,
                fontSize: 20,
                fontWeight: '800',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {t.title}
            </Text>

            <Text
              style={{
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: 13,
                fontWeight: '600',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              {t.updatedAt}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
              {t.sections.map((section, sectionIndex) => (
                <View key={`${section.heading}-${sectionIndex}`} style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: headingText,
                      fontSize: 16,
                      fontWeight: '800',
                      marginBottom: 10,
                      textAlign: currentLanguage === 'he' ? 'right' : 'left',
                    }}
                  >
                    {section.heading}
                  </Text>

                  {section.items.map((item, itemIndex) => (
                    <View
                      key={`${section.heading}-${itemIndex}`}
                      style={{
                        flexDirection: currentLanguage === 'he' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#6366f1',
                          marginTop: 7,
                          marginHorizontal: 10,
                        }}
                      />
                      <Text
                        style={{
                          color: bodyText,
                          fontSize: 14,
                          lineHeight: 22,
                          flex: 1,
                          textAlign: currentLanguage === 'he' ? 'right' : 'left',
                          writingDirection: currentLanguage === 'he' ? 'rtl' : 'ltr',
                        }}
                      >
                        {item.text}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={closeModal}
              activeOpacity={0.85}
              style={[
                styles.closeButton,
                {
                  backgroundColor: closeButtonBg,
                  shadowColor: closeButtonBg,
                },
              ]}
            >
              <Text style={styles.closeButtonText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 18,
    height: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalShell: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: '20%',
    paddingHorizontal: 24,
  },
  card: {
    maxHeight: '60%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  contentContainer: {
    paddingBottom: 8,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});