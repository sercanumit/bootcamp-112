import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  IconButton,
  Button,
  Searchbar,
  FAB,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/PaperTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Flashcard {
  id: string;
  subject: string;
  topic: string;
  title: string;
  content: string;
  importance: 'low' | 'medium' | 'high';
  type: 'flashcard' | 'test' | 'tag';
  createdAt: string;
  isBookmarked: boolean;
}

const mockFlashcards: Flashcard[] = [
  {
    id: '1',
    subject: 'MATEMATİK',
    topic: 'Trigonometri',
    title: 'Temel Trigonometrik Özdeşlikler',
    content: 'sin²x + cos²x = 1\n1 + tan²x = sec²x\n1 + cot²x = csc²x',
    importance: 'high',
    type: 'flashcard',
    createdAt: '2025-07-28',
    isBookmarked: true,
  },
  {
    id: '2',
    subject: 'FİZİK',
    topic: 'Elektrik ve Manyetizma',
    title: 'Elektrik Alan Formülleri',
    content: 'E = F/q\nE = kQ/r²\nE = V/d (paralel levhalar)',
    importance: 'medium',
    type: 'test',
    createdAt: '2025-07-27',
    isBookmarked: false,
  },
  {
    id: '3',
    subject: 'KİMYA',
    topic: 'Organik Kimya',
    title: 'Alkollerin Oksidasyonu',
    content: 'Birincil alkol → Aldehit → Karboksilik asit\nİkincil alkol → Keton',
    importance: 'low',
    type: 'tag',
    createdAt: '2025-07-26',
    isBookmarked: true,
  },
  {
    id: '4',
    subject: 'MATEMATİK',
    topic: 'Limit ve Süreklilik',
    title: 'Limit Hesaplama Yöntemleri',
    content: 'L\'Hôpital Kuralı\nFaktöriyel\nTrigonometrik limitler',
    importance: 'high',
    type: 'flashcard',
    createdAt: '2025-07-25',
    isBookmarked: false,
  },
  {
    id: '5',
    subject: 'FİZİK',
    topic: 'Mekanik',
    title: 'Newton\'un Hareket Kanunları',
    content: '1. Kanun: Eylemsizlik\n2. Kanun: F = ma\n3. Kanun: Etki-Tepki',
    importance: 'high',
    type: 'test',
    createdAt: '2025-07-24',
    isBookmarked: true,
  },
  {
    id: '6',
    subject: 'BİYOLOJİ',
    topic: 'Hücre Bilimi',
    title: 'Hücre Organelleri',
    content: 'Mitokondri: Enerji üretimi\nKloroplast: Fotosentez\nGolgi: Paketleme',
    importance: 'medium',
    type: 'flashcard',
    createdAt: '2025-07-23',
    isBookmarked: false,
  },
  {
    id: '7',
    subject: 'KİMYA',
    topic: 'Analitik Kimya',
    title: 'pH ve pOH Hesaplamaları',
    content: 'pH = -log[H⁺]\npOH = -log[OH⁻]\npH + pOH = 14',
    importance: 'medium',
    type: 'tag',
    createdAt: '2025-07-22',
    isBookmarked: true,
  },
  {
    id: '8',
    subject: 'MATEMATİK',
    topic: 'Türev',
    title: 'Temel Türev Kuralları',
    content: 'Sabit: d/dx(c) = 0\nKuvvet: d/dx(xⁿ) = nxⁿ⁻¹\nÇarpım: (uv)\' = u\'v + uv\'',
    importance: 'high',
    type: 'flashcard',
    createdAt: '2025-07-21',
    isBookmarked: true,
  },
  {
    id: '9',
    subject: 'FİZİK',
    topic: 'Optik',
    title: 'Mercek Formülleri',
    content: '1/f = 1/u + 1/v\nBüyütme = v/u\nOdak uzaklığı hesaplama',
    importance: 'low',
    type: 'test',
    createdAt: '2025-07-20',
    isBookmarked: false,
  },
  {
    id: '10',
    subject: 'TÜRKÇE',
    topic: 'Dil Bilgisi',
    title: 'Fiil Çekimleri',
    content: 'Şimdiki zaman: -iyor\nGeçmiş zaman: -di\nGelecek zaman: -ecek',
    importance: 'medium',
    type: 'flashcard',
    createdAt: '2025-07-19',
    isBookmarked: true,
  },
  {
    id: '11',
    subject: 'TARİH',
    topic: 'Osmanlı Tarihi',
    title: 'Osmanlı Padişahları',
    content: 'Osman Bey (1299-1326)\nOrhan Bey (1326-1362)\nI. Murat (1362-1389)',
    importance: 'low',
    type: 'tag',
    createdAt: '2025-07-18',
    isBookmarked: false,
  },
  {
    id: '12',
    subject: 'MATEMATİK',
    topic: 'İntegral',
    title: 'Belirsiz İntegral Kuralları',
    content: '∫xⁿdx = xⁿ⁺¹/(n+1) + C\n∫1/x dx = ln|x| + C\n∫eˣdx = eˣ + C',
    importance: 'high',
    type: 'test',
    createdAt: '2025-07-17',
    isBookmarked: true,
  },
  {
    id: '13',
    subject: 'FİZİK',
    topic: 'Termodinamik',
    title: 'Termodinamik Kanunları',
    content: '1. Kanun: Enerji korunumu\n2. Kanun: Entropi artışı\n3. Kanun: Mutlak sıfır',
    importance: 'medium',
    type: 'flashcard',
    createdAt: '2025-07-16',
    isBookmarked: false,
  },
  {
    id: '14',
    subject: 'KİMYA',
    topic: 'Kimyasal Bağlar',
    title: 'Bağ Türleri',
    content: 'İyonik bağ: Metal + Ametal\nKovalent bağ: Ametal + Ametal\nHidrojen bağı: H + F,O,N',
    importance: 'high',
    type: 'tag',
    createdAt: '2025-07-15',
    isBookmarked: true,
  },
  {
    id: '15',
    subject: 'BİYOLOJİ',
    topic: 'Genetik',
    title: 'Mendel Genetiği',
    content: 'Dominant gen: Büyük harf (A)\nResesif gen: Küçük harf (a)\nHeterozigot: Aa',
    importance: 'medium',
    type: 'flashcard',
    createdAt: '2025-07-14',
    isBookmarked: false,
  },
];

const subjects = ['Tümü', 'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Tarih'];
const types = ['Tümü', 'Flashcard', 'Test', 'Etiket'];
const importanceLevels = ['Tümü', 'Düşük', 'Orta', 'Yüksek'];

export default function QuestionBoxScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [selectedSubject, setSelectedSubject] = useState('Tümü');
  const [selectedType, setSelectedType] = useState('Tümü');
  const [selectedImportance, setSelectedImportance] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(mockFlashcards);

  const handleRefresh = () => {
    setRefreshing(true);
    // TODO: API'den veri çek
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return theme.colors.primary;
    }
  };

  const getImportanceText = (importance: string) => {
    switch (importance) {
      case 'low': return 'Düşük';
      case 'medium': return 'Orta';
      case 'high': return 'Yüksek';
      default: return 'Bilinmiyor';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flashcard': return 'card-outline';
      case 'test': return 'document-text-outline';
      case 'tag': return 'pricetag-outline';
      default: return 'help-circle';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flashcard': return '#2196F3';
      case 'test': return '#9C27B0';
      case 'tag': return '#FF9800';
      default: return theme.colors.primary;
    }
  };

  const filteredFlashcards = flashcards.filter(q => {
    const matchesSubject = selectedSubject === 'Tümü' || q.subject.toLowerCase().includes(selectedSubject.toLowerCase());
    const matchesType = selectedType === 'Tümü' || q.type === selectedType.toLowerCase();
    const matchesImportance = selectedImportance === 'Tümü' || q.importance === selectedImportance.toLowerCase();
    const matchesSearch = searchQuery === '' || 
                         q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesType && matchesImportance && matchesSearch;
  });

  const renderFlashcardCard = (flashcard: Flashcard) => (
    <Card key={flashcard.id} style={styles.questionCard}>
          <Card.Content style={styles.cardContent}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.subjectSection}>
            <Text style={[styles.subjectText, { color: theme.colors.primary }]}>
              {flashcard.subject}
            </Text>
            <Chip
              mode="outlined"
              style={[styles.importanceChip, { borderColor: getImportanceColor(flashcard.importance) }]}
              textStyle={[styles.chipText, { color: getImportanceColor(flashcard.importance) }]}
            >
              {getImportanceText(flashcard.importance)}
            </Chip>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon={flashcard.isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              onPress={() => {/* TODO: Toggle bookmark */}}
              iconColor={flashcard.isBookmarked ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            <IconButton
              icon="more-vert"
              size={20}
              onPress={() => {/* TODO: Show options */}}
              iconColor={theme.colors.onSurfaceVariant}
            />
          </View>
        </View>

        {/* Topic */}
        <Text style={[styles.topicText, { color: theme.colors.onSurface }]}>
          {flashcard.topic}
        </Text>

        {/* Title */}
        <Text style={[styles.titleText, { color: theme.colors.onSurface }]}>
          {flashcard.title}
        </Text>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={[styles.contentText, { color: theme.colors.onSurfaceVariant }]} numberOfLines={4}>
            {flashcard.content}
            </Text>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.typeIndicator}>
            <Ionicons 
              name={getTypeIcon(flashcard.type)} 
              size={16} 
              color={getTypeColor(flashcard.type)} 
            />
            <Text style={[styles.typeText, { color: getTypeColor(flashcard.type) }]}>
              {flashcard.type === 'flashcard' ? 'Flashcard' : 
               flashcard.type === 'test' ? 'Test' : 'Etiket'}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
            {flashcard.createdAt}
            </Text>
        </View>
          </Card.Content>
        </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Flashcard başlığı veya içerik ara..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={theme.colors.primary}
          />
        </View>

        {/* Subject Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject}
              style={[
                styles.filterChip,
                selectedSubject === subject && styles.selectedFilterChip,
                { borderColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedSubject(subject)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedSubject === subject && styles.selectedFilterText,
                  { color: selectedSubject === subject ? 'white' : theme.colors.primary }
                ]}
              >
                {subject}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Type Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.typeFilterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {types.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeFilterChip,
                selectedType === type && styles.selectedTypeFilterChip,
                { borderColor: getTypeColor(type.toLowerCase()) }
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Ionicons
                name={getTypeIcon(type.toLowerCase()) as any}
                size={16}
                color={selectedType === type ? 'white' : getTypeColor(type.toLowerCase())}
                style={styles.typeIcon}
              />
              <Text
                style={[
                  styles.typeFilterText,
                  selectedType === type && styles.selectedTypeFilterText,
                  { color: selectedType === type ? 'white' : getTypeColor(type.toLowerCase()) }
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Importance Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.importanceFilterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {importanceLevels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.importanceFilterChip,
                selectedImportance === level && styles.selectedImportanceFilterChip,
                { borderColor: getImportanceColor(level.toLowerCase()) }
              ]}
              onPress={() => setSelectedImportance(level)}
            >
              <Ionicons
                name="star-outline"
                size={16}
                color={selectedImportance === level ? 'white' : getImportanceColor(level.toLowerCase())}
                style={styles.typeIcon}
              />
              <Text
                style={[
                  styles.importanceFilterText,
                  selectedImportance === level && styles.selectedImportanceFilterText,
                  { color: selectedImportance === level ? 'white' : getImportanceColor(level.toLowerCase()) }
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Questions */}
        <View style={styles.questionsContainer}>
          {filteredFlashcards.length > 0 ? (
            filteredFlashcards.map(renderFlashcardCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="card-outline" size={64} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                Flashcard bulunamadı
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Filtreleri değiştirerek daha fazla flashcard görebilirsin
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {/* TODO: Add new question */}}
      />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    borderRadius: 12,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  typeFilterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  importanceFilterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  selectedFilterChip: {
    backgroundColor: '#6200EA',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  selectedFilterText: {
    color: 'white',
  },
  typeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  selectedTypeFilterChip: {
    backgroundColor: '#6200EA',
  },
  typeIcon: {
    marginRight: 4,
  },
  typeFilterText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  selectedTypeFilterText: {
    color: 'white',
  },
  importanceFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  selectedImportanceFilterChip: {
    backgroundColor: '#6200EA',
  },
  importanceFilterText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  selectedImportanceFilterText: {
    color: 'white',
  },
  questionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  questionCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subjectSection: {
    flex: 1,
  },
  subjectText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  importanceChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  chipText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
  },
  headerActions: {
    flexDirection: 'row',
  },
  topicText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  contentContainer: {
    marginBottom: 12,
  },
  contentText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
