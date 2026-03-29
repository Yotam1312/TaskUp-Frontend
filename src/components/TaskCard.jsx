import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView,
  Modal, Alert, Linking, StyleSheet, Pressable, Animated,
} from 'react-native';
import { AlertTriangle, StickyNote, X, Maximize2 } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';

function ScaleButton({ onPress, style, textStyle, label, disabled = false }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true, damping: 15, stiffness: 300 }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 300 }).start();
  return (
    <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}
      disabled={disabled} activeOpacity={1} style={{ width: '100%' }}>
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={textStyle}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}


export default function TaskCard({ task, type, onAction, t, darkMode, index = 0,onNoteOpen,onNoteClose }) {
  const [timeLeftString, setTimeLeftString] = useState("");
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);
  const scrollRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(130);

  const buttonRef = useRef(null);
  const [popupPos, setPopupPos] = useState({ top: 200, left: 20 });

  const [noteMode, setNoteMode] = useState('closed');
  const [tempNote, setTempNote] = useState(task.note || "");

  useEffect(() => {
    setTempNote(task.note || "");
  }, [task.note, noteMode]);

  const handleUpdate = (newText) => {
    setTempNote(newText);
    onAction('updateNote', task.id, newText);
  };

  const handleClear = () => handleUpdate("");

  const handleClose = () => {
    setNoteMode('closed');
    onAction('updateNote', task.id, tempNote);
    if (onNoteClose) onNoteClose()
  };

const handleIconClick = () => {
    if (noteMode !== 'closed') {
      handleClose();
    } else {
      // 1. מפעילים את הגלילה למעלה
      if (onNoteOpen) onNoteOpen();
      
      // 2. מחכים שהגלילה תסתיים (400 מילישניות)
      setTimeout(() => {
        // 3. מודדים את המיקום החדש של הכפתור (עכשיו הוא אמור להיות למעלה)
        buttonRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
          setPopupPos({
            top: Math.max(60, pageY - 80),
            left: Math.max(8, pageX - 230),
          });
          // 4. פותחים את הפופאפ במיקום העליון והבטוח
          setNoteMode('preview');
        });
      }, 400);
    }
  };



  const isOverdue = () => new Date() > new Date(task.dueDateIso);
  const overdue = isOverdue();

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const due = new Date(task.dueDateIso);
      const diff = due - now;
      if (diff <= 0) return "00:00:00";
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      if (days > 0) return `${days}${t.tasks.days} ${hours}${t.tasks.hours} ${minutes}${t.tasks.minutes}`;
      return `${hours}${t.tasks.hours} ${minutes}${t.tasks.minutes} ${seconds}${t.tasks.seconds}`;
    };
    setTimeLeftString(calculateTime());
    const interval = setInterval(() => setTimeLeftString(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [task.dueDateIso, t]);

  const getDotColor = () => {
    if (type === 'archive') return '#facc15';
    if (type === 'completed') return '#60a5fa';
    if (overdue) return '#ef4444';
    return '#4ade80';
  };

  const handleDeleteClick = () => {
    Alert.alert(
      '',
      t.warnings.deleteMsg,
      [
        { text: t.notes.close, style: 'cancel' },
        { text: 'OK', style: 'destructive', onPress: () => onAction('delete', task.id) },
      ]
    );
  };

  const handleSubmitLink = () => {
    if (task.link) Linking.openURL(task.link);
  };

  // Colors
  const cardBg = darkMode ? 'rgba(23, 37, 70, 0.58)' : 'rgba(255, 255, 255, 0.52)';
  const cardBorder = darkMode ? '#1e293b' : '#e2e8f0';
  const titleColor = darkMode ? '#f1f5f9' : '#0f172a';
  const courseColor = darkMode ? '#98a6b8' : '#64748b';
  const btnBorder = darkMode ? '#475569' : '#1e293b';
  const btnText = darkMode ? '#e2e8f0' : '#1e293b';
  const dateBg = darkMode ? '#0f172a' : 'white';
  const timerBg = darkMode ? '#1e293b' : '#f8fafc';
  const dateText = darkMode ? '#e2e8f0' : '#1e293b';
  const timeText = darkMode ? '#94a3b8' : '#64748b';
  const timerLabel = darkMode ? '#94a3b8' : '#64748b';
  const timerValue = darkMode ? '#a5b4fc' : '#4f46e5';
  const dotActiveDark = darkMode ? '#94a3b8' : '#1e293b';
  const dotInactive = darkMode ? '#334155' : '#cbd5e1';

  // Note button styles
  const hasNote = !!task.note;
  const noteBtnBg = hasNote
    ? (darkMode ? 'rgba(79,70,229,0.3)' : '#e0e7ff')
    : (darkMode ? '#1e293b' : '#f8fafc');
  const noteBtnColor = hasNote
    ? (darkMode ? '#a5b4fc' : '#4f46e5')
    : (darkMode ? '#475569' : '#94a3b8');

  return (
    <>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'timing', duration: 300, delay: index * 50 }}
        style={{
          backgroundColor: cardBg,
          borderWidth: 1,
          borderColor: cardBorder,
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          minHeight: 128,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        
        {/* Right buttons */}
        <View style={{ gap: 10, width: 100, marginTop: 8, alignItems: 'center' }}>
          {type === 'pending' && (
            <>
              <ScaleButton
                onPress={handleSubmitLink}
                style={[styles.actionBtn, { borderColor: btnBorder }]}
                textStyle={{ fontSize: 13, fontWeight: '700', color: btnText, textAlign: 'center' }}
                label={t.buttons.submit}
              />
              <ScaleButton
                onPress={() => onAction('markAsSubmitted', task.id)}
                style={[styles.actionBtn, { borderColor: btnBorder }]}
                textStyle={{ fontSize: 13, fontWeight: '700', color: btnText, textAlign: 'center' }}
                label={t.buttons.markAsSubmitted}
              />
            </>
          )}

          {type === 'completed' && (
            <>
              <ScaleButton
                onPress={() => onAction('undoSubmit', task.id)}
                style={[styles.actionBtn, { borderColor: btnBorder }]}
                textStyle={{ fontSize: 11, fontWeight: '700', color: btnText, textAlign: 'center' }}
                label={t.buttons.undoSubmit}
              />
              <ScaleButton
                onPress={() => onAction('moveToArchive', task.id)}
                disabled={!overdue && !task.submittedLate}
                style={[styles.actionBtn, {
                  borderColor: (!overdue && !task.submittedLate) ? (darkMode ? '#334155' : '#cbd5e1') : btnBorder,
                  opacity: (!overdue && !task.submittedLate) ? 0.5 : 1,
                }]}
                textStyle={{ fontSize: 11, fontWeight: '700', color: (!overdue && !task.submittedLate) ? '#94a3b8' : btnText, textAlign: 'center' }}
                label={t.buttons.moveToArchive}
              />
            </>
          )}

          {type === 'archive' && (
            <ScaleButton
              onPress={handleDeleteClick}
              style={[styles.actionBtn, { borderColor: btnBorder }]}
              textStyle={{ fontSize: 11, fontWeight: '700', color: btnText, textAlign: 'center' }}
              label={t.buttons.removeFromArchive}
            />
          )}

          {/* Sticky note button */}
          <TouchableOpacity
            ref={buttonRef}
            onPress={handleIconClick}
            style={{
              width: 32, height: 32,
              borderRadius: 16,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: noteBtnBg,
              borderWidth: hasNote ? 1 : 0,
              borderColor: hasNote ? (darkMode ? 'rgba(99,102,241,0.4)' : '#c7d2fe') : 'transparent',
            }}
            activeOpacity={0.7}
          >
            <StickyNote size={16} color={noteBtnColor} />
            {/* Dot indicator when note exists */}
            {hasNote && (
              <View style={{
                position: 'absolute', top: 0, right: 0,
                width: 10, height: 10, borderRadius: 5,
                backgroundColor: '#6366f1',
                borderWidth: 2, borderColor: darkMode ? '#0f172a' : 'white',
              }} />
            )}
          </TouchableOpacity>
        </View>

        {/* Left content (RTL: text-right, flex-end) */}
        <View style={{ flex: 1, paddingLeft: 4, paddingRight: 4, alignItems: 'flex-end' }}>

          {/* Dot + Title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, justifyContent: 'flex-end', width: '100%' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: titleColor, lineHeight: 22, textAlign: 'right', flexShrink: 1 }}>
              {task.title}
            </Text>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getDotColor(), flexShrink: 0 }} />
          </View>

          {/* Course */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: courseColor, marginBottom: 14, marginRight: 20, textAlign: 'right', letterSpacing: 0.3 }}>
            {task.course}
          </Text>

          {/* Overdue badge */}
          {type === 'pending' && overdue && (
            <View style={[styles.badge, { backgroundColor: darkMode ? 'rgba(239,68,68,0.2)' : '#fee2e2', marginBottom: 8, marginRight: 20 }]}>
              <AlertTriangle size={10} color="#ef4444" />
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#ef4444' }}>{t.tasks.late}</Text>
            </View>
          )}

          {/* Submitted late badge */}
          {(type === 'completed' || type === 'archive') && task.submittedLate && (
            <View style={[styles.badge, { backgroundColor: darkMode ? 'rgba(239,68,68,0.2)' : '#fee2e2', marginBottom: 8, marginRight: 20 }]}>
              <AlertTriangle size={10} color="#ef4444" />
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#ef4444' }}>{t.tasks.submittedLate}</Text>
            </View>
          )}

          {/* Date / Timer scrollable widget */}
          <View style={{ marginRight: 20, width: 130 }}>
            <View style={{ borderWidth: 1, borderColor: darkMode ? '#475569' : '#1e293b', borderRadius: 8, overflow: 'hidden' }}>
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={type === 'pending' && !overdue}
                onLayout={(e) => setScrollWidth(e.nativeEvent.layout.width)}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  setActiveScrollIndex(Math.round(x / scrollWidth));
                }}
                scrollEventThrottle={16}
                style={{ width: 130 }}
              >
                {/* Slide 1: Date */}
                <View style={{ width: 130, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, backgroundColor: dateBg }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: dateText }}>{task.dueDateDisplay}</Text>
                  <Text style={{ fontSize: 10, color: timeText }}>{task.dueTimeDisplay}</Text>
                </View>

                {/* Slide 2: Countdown (only for pending, not overdue) */}
                {type === 'pending' && !overdue && (
                  <View style={{ width: 130, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, backgroundColor: timerBg }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: timerLabel }}>{t.tasks.timeLeft}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: timerValue, fontVariant: ['tabular-nums'] }}>
                      {timeLeftString}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Scroll dots */}
            {type === 'pending' && !overdue && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => { scrollRef.current?.scrollTo({ x: 0, animated: true }); setActiveScrollIndex(0); }}
                  style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: activeScrollIndex === 0 ? dotActiveDark : dotInactive }}
                />
                <TouchableOpacity
                  onPress={() => { scrollRef.current?.scrollTo({ x: scrollWidth, animated: true }); setActiveScrollIndex(1); }}
                  style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: activeScrollIndex === 1 ? dotActiveDark : dotInactive }}
                />
              </View>
            )}
          </View>
        </View>

      </MotiView>

      {/* NOTE PREVIEW POPUP */}
      <Modal visible={noteMode === 'preview'} transparent animationType="none" onRequestClose={handleClose}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
        <MotiView
          from={{ opacity: 0.99, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', damping: 18 }}
          style={{
            position: 'absolute',
            top: popupPos.top,
            left: popupPos.left,
            width: 224,
            backgroundColor: darkMode ? '#1e293b' : '#eef2ff',
            borderRadius: 12,
            padding: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Arrow pointing right (toward the button) */}
          <View style={{
            position: 'absolute', top: 12, right: -6,
            width: 12, height: 12,
            backgroundColor: darkMode ? '#1e293b' : '#eef2ff',
            transform: [{ rotate: '45deg' }],
          }} />

          <TextInput
            value={tempNote}
            onChangeText={(val) => val.length <= 50 && handleUpdate(val)}
            placeholder={t.notes.empty}
            placeholderTextColor={darkMode ? '#475569' : '#94a3b8'}
            multiline
            autoFocus
            style={{
              height: 64,
              fontSize: 12,
              color: darkMode ? '#cbd5e1' : '#334155',
              textAlignVertical: 'top',
              textAlign: 'right',
              marginBottom: 8,
            }}
          />

          {/* Clear button — appears when there's text */}
          <AnimatePresence>
            {tempNote.length > 0 && (
              <MotiView
                key="clear-btn"
                from={{ opacity: 0, translateY: 5 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 5 }}
                transition={{ type: 'timing', duration: 200 }}
                style={{ position: 'absolute', bottom: 49, left: 10 }}
              >
                <TouchableOpacity
                  onPress={handleClear}
                  style={{
                    paddingHorizontal: 8, paddingVertical: 3,
                    backgroundColor: darkMode ? 'rgba(99,102,241,0.2)' : '#e0e7ff',
                    borderRadius: 8,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: darkMode ? '#a5b4fc' : '#4f46e5' }}>
                    {t.notes.clear}
                  </Text>
                </TouchableOpacity>
              </MotiView>
            )}
          </AnimatePresence>

          {/* Bottom bar: close | char count + expand */}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            borderTopWidth: 1, borderTopColor: darkMode ? '#334155' : 'rgba(199,210,254,0.5)',
            paddingTop: 8, marginTop: 4,
          }}>
            <TouchableOpacity onPress={handleClose} style={{ padding: 4 }} activeOpacity={0.7}>
              <X size={12} color={darkMode ? '#64748b' : '#94a3b8'} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 10, fontFamily: 'monospace', color: tempNote.length === 50 ? '#ef4444' : (darkMode ? '#64748b' : '#94a3b8') }}>
                {tempNote.length}/50
              </Text>
              <TouchableOpacity
                onPress={() => setNoteMode('edit')}
                style={{
                  padding: 6,
                  backgroundColor: darkMode ? 'rgba(99,102,241,0.2)' : '#e0e7ff',
                  borderRadius: 8,
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                }}
                activeOpacity={0.7}
              >
                <Maximize2 size={12} color={darkMode ? '#a5b4fc' : '#4f46e5'} />
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>
      </Modal>

      {/* NOTE EDIT MODAL (fullscreen) */}
      <Modal visible={noteMode === 'edit'} transparent animationType="none" onRequestClose={handleClose}>
        <MotiView
          from={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 200 }}
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'flex-start', padding: 5, paddingTop: 150 }]}
        >
          <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />

          <MotiView
            from={{ scale: 0.9, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'timing', damping: 18 }}
            style={{
              width: '91.666%',
              maxWidth: 448,
              backgroundColor: darkMode ? '#0f172a' : 'white',
              borderRadius: 16,
              padding: 24,
              borderWidth: 1,
              borderColor: darkMode ? '#1e293b' : '#e2e8f0',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
              elevation: 20,
            }}
          >
            {/* Close X */}
            <TouchableOpacity
              onPress={handleClose}
              style={{
                position: 'absolute', top: 16, left: 16,
                padding: 6,
                backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
                borderRadius: 100,
              }}
              activeOpacity={0.7}
            >
              <X size={18} color={darkMode ? '#64748b' : '#64748b'} />
            </TouchableOpacity>

            {/* Title */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              <StickyNote size={20} color="#6366f1" />
              <Text style={{ fontSize: 17, fontWeight: '700', color: darkMode ? 'white' : '#1e293b' }}>
                {t.notes.title}
              </Text>
            </View>

            {/* Textarea */}
            <TextInput
              value={tempNote}
              onChangeText={(val) => val.length <= 50 && handleUpdate(val)}
              placeholder={t.notes.placeholder}
              placeholderTextColor={darkMode ? '#475569' : '#94a3b8'}
              multiline
              autoFocus
              style={{
                height: 128,
                padding: 16,
                backgroundColor: darkMode ? '#020617' : '#f8fafc',
                borderWidth: 1,
                borderColor: darkMode ? '#1e293b' : '#e2e8f0',
                borderRadius: 12,
                fontSize: 14,
                color: darkMode ? '#e2e8f0' : '#1e293b',
                textAlignVertical: 'top',
                textAlign: 'right',
              }}
            />

            {/* Bottom bar */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12,  }}>
              <Text style={{ fontSize: 1, fontWeight: '700', color: tempNote.length === 50 ? '#ef4444' : 'transparent' }}>
                {t.notes.limitWarning}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: '700', color: tempNote.length === 50 ? '#ef4444' : (darkMode ? '#64748b' : '#475569') }}>
                  {tempNote.length}/50
                </Text>

                <TouchableOpacity
                  onPress={handleClear}
                  disabled={tempNote.length === 0}
                  style={{
                    paddingHorizontal: 20, paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: darkMode ? '#6366f1' : '#4f46e5',
                    borderRadius: 12,
                    opacity: tempNote.length === 0 ? 0.5 : 1,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: darkMode ? '#a5b4fc' : '#4f46e5' }}>
                    {t.notes.clear}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleClose}
                  style={{
                    paddingHorizontal: 20, paddingVertical: 8,
                    backgroundColor: '#4f46e5',
                    borderRadius: 12,
                    shadowColor: '#4f46e5',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.35,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: 'white' }}>
                    {t.notes.close}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </MotiView>
        </MotiView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  actionBtn: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
});
