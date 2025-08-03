import { StyleSheet } from 'react-native';

export const modalStyles = StyleSheet.create({
  // Header Styles
  header: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Section Styles
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },

  // Input Styles
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  // Chip Styles
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: 'white',
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
  },
  chipSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: 'white',
  },

  // Button Styles
  subjectButton: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  subjectButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },

  // Navigation Styles
  questionNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  navButton: {
    borderRadius: 20,
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  navButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  currentQuestionText: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
    color: '#FF6B35',
  },

  // Answer Styles
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 4,
  },
  answerChip: {
    backgroundColor: 'white',
    minWidth: 44,
    height: 44,
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  answerChipSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  answerChipText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  answerChipTextSelected: {
    color: 'white',
  },

  // Slider Styles
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sliderButton: {
    borderRadius: 18,
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sliderButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  questionCountText: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 36,
    textAlign: 'center',
    color: '#333',
  },

  // Action Button Styles
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    height: 44,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButtonText: {
    color: 'white',
  },
}); 