import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ScrollView,
  Platform,
  FlatList,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  Portal,
  useTheme,
  Menu,
  Divider,
  ActivityIndicator,
  Surface,
  List,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '@/constants/PaperTheme';
import { getSubjects, getTopicsBySubject, quickSolutionsAPI } from '@/services/api';
import { QuickSolutionResultModal } from './QuickSolutionResultModal';

const { width, height } = Dimensions.get('window');

interface QuickQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: QuickQuestionData) => void;
}

export interface QuickQuestionData {
  subject: string;
  topic: string;
  imageUri?: string;
  userMessage: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export function QuickQuestionModal({ 
  visible, 
  onClose, 
  onSubmit 
}: QuickQuestionModalProps) {
  console.log('🎯 QuickQuestionModal render edildi, visible:', visible, 'Platform:', Platform.OS);
  const theme = useAppTheme();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subjectMenuVisible, setSubjectMenuVisible] = useState(false);
  const [topicMenuVisible, setTopicMenuVisible] = useState(false);

  // Konu seçimi için özel modal
  const [topicSelectionModalVisible, setTopicSelectionModalVisible] = useState(false);
  const [subjectSelectionModalVisible, setSubjectSelectionModalVisible] = useState(false);

  // Sonuç modal'ı için state
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [solutionId, setSolutionId] = useState<number | undefined>(undefined);

  // Firebase'den gelen veriler
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Dersleri yükle
  useEffect(() => {
    if (visible) {
      loadSubjects();
    }
  }, [visible]);

  // Ders seçildiğinde konuları yükle
  useEffect(() => {
    if (subject) {
      const selectedSubject = subjects.find(s => s.id === subject);
      if (selectedSubject) {
        loadTopics(selectedSubject.name);
      }
    } else {
      setTopics([]);
    }
  }, [subject, subjects]);

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await getSubjects();
      
      if (response.success && response.data) {
        console.log('✅ Dersler yüklendi:', response.data);
        setSubjects(response.data);
      } else {
        console.error('❌ Dersler yüklenemedi:', response.message);
      }
    } catch (error) {
      console.error('❌ Dersler yükleme hatası:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const loadTopics = async (subjectId: string) => {
    try {
      console.log('🎯 Konular yükleniyor, subjectId:', subjectId);
      setLoadingTopics(true);
      const response = await getTopicsBySubject(subjectId);
      
      console.log('🎯 Konular API response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Konular yüklendi:', response.data);
        setTopics(response.data);
      } else {
        console.error('❌ Konular yüklenemedi:', response.message);
        setTopics([]);
      }
    } catch (error) {
      console.error('❌ Konular yükleme hatası:', error);
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  // Seçili dersin adını al
  const getSelectedSubjectName = () => {
    if (!subjects || !Array.isArray(subjects)) return 'Ders Seçin';
    const selectedSubject = subjects.find(s => s.id === subject);
    return selectedSubject?.name || 'Ders Seçin';
  };

  // Seçili konunun adını al
  const getSelectedTopicName = () => {
    if (!topics || !Array.isArray(topics)) return 'Konu Seçin';
    const selectedTopic = topics.find(t => t.id === topic);
    return selectedTopic?.name || 'Konu Seçin';
  };

  // Konu seçimi modal'ını aç
  const openSubjectSelectionModal = () => {
    console.log('🎯 Ders seçimi modal açılıyor');
    console.log('🎯 Subjects state:', subjects);
    console.log('🎯 Subjects length:', subjects?.length);
    setSubjectSelectionModalVisible(true);
  };

  const openTopicSelectionModal = () => {
    if (!subject) {
      Alert.alert('Uyarı', 'Önce ders seçiniz');
      return;
    }
    console.log('🎯 Konu seçimi modal açılıyor');
    console.log('🎯 Seçili ders:', subject);
    console.log('🎯 Topics state:', topics);
    console.log('🎯 Topics length:', topics?.length);
    setTopicSelectionModalVisible(true);
  };

  // Konu seç
  const selectSubject = (selectedSubject: Subject) => {
    console.log('🎯 Ders seçildi:', selectedSubject.name);
    setSubject(selectedSubject.id);
    setSubjectSelectionModalVisible(false);
    // Ders değiştiğinde konu seçimini sıfırla
    setTopic('');
  };

  const selectTopic = (selectedTopic: Topic) => {
    console.log('🎯 Konu seçildi:', selectedTopic.name);
    setTopic(selectedTopic.id);
    setTopicSelectionModalVisible(false);
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
    }
  };

  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Kamera izni gereklidir.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Kamera kullanılırken bir hata oluştu.');
    }
  };

  const handleSubmit = async () => {
    // Sadece userMessage zorunlu, ders ve konu opsiyonel
    if (!userMessage.trim()) {
      Alert.alert('Uyarı', 'Lütfen sorunuzu yazın.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Uyarı', 'Lütfen soru fotoğrafını yükleyin.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Seçili ders ve konu adlarını al (opsiyonel)
      const selectedSubject = subjects && Array.isArray(subjects) ? subjects.find(s => s.id === subject) : null;
      const selectedTopic = topics && Array.isArray(topics) ? topics.find(t => t.id === topic) : null;
      
      // Fotoğrafı FormData'ya çevir
      const formData = new FormData();
      formData.append('konu', selectedTopic?.name || 'Belirtilmemiş');
      formData.append('ders', selectedSubject?.name || 'Belirtilmemiş');
      formData.append('mesaj', userMessage);
      
      // Fotoğrafı ekle
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'question.jpg',
      };
      formData.append('fotograf', imageFile as any);

      console.log('Gönderilen veri:', {
        konu: selectedTopic?.name || 'Belirtilmemiş',
        ders: selectedSubject?.name || 'Belirtilmemiş',
        mesaj: userMessage,
        imageUri
      });
      
      // Backend API'ye gönder
      const response = await quickSolutionsAPI.createQuickSolution({
        konu: selectedTopic?.name || 'Belirtilmemiş',
        ders: selectedSubject?.name || 'Belirtilmemiş',
        mesaj: userMessage,
        fotograf: imageFile as any,
      });

      if (response.success) {
        console.log('✅ Hızlı çözüm oluşturuldu:', response.data);
        console.log('🎯 Solution ID:', response.data.id);
        
        // Formu temizle
        setSubject('');
        setTopic('');
        setImageUri(null);
        setUserMessage('');
        
        onClose();
        
        // Sonuç modal'ını aç
        console.log('🎯 Result modal açılıyor...');
        setSolutionId(response.data.id);
        setResultModalVisible(true);
        console.log('✅ Result modal visible:', true);
        
        Alert.alert('Başarılı', 'Soru başarıyla gönderildi! Çözüm hazırlanıyor...');
      } else {
        console.error('❌ Hızlı çözüm hatası:', response.message);
        Alert.alert('Hata', response.message || 'Soru gönderilirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('❌ Hızlı çözüm hatası:', error);
      Alert.alert('Hata', 'Soru gönderilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Formu temizle
    setSubject('');
    setTopic('');
    setImageUri(null);
    setUserMessage('');
    onClose();
  };

  console.log('🔍 Modal render başlıyor, visible:', visible);
  
  return (
    <Portal>
      <Modal
        visible={visible}
        animationType={Platform.OS === 'web' ? 'slide' : 'fade'}
        transparent={true}
        onRequestClose={handleClose}
        statusBarTranslucent={Platform.OS === 'android'}
        onShow={() => console.log('✅ Modal gösterildi!')}
        onDismiss={() => console.log('❌ Modal kapatıldı!')}
      >
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                Hızlı Soru Çözüm
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={Platform.OS === 'web' ? undefined : { flexGrow: 1, paddingBottom: 10 }}
            >
              {/* Ders Seçimi */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.colors.primary }]}>
                  Ders
                </Text>
                {loadingSubjects ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <TouchableOpacity
                    style={[styles.dropdownButton, { borderColor: theme.colors.outline }]}
                    onPress={openSubjectSelectionModal}
                  >
                    <Text style={[styles.dropdownText, { color: subject ? theme.colors.onSurface : theme.colors.onSurfaceVariant }]}>
                      {getSelectedSubjectName()}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Konu Seçimi */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.colors.primary }]}>
                  Konu
                </Text>
                {loadingTopics ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  Platform.OS === 'web' ? (
                    <Menu
                      visible={topicMenuVisible}
                      onDismiss={() => setTopicMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          style={[
                            styles.dropdownButton, 
                            { 
                              borderColor: theme.colors.outline,
                              opacity: subject ? 1 : 0.5 
                            }
                          ]}
                          onPress={() => subject && setTopicMenuVisible(true)}
                          disabled={!subject}
                        >
                          <Text style={[styles.dropdownText, { color: topic ? theme.colors.onSurface : theme.colors.onSurfaceVariant }]}>
                            {getSelectedTopicName()}
                          </Text>
                          <Ionicons name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
                        </TouchableOpacity>
                      }
                    >
                      {subject && topics && Array.isArray(topics) && topics.map((top) => {
                        console.log('🎯 Topic Menu Item render ediliyor:', top.name);
                        return (
                          <Menu.Item
                            key={top.id}
                            onPress={() => {
                              console.log('🎯 Konu seçildi:', top.name);
                              setTopic(top.id);
                              setTopicMenuVisible(false);
                            }}
                            title={top.name}
                            titleStyle={styles.menuItemText}
                          />
                        );
                      })}
                    </Menu>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.dropdownButton, 
                        { 
                          borderColor: theme.colors.outline,
                          opacity: subject ? 1 : 0.5 
                        }
                      ]}
                      onPress={openTopicSelectionModal}
                      disabled={!subject}
                    >
                      <Text style={[styles.dropdownText, { color: topic ? theme.colors.onSurface : theme.colors.onSurfaceVariant }]}>
                        {getSelectedTopicName()}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  )
                )}
              </View>

              {/* Resim Alanı */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.colors.primary }]}>
                  Soru Resmi
                </Text>
                <View style={styles.imageContainer}>
                  {imageUri ? (
                    <View style={styles.imageWrapper}>
                      <Image source={{ uri: imageUri }} style={styles.image} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setImageUri(null)}
                      >
                        <Ionicons name="close-circle" size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <View style={styles.defaultImageContainer}>
                        <Ionicons name="image-outline" size={48} color="#ccc" />
                        <Text style={styles.defaultImageText}>Soru resmini buraya yükleyin</Text>
                      </View>
                      <View style={styles.imageButtons}>
                        <TouchableOpacity
                          style={[styles.imageButton, { backgroundColor: theme.colors.primary }]}
                          onPress={handleCameraCapture}
                        >
                          <Ionicons name="camera" size={24} color="white" />
                          <Text style={styles.imageButtonText}>Kamera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.imageButton, { backgroundColor: theme.colors.secondary }]}
                          onPress={handleImagePick}
                        >
                          <Ionicons name="images" size={24} color="white" />
                          <Text style={styles.imageButtonText}>Galeri</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Kullanıcı Mesajı */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.colors.primary }]}>
                  Kullanıcı Mesajı
                </Text>
                <TextInput
                  mode="outlined"
                  value={userMessage}
                  onChangeText={setUserMessage}
                  placeholder="Sorunuzu buraya yazın..."
                  multiline
                  numberOfLines={4}
                  style={styles.textInput}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Button
                mode="outlined"
                onPress={handleClose}
                style={styles.cancelButton}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading || !subject || !topic || !userMessage}
                style={styles.submitButton}
                buttonColor={theme.colors.primary}
              >
                {isLoading ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            </View>
          </View>
        </View>

                 {/* Konu Seçimi Modal */}
         <Modal
           visible={topicSelectionModalVisible}
           animationType="slide"
           transparent={true}
           onRequestClose={() => setTopicSelectionModalVisible(false)}
           onShow={() => {
             console.log('🎯 Topic modal açıldı');
             console.log('🎯 Topics state:', topics);
             console.log('🎯 Topics length:', topics?.length);
           }}
         >
           <View style={styles.overlay}>
             <View style={[styles.topicModalContainer, { backgroundColor: theme.colors.surface }]}>
               <View style={styles.topicModalHeader}>
                 <Text style={[styles.topicModalTitle, { color: theme.colors.onSurface }]}>
                   Konu Seçin
                 </Text>
                 <TouchableOpacity onPress={() => setTopicSelectionModalVisible(false)} style={styles.closeButton}>
                   <Ionicons name="close" size={24} color={theme.colors.onSurface} />
                 </TouchableOpacity>
               </View>
               <View style={styles.topicModalContent}>
                 {loadingTopics ? (
                   <View style={{ padding: 20, alignItems: 'center' }}>
                     <ActivityIndicator size="large" color={theme.colors.primary} />
                     <Text style={{ marginTop: 10, color: theme.colors.onSurfaceVariant }}>
                       Konular yükleniyor...
                     </Text>
                   </View>
                 ) : (
                   <ScrollView 
                     style={{ flex: 1 }}
                     showsVerticalScrollIndicator={true}
                     contentContainerStyle={{ paddingBottom: 20 }}
                   >
                     <View style={{ padding: 16, backgroundColor: theme.colors.surfaceVariant }}>
                       <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                         {topics.length} konu bulundu
                       </Text>
                     </View>
                     {topics.length > 0 ? (
                       topics.map((item) => {
                         console.log('🎯 Topic item render ediliyor:', item.name);
                         return (
                           <TouchableOpacity
                             key={item.id}
                             style={styles.topicListItem}
                             onPress={() => selectTopic(item)}
                             activeOpacity={0.7}
                           >
                             <Text style={[styles.topicListItemText, { color: theme.colors.onSurface }]}>
                               {item.name}
                             </Text>
                           </TouchableOpacity>
                         );
                       })
                     ) : (
                       <View style={{ padding: 20, alignItems: 'center' }}>
                         <Text style={{ color: theme.colors.onSurfaceVariant }}>
                           Konu bulunamadı
                         </Text>
                       </View>
                     )}
                   </ScrollView>
                 )}
               </View>
             </View>
           </View>
         </Modal>

         {/* Ders Seçimi Modal */}
         <Modal
           visible={subjectSelectionModalVisible}
           animationType="slide"
           transparent={true}
           onRequestClose={() => setSubjectSelectionModalVisible(false)}
           onShow={() => {
             console.log('🎯 Subject modal açıldı');
             console.log('🎯 Subjects state:', subjects);
             console.log('🎯 Subjects length:', subjects?.length);
           }}
         >
           <View style={styles.overlay}>
             <View style={[styles.topicModalContainer, { backgroundColor: theme.colors.surface }]}>
               <View style={styles.topicModalHeader}>
                 <Text style={[styles.topicModalTitle, { color: theme.colors.onSurface }]}>Ders Seçin</Text>
                 <TouchableOpacity onPress={() => setSubjectSelectionModalVisible(false)} style={styles.closeButton}>
                   <Ionicons name="close" size={24} color={theme.colors.onSurface} />
                 </TouchableOpacity>
               </View>
               <View style={styles.topicModalContent}>
                 {loadingSubjects ? (
                   <View style={{ padding: 20, alignItems: 'center' }}>
                     <ActivityIndicator size="large" color={theme.colors.primary} />
                     <Text style={{ marginTop: 10, color: theme.colors.onSurfaceVariant }}>Dersler yükleniyor...</Text>
                   </View>
                 ) : (
                   <ScrollView 
                     style={{ flex: 1 }}
                     showsVerticalScrollIndicator={true}
                     contentContainerStyle={{ paddingBottom: 20 }}
                   >
                     <View style={{ padding: 16, backgroundColor: theme.colors.surfaceVariant }}>
                       <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                         {subjects?.length || 0} ders bulundu
                       </Text>
                     </View>
                     {subjects && subjects.length > 0 ? (
                       subjects.map((item) => {
                         console.log('🎯 Subject item render ediliyor:', item.name);
                         return (
                           <TouchableOpacity
                             key={item.id}
                             style={styles.topicListItem}
                             onPress={() => selectSubject(item)}
                             activeOpacity={0.7}
                           >
                             <Text style={[styles.topicListItemText, { color: theme.colors.onSurface }]}>
                               {item.name}
                             </Text>
                           </TouchableOpacity>
                         );
                       })
                     ) : (
                       <View style={{ padding: 20, alignItems: 'center' }}>
                         <Text style={{ color: theme.colors.onSurfaceVariant }}>
                           Ders bulunamadı
                         </Text>
                       </View>
                     )}
                   </ScrollView>
                 )}
               </View>
             </View>
           </View>
         </Modal>

         {/* Hızlı Çözüm Sonuç Modal */}
         <QuickSolutionResultModal
           visible={resultModalVisible}
           onClose={() => {
             console.log('🎯 Result modal kapatılıyor');
             setResultModalVisible(false);
             setSolutionId(undefined);
           }}
           solutionId={solutionId}
         />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: Platform.OS === 'web' ? 1000 : 9999,
    elevation: Platform.OS === 'android' ? 9999 : undefined,
  },
  modalContainer: {
    width: Platform.OS === 'web' ? 500 : width * 0.95,
    maxHeight: Platform.OS === 'web' ? height * 0.85 : height * 0.95,
    minHeight: Platform.OS === 'web' ? undefined : 450,
    borderRadius: 20,
    padding: Platform.OS === 'web' ? 24 : 20,
    elevation: Platform.OS === 'android' ? 10000 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    zIndex: Platform.OS === 'web' ? 1001 : 10000,
    // Mobilde flex layout için gerekli
    flexDirection: Platform.OS === 'web' ? undefined : 'column',
    justifyContent: Platform.OS === 'web' ? undefined : 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 24 : 16,
    paddingBottom: Platform.OS === 'web' ? 18 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontFamily: 'Poppins_600SemiBold',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    // Mobilde ScrollView'ın düzgün çalışması için
    minHeight: Platform.OS === 'web' ? undefined : 0,
  },
  section: {
    marginBottom: Platform.OS === 'web' ? 24 : 16,
  },
  label: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: Platform.OS === 'web' ? 12 : 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 5,
  },
  chipText: {
    fontFamily: 'Poppins_400Regular',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
    paddingVertical: Platform.OS === 'web' ? 16 : 12,
    backgroundColor: '#f8f9fa',
    minHeight: Platform.OS === 'web' ? 56 : 48,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dropdownText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: Platform.OS === 'web' ? 18 : 16,
  },
  menuItemText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: '#333',
  },
  imageContainer: {
    minHeight: 120,
    marginBottom: 10,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: Platform.OS === 'web' ? 250 : 180,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  imagePlaceholder: {
    height: Platform.OS === 'web' ? 250 : 180,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
  },
  defaultImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  defaultImageText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#999',
    marginTop: Platform.OS === 'web' ? 12 : 8,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: Platform.OS === 'web' ? 20 : 15,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 20 : 15,
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    borderRadius: 8,
    gap: Platform.OS === 'web' ? 8 : 5,
  },
  imageButtonText: {
    color: 'white',
    fontFamily: 'Poppins_500Medium',
    fontSize: Platform.OS === 'web' ? 16 : 14,
  },
  textInput: {
    fontFamily: 'Poppins_400Regular',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Platform.OS === 'web' ? 20 : 15,
    marginTop: Platform.OS === 'web' ? 15 : 10,
    paddingTop: Platform.OS === 'web' ? 18 : 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    // Mobilde footer'ın sabit kalması için
    position: Platform.OS === 'web' ? undefined : 'relative',
    bottom: Platform.OS === 'web' ? undefined : 0,
    backgroundColor: Platform.OS === 'web' ? undefined : 'transparent',
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  // Konu seçimi modal stilleri
  topicModalContainer: {
    width: Platform.OS === 'web' ? 600 : width * 0.95,
    height: Platform.OS === 'web' ? height * 0.8 : height * 0.9,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  topicModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  topicModalTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  topicModalContent: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: 'white',
  },
  topicListItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
    minHeight: 50,
  },
  topicListItemText: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
  },
}); 