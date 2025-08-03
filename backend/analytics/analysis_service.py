"""
YÖN App - Kapsamlı Analiz Servisi
Bu modül tüm analiz işlemlerini yönetir.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from django.db.models import Q, Avg, Count, Sum, F
from django.utils import timezone
import math

from users.models import User
from exams.models import ExamRecord, Subject, Topic
from tasks.models import DailyTask
from coaching.models import UserProgress, SubjectPerformance, UserExamAttempt
from fiverbase.firebase_service import FirebaseDataService


class ComprehensiveAnalyzer:
    """Kapsamlı analiz servisi"""
    
    def __init__(self, user: User):
        self.user = user
        self.firebase_service = FirebaseDataService()
        self.weights = {
            'accuracy': 0.4,      # Doğruluk oranı
            'consistency': 0.3,   # Tutarlılık
            'progress': 0.2,      # İlerleme
            'effort': 0.1         # Çaba
        }
    
    def get_comprehensive_analysis(self) -> Dict[str, Any]:
        """Kapsamlı analiz raporu"""
        return {
            'exam_analysis': self.analyze_exam_performance(),
            'task_analysis': self.analyze_task_completion(),
            'study_analysis': self.analyze_study_patterns(),
            'topic_analysis': self.analyze_topic_performance(),
            'recommendations': self.generate_recommendations(),
            'progress_summary': self.get_progress_summary()
        }
    
    def analyze_exam_performance(self) -> Dict[str, Any]:
        """Deneme performans analizi - Firebase'den veri çeker"""
        # Firebase'den deneme kayıtlarını al
        firebase_exam_records = self.firebase_service.get_user_exam_records(self.user.firebase_uid)
        
        if not firebase_exam_records:
            # Default değerler döndür
            return {
                'total_exams': 0,
                'average_net': 0.0,
                'best_exam': {
                    'exam_name': 'Henüz deneme yok',
                    'total_net': 0.0,
                    'exam_date': None
                },
                'worst_exam': {
                    'exam_name': 'Henüz deneme yok',
                    'total_net': 0.0,
                    'exam_date': None
                },
                'best_subject': None,
                'worst_subject': None,
                'recent_performance': [],
                'subject_performance': {}
            }
        
        # Genel istatistikler
        total_exams = len(firebase_exam_records)
        total_net = sum(record.get('total_net', 0) for record in firebase_exam_records)
        average_net = total_net / total_exams if total_exams > 0 else 0
        
        # En iyi ve en kötü denemeleri bul
        sorted_exams = sorted(firebase_exam_records, key=lambda x: x.get('total_net', 0), reverse=True)
        best_exam = sorted_exams[0] if sorted_exams else None
        worst_exam = sorted_exams[-1] if sorted_exams else None
        
        # Ders bazlı analiz
        subject_performance = {}
        for record in firebase_exam_records:
            subject_name = record.get('subject_name', 'Bilinmeyen Ders')
            net_score = record.get('total_net', 0)
            
            if subject_name not in subject_performance:
                subject_performance[subject_name] = {
                    'total_exams': 0,
                    'total_net': 0,
                    'best_net': 0,
                    'worst_net': float('inf')
                }
            
            subject_performance[subject_name]['total_exams'] += 1
            subject_performance[subject_name]['total_net'] += net_score
            
            if net_score > subject_performance[subject_name]['best_net']:
                subject_performance[subject_name]['best_net'] = net_score
            
            if net_score < subject_performance[subject_name]['worst_net']:
                subject_performance[subject_name]['worst_net'] = net_score
        
        # En iyi/kötü dersleri bul
        best_subject = None
        worst_subject = None
        best_avg = 0
        worst_avg = float('inf')
        
        for subject, stats in subject_performance.items():
            avg_net = stats['total_net'] / stats['total_exams']
            if avg_net > best_avg:
                best_avg = avg_net
                best_subject = subject
            if avg_net < worst_avg:
                worst_avg = avg_net
                worst_subject = subject
        
        # Son 5 deneme trendi
        recent_exams = []
        for exam in sorted_exams[:5]:
            recent_exams.append({
                'exam_name': exam.get('exam_name', 'Bilinmeyen Deneme'),
                'total_net': float(exam.get('total_net', 0)),
                'exam_date': exam.get('exam_date', 'Bilinmeyen Tarih')
            })
        
        return {
            'total_exams': total_exams,
            'average_net': round(average_net, 2),
            'best_exam': {
                'exam_name': best_exam.get('exam_name', 'Bilinmeyen Deneme') if best_exam else 'Bilinmeyen Deneme',
                'total_net': float(best_exam.get('total_net', 0)) if best_exam else 0.0,
                'exam_date': best_exam.get('exam_date', 'Bilinmeyen Tarih') if best_exam else None
            },
            'worst_exam': {
                'exam_name': worst_exam.get('exam_name', 'Bilinmeyen Deneme') if worst_exam else 'Bilinmeyen Deneme',
                'total_net': float(worst_exam.get('total_net', 0)) if worst_exam else 0.0,
                'exam_date': worst_exam.get('exam_date', 'Bilinmeyen Tarih') if worst_exam else None
            },
            'best_subject': best_subject,
            'worst_subject': worst_subject,
            'recent_performance': recent_exams,
            'subject_performance': subject_performance
        }
    
    def analyze_task_completion(self) -> Dict[str, Any]:
        """Görev tamamlama analizi - Firebase'den veri çeker"""
        # Firebase'den görevleri al
        firebase_tasks = self.firebase_service.get_user_tasks(self.user.firebase_uid)
        
        if not firebase_tasks:
            # Default değerler döndür
            return {
                'total_tasks': 0,
                'completed_tasks': 0,
                'completion_rate': 0.0,
                'weekly_completion_rate': 0.0,
                'task_types': {}
            }
        
        total_tasks = len(firebase_tasks)
        completed_tasks = len([task for task in firebase_tasks if task.get('is_completed', False)])
        completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
        
        # Görev türü bazlı analiz
        task_types = {}
        for task in firebase_tasks:
            task_type = task.get('task_type', 'unknown')
            if task_type not in task_types:
                task_types[task_type] = {'total': 0, 'completed': 0}
            
            task_types[task_type]['total'] += 1
            if task.get('is_completed', False):
                task_types[task_type]['completed'] += 1
        
        # Son 7 günlük görev tamamlama
        last_week = timezone.now() - timedelta(days=7)
        weekly_tasks = [task for task in firebase_tasks 
                       if task.get('created_at') and 
                       datetime.fromisoformat(task['created_at'].replace('Z', '+00:00')).replace(tzinfo=None) >= last_week.replace(tzinfo=None)]
        weekly_completed = len([task for task in weekly_tasks if task.get('is_completed', False)])
        weekly_total = len(weekly_tasks)
        weekly_rate = (weekly_completed / weekly_total) * 100 if weekly_total > 0 else 0
        
        return {
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'completion_rate': round(completion_rate, 1),
            'weekly_completion_rate': round(weekly_rate, 1),
            'task_types': task_types
        }
    
    def analyze_study_patterns(self) -> Dict[str, Any]:
        """Çalışma pattern analizi - Firebase'den veri çeker"""
        # Firebase'den çalışma oturumlarını al
        firebase_sessions = self.firebase_service.get_user_study_sessions(self.user.firebase_uid)
        
        # Eğer hiç oturum yoksa default değerler döndür
        if not firebase_sessions:
            return {
                'total_study_hours': 0.0,
                'daily_average': 0.0,
                'study_days': 0,
                'study_streak': 0,
                'achievement_rate': 0.0,
                'target_hours': 0.0
            }
        
        # Son 30 günlük çalışma analizi
        last_month = timezone.now() - timedelta(days=30)
        recent_sessions = [session for session in firebase_sessions 
                          if session.get('start_time') and 
                          datetime.fromisoformat(session['start_time'].replace('Z', '+00:00')).replace(tzinfo=None) >= last_month.replace(tzinfo=None)]
        
        total_study_minutes = sum(session.get('duration_minutes', 0) for session in recent_sessions)
        total_study_hours = total_study_minutes / 60
        
        # Günlük ortalama çalışma
        daily_average = total_study_hours / 30 if total_study_hours > 0 else 0
        
        # En çok çalışılan günler
        study_days = len(set(session.get('start_time', '')[:10] for session in recent_sessions if session.get('start_time')))
        study_streak = self.calculate_study_streak()
        
        # Hedef vs gerçekleşen (görevlerden)
        firebase_tasks = self.firebase_service.get_user_tasks(self.user.firebase_uid)
        recent_tasks = [task for task in firebase_tasks 
                       if task.get('created_at') and 
                       datetime.fromisoformat(task['created_at'].replace('Z', '+00:00')).replace(tzinfo=None) >= last_month.replace(tzinfo=None)]
        
        target_minutes = sum(task.get('estimated_duration', 0) for task in recent_tasks)
        target_hours = target_minutes / 60
        achievement_rate = (total_study_hours / target_hours) * 100 if target_hours > 0 else 0
        
        return {
            'total_study_hours': round(total_study_hours, 1),
            'daily_average': round(daily_average, 1),
            'study_days': study_days,
            'study_streak': study_streak,
            'achievement_rate': round(achievement_rate, 1),
            'target_hours': round(target_hours, 1)
        }
    
    def analyze_topic_performance(self) -> Dict[str, Any]:
        """Konu bazlı performans analizi - Firebase'den veri çeker"""
        # Firebase'den deneme kayıtlarını al
        firebase_exam_records = self.firebase_service.get_user_exam_records(self.user.firebase_uid)
        
        # Eğer hiç deneme kaydı yoksa default değerler döndür
        if not firebase_exam_records:
            return {
                'weak_topics': [],
                'strong_topics': [],
                'topic_stats': {}
            }
        
        # Konu bazlı istatistikler
        topic_stats = {}
        
        for record in firebase_exam_records:
            topics = record.get('topics', [])
            for topic_name in topics:
                if topic_name not in topic_stats:
                    topic_stats[topic_name] = {
                        'subject': record.get('subject_name', 'Bilinmeyen Ders'),
                        'total_questions': 0,
                        'correct_answers': 0,
                        'appearances': 0
                    }
                
                topic_stats[topic_name]['appearances'] += 1
                
                # Deneme kayıtlarından konu bazlı istatistikler
                total_questions = record.get('total_questions', 0)
                total_correct = record.get('total_correct', 0)
                
                # Konuya göre soru sayısını tahmin et (toplam soruların %20'si)
                topic_questions = int(total_questions * 0.2)
                topic_correct = int(total_correct * 0.2)
                
                topic_stats[topic_name]['total_questions'] += topic_questions
                topic_stats[topic_name]['correct_answers'] += topic_correct
        
        # Zayıf ve güçlü konuları belirle
        weak_topics = []
        strong_topics = []
        
        for topic, stats in topic_stats.items():
            if stats['appearances'] >= 2:  # En az 2 denemede görülmüş
                success_rate = (stats['correct_answers'] / stats['total_questions']) * 100 if stats['total_questions'] > 0 else 0
                
                if success_rate < 60:
                    weak_topics.append({
                        'name': topic,
                        'subject': stats['subject'],
                        'success_rate': round(success_rate, 1)
                    })
                elif success_rate > 80:
                    strong_topics.append({
                        'name': topic,
                        'subject': stats['subject'],
                        'success_rate': round(success_rate, 1)
                    })
        
        return {
            'weak_topics': sorted(weak_topics, key=lambda x: x['success_rate'])[:5],
            'strong_topics': sorted(strong_topics, key=lambda x: x['success_rate'], reverse=True)[:5],
            'topic_stats': topic_stats
        }
    
    def calculate_study_streak(self) -> int:
        """Çalışma streak'ini hesapla - Firebase'den veri çeker"""
        firebase_tasks = self.firebase_service.get_user_tasks(self.user.firebase_uid)
        
        # Tamamlanmış görevleri al
        completed_tasks = [task for task in firebase_tasks if task.get('is_completed', False)]
        
        if not completed_tasks:
            return 0
        
        # Tarihe göre sırala
        completed_tasks.sort(key=lambda x: x.get('completed_at', ''), reverse=True)
        
        streak = 0
        current_date = timezone.now().date()
        
        for task in completed_tasks:
            if task.get('completed_at'):
                try:
                    task_date = datetime.fromisoformat(task['completed_at'].replace('Z', '+00:00')).replace(tzinfo=None).date()
                    if task_date == current_date - timedelta(days=streak):
                        streak += 1
                    else:
                        break
                except:
                    continue
        
        return streak
    
    def generate_recommendations(self) -> List[Dict[str, Any]]:
        """Kişiselleştirilmiş öneriler"""
        recommendations = []
        
        # Deneme analizi
        exam_analysis = self.analyze_exam_performance()
        if 'worst_subject' in exam_analysis and exam_analysis['worst_subject']:
            recommendations.append({
                'type': 'study_focus',
                'title': f'{exam_analysis["worst_subject"]} Odaklanın',
                'description': f'{exam_analysis["worst_subject"]} dersinde gelişim alanınız var. Bu derse daha fazla zaman ayırın.',
                'priority': 'high'
            })
        
        # Görev analizi
        task_analysis = self.analyze_task_completion()
        if task_analysis.get('completion_rate', 0) < 70:
            recommendations.append({
                'type': 'task_management',
                'title': 'Görev Tamamlama Oranınızı Artırın',
                'description': 'Görev tamamlama oranınız %70\'in altında. Daha küçük, yönetilebilir görevler oluşturun.',
                'priority': 'medium'
            })
        
        # Çalışma analizi
        study_analysis = self.analyze_study_patterns()
        if study_analysis.get('daily_average', 0) < 2:
            recommendations.append({
                'type': 'study_time',
                'title': 'Günlük Çalışma Sürenizi Artırın',
                'description': 'Günlük ortalama çalışma süreniz 2 saatin altında. Hedeflerinize ulaşmak için daha fazla çalışın.',
                'priority': 'high'
            })
        
        return recommendations
    
    def get_progress_summary(self) -> Dict[str, Any]:
        """İlerleme özeti"""
        exam_analysis = self.analyze_exam_performance()
        task_analysis = self.analyze_task_completion()
        study_analysis = self.analyze_study_patterns()
        
        return {
            'overall_score': self.calculate_overall_score(),
            'progress_level': self.determine_progress_level(),
            'next_milestone': self.get_next_milestone(),
            'key_metrics': {
                'total_exams': exam_analysis.get('total_exams', 0),
                'average_net': exam_analysis.get('average_net', 0),
                'task_completion_rate': task_analysis.get('completion_rate', 0),
                'study_streak': study_analysis.get('study_streak', 0)
            }
        }
    
    def calculate_overall_score(self) -> float:
        """Genel performans skoru hesapla"""
        exam_analysis = self.analyze_exam_performance()
        task_analysis = self.analyze_task_completion()
        study_analysis = self.analyze_study_patterns()
        
        # Skor hesaplama (0-100 arası)
        exam_score = min(exam_analysis.get('average_net', 0) * 2, 100)  # Net * 2
        task_score = task_analysis.get('completion_rate', 0)
        study_score = min(study_analysis.get('daily_average', 0) * 10, 100)  # Saat * 10
        
        overall_score = (
            exam_score * 0.5 +
            task_score * 0.3 +
            study_score * 0.2
        )
        
        return round(overall_score, 1)
    
    def determine_progress_level(self) -> str:
        """İlerleme seviyesini belirle"""
        score = self.calculate_overall_score()
        
        if score >= 80:
            return 'excellent'
        elif score >= 60:
            return 'good'
        elif score >= 40:
            return 'fair'
        else:
            return 'needs_improvement'
    
    def get_next_milestone(self) -> Dict[str, Any]:
        """Sonraki hedefi belirle"""
        current_score = self.calculate_overall_score()
        
        if current_score < 40:
            return {
                'target': 40,
                'description': 'Temel seviyeye ulaşın',
                'actions': ['Günlük çalışma rutini oluşturun', 'İlk deneme kaydınızı yapın']
            }
        elif current_score < 60:
            return {
                'target': 60,
                'description': 'Orta seviyeye ulaşın',
                'actions': ['Haftalık deneme çözün', 'Görev tamamlama oranınızı artırın']
            }
        elif current_score < 80:
            return {
                'target': 80,
                'description': 'İyi seviyeye ulaşın',
                'actions': ['Zayıf konularınızı güçlendirin', 'Düzenli tekrar yapın']
            }
        else:
            return {
                'target': 90,
                'description': 'Mükemmel seviyeye ulaşın',
                'actions': ['Detaylı analiz yapın', 'Hedeflerinizi gözden geçirin']
            }

    def get_subject_topic_analysis(self, subject_code: str) -> Dict[str, Any]:
        """Belirli bir dersin konu bazlı analizi - Firebase'den konuları çek"""
        try:
            import firebase_admin
            from firebase_admin import firestore
            
            # Firebase'den konuları çek
            db = firestore.client()
            
            # Subject code'a göre konuları al
            topics_ref = db.collection('topics')
            topics_query = topics_ref.where('subject_code', '==', subject_code)
            topics_docs = topics_query.stream()
            
            topic_analysis = []
            
            for topic_doc in topics_docs:
                topic_data = topic_doc.to_dict()
                
                # Bu konuyla ilgili kullanıcının verilerini al
                # Deneme kayıtları
                exam_records = ExamRecord.objects.filter(
                    user=self.user,
                    exam_topics__contains=[topic_doc.id]
                )
                
                # Soru çözme kayıtları (Firebase'den)
                questions_ref = db.collection('user_questions')
                user_questions_query = questions_ref.where('user_uid', '==', self.user.firebase_uid).where('topic_id', '==', topic_doc.id)
                user_questions_docs = user_questions_query.stream()
                
                # Test kayıtları (Firebase'den)
                tests_ref = db.collection('user_tests')
                user_tests_query = tests_ref.where('user_uid', '==', self.user.firebase_uid).where('topic_id', '==', topic_doc.id)
                user_tests_docs = user_tests_query.stream()
                
                total_questions = 0
                correct_answers = 0
                wrong_answers = 0
                empty_answers = 0
                
                # Deneme kayıtlarından veri topla
                for record in exam_records:
                    if record.total_questions:
                        total_questions += record.total_questions
                        correct_answers += record.total_correct or 0
                        wrong_answers += record.total_wrong or 0
                        empty_answers += (record.total_questions - (record.total_correct or 0) - (record.total_wrong or 0))
                
                # Soru çözme kayıtlarından veri topla
                for question_doc in user_questions_docs:
                    question_data = question_doc.to_dict()
                    total_questions += 1
                    if question_data.get('is_correct'):
                        correct_answers += 1
                    elif question_data.get('is_answered'):
                        wrong_answers += 1
                    else:
                        empty_answers += 1
                
                # Test kayıtlarından veri topla
                for test_doc in user_tests_docs:
                    test_data = test_doc.to_dict()
                    total_questions += test_data.get('total_questions', 0)
                    correct_answers += test_data.get('correct_answers', 0)
                    wrong_answers += test_data.get('wrong_answers', 0)
                    empty_answers += test_data.get('empty_answers', 0)
                
                # Eğer hiç veri yoksa, konuyu atla
                if total_questions == 0:
                    continue
                
                # Doğruluk oranını hesapla
                accuracy = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
                
                topic_analysis.append({
                    'id': topic_doc.id,
                    'name': topic_data.get('name', 'Bilinmeyen Konu'),
                    'totalQuestions': int(total_questions),
                    'correctAnswers': int(correct_answers),
                    'wrongAnswers': int(wrong_answers),
                    'emptyAnswers': int(empty_answers),
                    'accuracy': round(accuracy, 1)
                })
            
            return {
                'subject': {
                    'code': subject_code,
                    'name': subject_code.replace('_', ' ').title()
                },
                'topics': topic_analysis,
                'total_topics': len(topic_analysis)
            }
            
        except Exception as e:
            return {'error': f'Analiz hatası: {str(e)}'} 