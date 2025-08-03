import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Chip,
  Card,
  Divider,
  ActivityIndicator,
  List,
  Menu,
  Surface,
  IconButton,
} from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { ExamRecordCreate, examRecordAPI } from '@/services/api';
import { useAppTheme } from '@/constants/PaperTheme';
import { modalStyles } from '@/styles/modalStyles';

interface ExamRecordModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
  examRecord?: ExamRecordCreate & { id?: number };
}

interface Subject {
  id: number;
  name: string;
}

interface Topic {
  id: number;
  name: string;
}

export function ExamRecordModal({ 
  visible, 
  onDismiss, 
  onSuccess, 
  examRecord 
}: ExamRecordModalProps) {
  const theme = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  
  // Form state
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examType, setExamType] = useState<'tyt' | 'ayt' | 'dil' | 'msu'>('tyt');
  const [examSubject, setExamSubject] = useState<number | null>(null);
  const [normalDuration, setNormalDuration] = useState('');
  const [studentDuration, setStudentDuration] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [totalQuestions, setTotalQuestions] = useState('');
  const [totalMarked, setTotalMarked] = useState('');
  const [totalCorrect, setTotalCorrect] = useState('');
  const [totalWrong, setTotalWrong] = useState('');

  // Question system state
  const [questionCount, setQuestionCount] = useState(40); // 1-40 arası
  const [currentQuestion, setCurrentQuestion] = useState(1); // Şu anki soru
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);

  // Exam types
  const examTypes = [
    { label: 'TYT', value: 'tyt' },
    { label: 'AYT', value: 'ayt' },
    { label: 'Dil', value: 'dil' },
    { label: 'MSÜ', value: 'msu' },
  ];

  useEffect(() => {
    if (visible) {
      loadSubjects();
      loadTopics();
      if (examRecord) {
        // Edit mode - populate form
        setExamName(examRecord.exam_name);
        setExamDate(examRecord.exam_date);
        setExamType(examRecord.exam_type);
        setExamSubject(examRecord.exam_subject);
        setNormalDuration(examRecord.normal_duration?.toString() || '');
        setStudentDuration(examRecord.student_duration?.toString() || '');
        setDifficulty(examRecord.difficulty);
        setTotalQuestions(examRecord.total_questions?.toString() || '');
        setTotalMarked(examRecord.total_marked?.toString() || '');
        setTotalCorrect(examRecord.total_correct?.toString() || '');
        setTotalWrong(examRecord.total_wrong?.toString() || '');
        setSelectedTopics(examRecord.exam_topics || []);
      } else {
        // New record - reset form
        resetForm();
      }
    }
  }, [visible, examRecord]);

  const loadSubjects = async () => {
    try {
      const response = await examRecordAPI.getSubjects();
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Dersler yüklenemedi:', error);
    }
  };

  const loadTopics = async () => {
    try {
      const response = await examRecordAPI.getTopics();
      if (response.success && response.data) {
        setTopics(response.data);
      }
    } catch (error) {
      console.error('Konular yüklenemedi:', error);
      // Geçici olarak boş array kullan
      setTopics([]);
    }
  };

  const resetForm = () => {
    setExamName('');
    setExamDate('');
    setExamType('tyt');
    setExamSubject(null);
    setNormalDuration('');
    setStudentDuration('');
    setDifficulty('medium');
    setTotalQuestions('');
    setTotalMarked('');
    setTotalCorrect('');
    setTotalWrong('');
    setSelectedTopics([]);
    setQuestionCount(40);
    setCurrentQuestion(1);
    setAnswers({});
  };

  const handleSubmit = async () => {
    if (!examName.trim()) {
      Alert.alert('Hata', 'Deneme adı gerekli');
      return;
    }

    if (!examDate.trim()) {
      Alert.alert('Hata', 'Deneme tarihi gerekli');
      return;
    }

    if (!examSubject) {
      Alert.alert('Hata', 'Ders seçimi gerekli');
      return;
    }

    try {
      setLoading(true);
      const examData: ExamRecordCreate = {
        exam_name: examName.trim(),
        exam_date: examDate.trim(),
        exam_type: examType,
        exam_subject: examSubject!,
        exam_topics: selectedTopics.length > 0 ? selectedTopics : undefined,
        normal_duration: normalDuration ? parseInt(normalDuration) : 0,
        student_duration: studentDuration ? parseInt(studentDuration) : 0,
        difficulty,
        total_questions: questionCount,
        total_marked: Object.keys(answers).length,
        total_correct: Object.values(answers).filter(a => a === 'correct').length,
        total_wrong: Object.values(answers).filter(a => a === 'wrong').length,
      };

      if (examRecord?.id) {
        // Edit mode
        await examRecordAPI.updateExamRecord(examRecord.id, examData);
        Alert.alert('Başarılı', 'Deneme kaydı güncellendi');
      } else {
        // Create mode
        await examRecordAPI.createExamRecord(examData);
        Alert.alert('Başarılı', 'Deneme kaydı oluşturuldu');
      }

      onSuccess();
      resetForm();
    } catch (error: any) {
      console.error('Deneme kaydı hatası:', error);
      Alert.alert('Hata', error.message || 'Deneme kaydı oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId: number) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const getSelectedSubjectName = () => {
    const subject = subjects.find(s => s.id === examSubject);
    return subject?.name || 'Ders Seç';
  };

  const getSelectedTypeName = () => {
    const type = examTypes.find(t => t.value === examType);
    return type?.label || 'TYT';
  };

  const handleAnswerChange = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const getCurrentAnswer = () => {
    return answers[currentQuestion] || '';
  };

  console.log('🎯 ExamRecordModal render edildi, visible:', visible);
  
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: 20,
          borderRadius: 16,
          padding: 16,
          maxHeight: '85%',
        }}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={modalStyles.header}>
            <Text style={modalStyles.headerTitle}>deneme kayıt</Text>
          </View>

          {/* Exam Name */}
          <View style={modalStyles.section}>
            <TextInput
              label="Deneme Adı"
              value={examName}
              onChangeText={setExamName}
              mode="outlined"
              style={modalStyles.input}
              placeholder="deneme 3d"
            />
          </View>

          {/* Exam Type & Subject Selection */}
          <View style={modalStyles.section}>
            <View style={modalStyles.chipRow}>
              {/* Exam Type Menu */}
              <Menu
                visible={showTypeMenu}
                onDismiss={() => setShowTypeMenu(false)}
                anchor={
                  <Chip
                    selected={true}
                    onPress={() => setShowTypeMenu(true)}
                    style={[modalStyles.chip, modalStyles.chipSelected]}
                    mode="outlined"
                    textStyle={[modalStyles.chipText, modalStyles.chipTextSelected]}
                  >
                    {getSelectedTypeName()}
                  </Chip>
                }
              >
                {examTypes.map((type) => (
                  <Menu.Item
                    key={type.value}
                    onPress={() => {
                      setExamType(type.value as any);
                      setShowTypeMenu(false);
                    }}
                    title={type.label}
                  />
                ))}
              </Menu>

              {/* Subject Menu */}
              <Menu
                visible={showSubjectMenu}
                onDismiss={() => setShowSubjectMenu(false)}
                anchor={
                  <Chip
                    selected={examSubject !== null}
                    onPress={() => setShowSubjectMenu(true)}
                    style={[modalStyles.chip, examSubject ? modalStyles.chipSelected : {}]}
                    mode="outlined"
                    textStyle={[modalStyles.chipText, examSubject ? modalStyles.chipTextSelected : {}]}
                  >
                    {getSelectedSubjectName()}
                  </Chip>
                }
              >
                {subjects.map((subject) => (
                  <Menu.Item
                    key={subject.id}
                    onPress={() => {
                      setExamSubject(subject.id);
                      setShowSubjectMenu(false);
                    }}
                    title={subject.name}
                  />
                ))}
              </Menu>
            </View>
          </View>

          {/* Subject Selection */}
          <View style={modalStyles.section}>
            <Button
              mode="outlined"
              onPress={() => {
                // TODO: Subject picker modal
                console.log('KONU SEÇİM');
              }}
              style={modalStyles.subjectButton}
              icon="check"
              labelStyle={modalStyles.subjectButtonText}
            >
              KONU SEÇİM
            </Button>
          </View>

          {/* Question Navigation */}
          <View style={modalStyles.section}>
            <Text style={modalStyles.sectionTitle}>Soru: {currentQuestion} / {questionCount}</Text>
            <View style={modalStyles.questionNavigation}>
              <Button
                mode="outlined"
                onPress={() => setCurrentQuestion(Math.max(1, currentQuestion - 1))}
                disabled={currentQuestion <= 1}
                style={[modalStyles.navButton, currentQuestion <= 1 ? modalStyles.navButtonDisabled : {}]}
              >
                ←
              </Button>
              <Text style={modalStyles.currentQuestionText}>{currentQuestion}</Text>
              <Button
                mode="outlined"
                onPress={() => setCurrentQuestion(Math.min(questionCount, currentQuestion + 1))}
                disabled={currentQuestion >= questionCount}
                style={[modalStyles.navButton, currentQuestion >= questionCount ? modalStyles.navButtonDisabled : {}]}
              >
                →
              </Button>
            </View>
          </View>

          {/* Current Question Answer */}
          <View style={modalStyles.section}>
            <Text style={modalStyles.sectionTitle}>Soru {currentQuestion} Cevabı</Text>
            <View style={modalStyles.answerRow}>
              {['A', 'B', 'C', 'D', 'E'].map((option) => (
                <Chip
                  key={option}
                  selected={getCurrentAnswer() === option}
                  onPress={() => handleAnswerChange(option)}
                  style={[modalStyles.answerChip, getCurrentAnswer() === option ? modalStyles.answerChipSelected : {}]}
                  mode="outlined"
                  textStyle={[modalStyles.answerChipText, getCurrentAnswer() === option ? modalStyles.answerChipTextSelected : {}]}
                >
                  {option}
                </Chip>
              ))}
            </View>
          </View>

          {/* Question Count Slider */}
          <View style={modalStyles.section}>
            <Text style={modalStyles.sectionTitle}>Toplam Soru Sayısı: {questionCount}</Text>
            <View style={modalStyles.sliderContainer}>
              <Button
                mode="outlined"
                onPress={() => {
                  const newCount = Math.max(1, questionCount - 1);
                  setQuestionCount(newCount);
                  if (currentQuestion > newCount) {
                    setCurrentQuestion(newCount);
                  }
                }}
                disabled={questionCount <= 1}
                style={[modalStyles.sliderButton, questionCount <= 1 ? modalStyles.sliderButtonDisabled : {}]}
              >
                -
              </Button>
              <Text style={modalStyles.questionCountText}>{questionCount}</Text>
              <Button
                mode="outlined"
                onPress={() => setQuestionCount(Math.min(40, questionCount + 1))}
                disabled={questionCount >= 40}
                style={[modalStyles.sliderButton, questionCount >= 40 ? modalStyles.sliderButtonDisabled : {}]}
              >
                +
              </Button>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={modalStyles.actionButtons}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={[modalStyles.actionButton, modalStyles.cancelButton]}
              disabled={loading}
              labelStyle={[modalStyles.actionButtonText, modalStyles.cancelButtonText]}
            >
              İptal
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={[modalStyles.actionButton, modalStyles.saveButton]}
              disabled={loading}
              loading={loading}
              labelStyle={[modalStyles.actionButtonText, modalStyles.saveButtonText]}
            >
              {examRecord?.id ? 'Güncelle' : 'Kaydet'}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
} 