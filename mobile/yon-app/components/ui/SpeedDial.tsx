import { StyleSheet } from "react-native";
import { FAB, useTheme } from "react-native-paper";
import { useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { QuickQuestionModal, QuickQuestionData } from "./QuickQuestionModal";
import { ExamRecordModal } from "../exam/ExamRecordModal";

interface SpeedDialAction {
  icon: string;
  label: string;
  onPress: () => void;
}

interface SpeedDialProps {
  style?: any;
}

export function SpeedDial({ style }: SpeedDialProps) {
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [quickQuestionModalVisible, setQuickQuestionModalVisible] = useState(false);
  const [examRecordModalVisible, setExamRecordModalVisible] = useState(false);

  const theme = useTheme();
  const colorScheme = useColorScheme();

  const fabBackgroundColor =
    colorScheme === "light" ? theme.colors.primary : theme.colors.primary;

  const actions: SpeedDialAction[] = [
    {
      icon: "plus-circle",
      label: "Yeni Soru Ekle",
      onPress: () => {
        console.log("Yeni soru ekleme sayfası");
      },
    },
    {
      icon: "refresh-circle",
      label: "Hızlı Tekrar",
      onPress: () => {
        console.log("Hızlı tekrar sayfası");
      },
    },
    {
      icon: "lightning-bolt-circle",
      label: "Hızlı Soru Çözüm",
      onPress: () => {
        console.log('🚀 Hızlı Soru Çözüm butonuna basıldı!');
        setQuickQuestionModalVisible(true);
        console.log('✅ QuickQuestionModal visible:', true);
      },
    },
    {
      icon: "file-document",
      label: "Deneme Kayıt",
      onPress: () => {
        console.log('📝 Deneme Kayıt butonuna basıldı!');
        setExamRecordModalVisible(true);
      },
    },

  ];

  const wrappedActions = actions.map((action) => ({
    ...action,
    onPress: () => {
      action.onPress();
      setSpeedDialOpen(false);
    },
  }));

  const handleQuickQuestionSubmit = async (data: QuickQuestionData) => {
    // TODO: Firebase'e gönder ve OCR işlemi başlat
    console.log('Hızlı soru çözüm verisi:', data);
    
    // Burada Firebase Vision AI ile OCR işlemi yapılacak
    // Sonra Gemini AI ile analiz edilecek
    // Sonuç kullanıcıya gösterilecek
  };



  return (
    <>
    <FAB.Group
      open={speedDialOpen}
      visible
      icon={speedDialOpen ? "close" : "plus"}
      actions={wrappedActions}
      onStateChange={({ open }) => setSpeedDialOpen(open)}
      style={[styles.speedDial, style]}
      fabStyle={[styles.speedDialFab, { backgroundColor: fabBackgroundColor }]}
      color="white"
    />
      
      <QuickQuestionModal
        visible={quickQuestionModalVisible}
        onClose={() => {
          console.log('🚪 Modal kapatılıyor');
          setQuickQuestionModalVisible(false);
        }}
        onSubmit={handleQuickQuestionSubmit}
      />

      <ExamRecordModal
        visible={examRecordModalVisible}
        onDismiss={() => {
          console.log('🚪 Deneme Kayıt Modal kapatılıyor');
          setExamRecordModalVisible(false);
        }}
        onSuccess={() => {
          console.log('✅ Deneme kaydı başarılı!');
          setExamRecordModalVisible(false);
        }}
      />

    </>
  );
}

const styles = StyleSheet.create({
  speedDial: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 50, // Tabbar'ın üstünde olacak (safe area ile uyumlu)
  },
  speedDialFab: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 40,
  },
});
