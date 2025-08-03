"""
YÖN App - Deneme Analizi Algoritması
Bu modül deneme analizi, zayıf konu tespiti ve roadmap oluşturma algoritmalarını içerir.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any
import math

class ExamAnalyzer:
    """Deneme analizi için ana sınıf"""
    
    def __init__(self):
        self.weights = {
            'accuracy': 0.6,      # Doğruluk oranı ağırlığı
            'omission': 0.2,      # Boş bırakma oranı ağırlığı  
            'error': 0.2          # Yanlış yapma oranı ağırlığı
        }
    
    def calculate_net(self, correct_count: int, wrong_count: int, total_questions: int) -> float:
        """
        Net hesaplama: doğru - (yanlış / 4)
        
        Args:
            correct_count: Doğru sayısı
            wrong_count: Yanlış sayısı
            total_questions: Toplam soru sayısı
            
        Returns:
            float: Hesaplanan net
        """
        return correct_count - (wrong_count / 4)
    
    def analyze_question_attempts(self, attempts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Soru cevaplarını analiz eder
        
        Args:
            attempts: Soru cevap listesi
                [
                    {
                        "question_id": "q1",
                        "topic": "Paragraf",
                        "subject": "TYT Türkçe", 
                        "user_answer": "A",
                        "correct_answer": "B",
                        "is_blank": False
                    },
                    ...
                ]
                
        Returns:
            Dict: Analiz sonuçları
        """
        # Genel istatistikler
        total_questions = len(attempts)
        correct_count = 0
        wrong_count = 0
        blank_count = 0
        
        # Konu bazlı istatistikler
        topic_stats = {}
        
        for attempt in attempts:
            # Boş kontrolü
            if attempt.get('is_blank', False) or not attempt.get('user_answer'):
                blank_count += 1
                status = 'blank'
            # Doğru/yanlış kontrolü
            elif attempt['user_answer'] == attempt['correct_answer']:
                correct_count += 1
                status = 'correct'
            else:
                wrong_count += 1
                status = 'wrong'
            
            # Konu bazlı istatistikleri güncelle
            topic = attempt['topic']
            if topic not in topic_stats:
                topic_stats[topic] = {
                    'total': 0,
                    'correct': 0,
                    'wrong': 0,
                    'blank': 0,
                    'subject': attempt['subject']
                }
            
            topic_stats[topic]['total'] += 1
            topic_stats[topic][status] += 1
        
        # Net hesapla
        net = self.calculate_net(correct_count, wrong_count, total_questions)
        
        # Konu bazlı performans hesapla
        topic_performance = self._calculate_topic_performance(topic_stats)
        
        # Zayıf konuları tespit et
        weak_topics = self._identify_weak_topics(topic_performance)
        
        return {
            'general_stats': {
                'total_questions': total_questions,
                'correct_count': correct_count,
                'wrong_count': wrong_count,
                'blank_count': blank_count,
                'net': net,
                'accuracy_rate': correct_count / total_questions if total_questions > 0 else 0,
                'wrong_rate': wrong_count / total_questions if total_questions > 0 else 0,
                'blank_rate': blank_count / total_questions if total_questions > 0 else 0
            },
            'topic_performance': topic_performance,
            'weak_topics': weak_topics
        }
    
    def _calculate_topic_performance(self, topic_stats: Dict[str, Dict]) -> Dict[str, Dict]:
        """
        Konu bazlı performans hesaplar
        
        Args:
            topic_stats: Konu istatistikleri
            
        Returns:
            Dict: Konu performansları
        """
        topic_performance = {}
        
        for topic, stats in topic_stats.items():
            total = stats['total']
            correct = stats['correct']
            wrong = stats['wrong']
            blank = stats['blank']
            
            # Oranları hesapla
            accuracy = correct / total if total > 0 else 0
            wrong_rate = wrong / total if total > 0 else 0
            blank_rate = blank / total if total > 0 else 0
            
            # Zayıflık skoru hesapla
            weakness_score = (
                self.weights['accuracy'] * (1 - accuracy) +
                self.weights['omission'] * blank_rate +
                self.weights['error'] * wrong_rate
            )
            
            topic_performance[topic] = {
                'subject': stats['subject'],
                'total_questions': total,
                'correct_count': correct,
                'wrong_count': wrong,
                'blank_count': blank,
                'accuracy_rate': accuracy,
                'wrong_rate': wrong_rate,
                'blank_rate': blank_rate,
                'weakness_score': weakness_score,
                'net': self.calculate_net(correct, wrong, total)
            }
        
        return topic_performance
    
    def _identify_weak_topics(self, topic_performance: Dict[str, Dict], top_n: int = 5) -> List[Dict]:
        """
        En zayıf konuları tespit eder
        
        Args:
            topic_performance: Konu performansları
            top_n: Kaç tane zayıf konu döndürüleceği
            
        Returns:
            List: Zayıf konular listesi (zayıflık skoruna göre sıralı)
        """
        # Zayıflık skoruna göre sırala
        sorted_topics = sorted(
            topic_performance.items(),
            key=lambda x: x[1]['weakness_score'],
            reverse=True
        )
        
        weak_topics = []
        for i, (topic_name, performance) in enumerate(sorted_topics[:top_n]):
            weak_topics.append({
                'rank': i + 1,
                'topic_name': topic_name,
                'subject': performance['subject'],
                'weakness_score': performance['weakness_score'],
                'accuracy_rate': performance['accuracy_rate'],
                'total_questions': performance['total_questions'],
                'net': performance['net']
            })
        
        return weak_topics
    
    def generate_roadmap(self, weak_topics: List[Dict], max_topics_per_week: int = 3) -> Dict[str, Any]:
        """
        Zayıf konulara göre çalışma planı oluşturur
        
        Args:
            weak_topics: Zayıf konular listesi
            max_topics_per_week: Haftada maksimum kaç konu çalışılacak
            
        Returns:
            Dict: Çalışma planı
        """
        roadmap = {
            'total_weeks': math.ceil(len(weak_topics) / max_topics_per_week),
            'topics_per_week': max_topics_per_week,
            'weekly_plans': []
        }
        
        # Haftalık planları oluştur
        for week in range(roadmap['total_weeks']):
            start_idx = week * max_topics_per_week
            end_idx = min(start_idx + max_topics_per_week, len(weak_topics))
            
            week_topics = weak_topics[start_idx:end_idx]
            
            weekly_plan = {
                'week_number': week + 1,
                'topics': week_topics,
                'focus_areas': [topic['subject'] for topic in week_topics],
                'estimated_study_hours': len(week_topics) * 5,  # Her konu için 5 saat
                'recommendations': self._generate_weekly_recommendations(week_topics)
            }
            
            roadmap['weekly_plans'].append(weekly_plan)
        
        return roadmap
    
    def _generate_weekly_recommendations(self, week_topics: List[Dict]) -> List[str]:
        """
        Haftalık öneriler oluşturur
        
        Args:
            week_topics: O hafta çalışılacak konular
            
        Returns:
            List: Öneriler listesi
        """
        recommendations = []
        
        for topic in week_topics:
            accuracy = topic['accuracy_rate']
            
            if accuracy < 0.3:
                recommendations.append(f"{topic['topic_name']}: Temel kavramları tekrar et, 20+ soru çöz")
            elif accuracy < 0.6:
                recommendations.append(f"{topic['topic_name']}: Konu tekrarı yap, 15+ soru çöz")
            else:
                recommendations.append(f"{topic['topic_name']}: Eksik noktaları tamamla, 10+ soru çöz")
        
        return recommendations
    
    def analyze_progress(self, previous_attempts: List[Dict], current_attempts: List[Dict]) -> Dict[str, Any]:
        """
        İlerleme analizi yapar
        
        Args:
            previous_attempts: Önceki deneme verileri
            current_attempts: Mevcut deneme verileri
            
        Returns:
            Dict: İlerleme analizi
        """
        # Önceki ve mevcut analizleri yap
        previous_analysis = self.analyze_question_attempts(previous_attempts)
        current_analysis = self.analyze_question_attempts(current_attempts)
        
        # Net değişimi
        net_change = current_analysis['general_stats']['net'] - previous_analysis['general_stats']['net']
        
        # Konu bazlı ilerleme
        progress_by_topic = {}
        
        for topic in current_analysis['topic_performance']:
            if topic in previous_analysis['topic_performance']:
                prev_net = previous_analysis['topic_performance'][topic]['net']
                curr_net = current_analysis['topic_performance'][topic]['net']
                net_improvement = curr_net - prev_net
                
                progress_by_topic[topic] = {
                    'net_improvement': net_improvement,
                    'improvement_percentage': (net_improvement / prev_net * 100) if prev_net > 0 else 0,
                    'status': 'improved' if net_improvement > 0 else 'declined' if net_improvement < 0 else 'stable'
                }
        
        return {
            'net_change': net_change,
            'overall_progress': 'improved' if net_change > 0 else 'declined' if net_change < 0 else 'stable',
            'progress_by_topic': progress_by_topic,
            'current_analysis': current_analysis,
            'previous_analysis': previous_analysis
        }

# Kullanım örneği
if __name__ == "__main__":
    analyzer = ExamAnalyzer()
    
    # Örnek veri
    sample_attempts = [
        {
            "question_id": "q1",
            "topic": "Paragraf",
            "subject": "TYT Türkçe",
            "user_answer": "A",
            "correct_answer": "B",
            "is_blank": False
        },
        {
            "question_id": "q2", 
            "topic": "Paragraf",
            "subject": "TYT Türkçe",
            "user_answer": "C",
            "correct_answer": "C",
            "is_blank": False
        },
        {
            "question_id": "q3",
            "topic": "Denklem Çözme",
            "subject": "TYT Matematik", 
            "user_answer": "",
            "correct_answer": "A",
            "is_blank": True
        }
    ]
    
    # Analiz yap
    result = analyzer.analyze_question_attempts(sample_attempts)
    print("Analiz Sonucu:", result)
    
    # Roadmap oluştur
    roadmap = analyzer.generate_roadmap(result['weak_topics'])
    print("Roadmap:", roadmap) 