#!/usr/bin/env python
"""
Mock veriler oluşturma scripti
Analiz kısmı için gerçekçi test verileri ekler
"""

import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random
from django.utils import timezone

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yon_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from exams.models import ExamCategory, Subject, Topic, ExamRecord
from coaching.models import (
    UserProgress, SubjectPerformance, StudyPlan, CoachingRecommendation,
    SpacedRepetition, StudySession, UserExamAttempt, UserQuestionAnswer
)
from tasks.models import DailyTask

User = get_user_model()

def create_mock_user():
    """Test kullanıcısı oluştur"""
    user, created = User.objects.get_or_create(
        email='mail@mail.com',
        defaults={
            'username': 'mailuser',
            'first_name': 'Test',
            'last_name': 'User',
            'is_active': True
        }
    )
    return user

def create_exam_categories():
    """Sınav kategorileri oluştur"""
    categories = [
        {'name': 'TYT', 'category_type': 'tyt'},
        {'name': 'AYT', 'category_type': 'ayt'},
        {'name': 'Dil', 'category_type': 'dil'},
        {'name': 'MSÜ', 'category_type': 'msu'},
    ]
    
    created_categories = []
    for cat_data in categories:
        category, created = ExamCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        created_categories.append(category)
        print(f"Kategori oluşturuldu: {category}")
    
    return created_categories

def create_subjects(categories):
    """Dersler oluştur"""
    subjects_data = {
        'TYT': [
            {'name': 'Türkçe', 'order': 1},
            {'name': 'Matematik', 'order': 2},
            {'name': 'Fen Bilimleri', 'order': 3},
            {'name': 'Sosyal Bilimler', 'order': 4},
        ],
        'AYT': [
            {'name': 'Matematik', 'order': 1},
            {'name': 'Fizik', 'order': 2},
            {'name': 'Kimya', 'order': 3},
            {'name': 'Biyoloji', 'order': 4},
            {'name': 'Türk Dili ve Edebiyatı', 'order': 5},
            {'name': 'Tarih', 'order': 6},
            {'name': 'Coğrafya', 'order': 7},
        ]
    }
    
    created_subjects = []
    for category in categories:
        if category.name in subjects_data:
            for subj_data in subjects_data[category.name]:
                subject, created = Subject.objects.get_or_create(
                    name=subj_data['name'],
                    category=category,
                    defaults=subj_data
                )
                created_subjects.append(subject)
                print(f"Ders oluşturuldu: {subject}")
    
    return created_subjects

def create_topics(subjects):
    """Konular oluştur"""
    topics_data = {
        'Matematik': [
            {'name': 'Temel Kavramlar', 'level': 0},
            {'name': 'Sayılar', 'level': 0},
            {'name': 'Rasyonel Sayılar', 'level': 1, 'parent_name': 'Sayılar'},
            {'name': 'Ondalık Sayılar', 'level': 1, 'parent_name': 'Sayılar'},
            {'name': 'Cebir', 'level': 0},
            {'name': 'Denklemler', 'level': 1, 'parent_name': 'Cebir'},
            {'name': 'Eşitsizlikler', 'level': 1, 'parent_name': 'Cebir'},
        ],
        'Fizik': [
            {'name': 'Mekanik', 'level': 0},
            {'name': 'Hareket ve Kuvvet', 'level': 1, 'parent_name': 'Mekanik'},
            {'name': 'Newton\'un Hareket Yasaları', 'level': 2, 'parent_name': 'Hareket ve Kuvvet'},
            {'name': 'Elektrik', 'level': 0},
            {'name': 'Elektrik Akımı', 'level': 1, 'parent_name': 'Elektrik'},
        ],
        'Türkçe': [
            {'name': 'Dil Bilgisi', 'level': 0},
            {'name': 'Fiilimsiler', 'level': 1, 'parent_name': 'Dil Bilgisi'},
            {'name': 'Cümle Bilgisi', 'level': 0},
            {'name': 'Paragraf', 'level': 0},
        ]
    }
    
    created_topics = []
    for subject in subjects:
        if subject.name in topics_data:
            for topic_data in topics_data[subject.name]:
                parent_topic = None
                if 'parent_name' in topic_data:
                    parent_topic = Topic.objects.filter(
                        name=topic_data['parent_name'],
                        subject=subject
                    ).first()
                
                topic, created = Topic.objects.get_or_create(
                    name=topic_data['name'],
                    subject=subject,
                    defaults={
                        'level': topic_data['level'],
                        'parent_topic': parent_topic
                    }
                )
                created_topics.append(topic)
                print(f"Konu oluşturuldu: {topic}")
    
    return created_topics

def create_exam_records(user, subjects):
    """Gerçek sınav yapısına göre deneme kayıtları oluştur"""
    from exams.models import ExamRecord, ExamCategory, Subject, Topic
    
    # Gerçek sınav yapısı
    exam_structure = {
        'TYT': {
            'total_questions': 120,
            'subjects': {
                'Türkçe': 40,
                'Matematik': 40,
                'Sosyal Bilimler': 20,
                'Fen Bilimleri': 20
            }
        },
        'AYT': {
            'total_questions': 80,
            'subjects': {
                'Matematik': 40,
                'Fen Bilimleri': 40  # Fizik: 14, Kimya: 13, Biyoloji: 13
            }
        }
    }
    
    # Deneme isimleri
    exam_names = [
        '3D TYT Deneme 1', '3D TYT Deneme 2', '3D TYT Deneme 3',
        'Apotemi TYT Deneme 1', 'Apotemi TYT Deneme 2',
        '3D AYT Deneme 1', '3D AYT Deneme 2',
        'Apotemi AYT Deneme 1', 'Apotemi AYT Deneme 2'
    ]
    
    created_records = []
    
    for i, exam_name in enumerate(exam_names):
        # TYT veya AYT seç
        exam_type = 'tyt' if i < 5 else 'ayt'
        exam_structure_data = exam_structure[exam_type.upper()]
        
        # Deneme tarihi (son 3 ay içinde)
        exam_date = timezone.now().date() - timedelta(days=random.randint(1, 90))
        
        # Ders seç (TYT için tüm dersler, AYT için sadece Matematik ve Fen)
        if exam_type == 'tyt':
            subject = random.choice([s for s in subjects if s.category.name == 'TYT'])
        else:
            subject = random.choice([s for s in subjects if s.category.name == 'AYT'])
        
        # Gerçekçi istatistikler
        total_questions = exam_structure_data['total_questions']
        total_correct = random.randint(int(total_questions * 0.3), int(total_questions * 0.7))
        total_wrong = random.randint(int(total_questions * 0.1), int(total_questions * 0.3))
        total_empty = total_questions - total_correct - total_wrong
        
        # Net hesapla (doğru - yanlış/4)
        total_net = total_correct - (total_wrong / 4)
        
        # Konuları seç (Firebase'den gelecek konular için placeholder)
        topics = Topic.objects.filter(subject=subject)[:random.randint(3, 8)]
        
        record = ExamRecord.objects.create(
            user=user,
            exam_name=exam_name,
            exam_date=exam_date,
            exam_type=exam_type,
            exam_subject=subject,
            normal_duration=135 if exam_type == 'tyt' else 180,  # TYT: 135dk, AYT: 180dk
            student_duration=random.randint(120, 150) if exam_type == 'tyt' else random.randint(150, 180),
            difficulty=random.choice(['easy', 'medium', 'hard']),
            total_questions=total_questions,
            total_marked=total_correct + total_wrong,
            total_correct=total_correct,
            total_wrong=total_wrong,
            total_net=Decimal(str(total_net))
        )
        
        # Konuları ekle
        record.exam_topics.set(topics)
        
        created_records.append(record)
        print(f"Deneme kaydı oluşturuldu: {record.exam_name} - {record.exam_type.upper()} - Net: {record.total_net}")
    
    return created_records

def create_user_progress(user):
    """Kullanıcı ilerleme durumu oluştur"""
    progress, created = UserProgress.objects.get_or_create(
        user=user,
        defaults={
            'total_study_hours': random.uniform(50, 200),
            'streak_days': random.randint(5, 30),
            'total_exam_attempts': random.randint(8, 15),
            'average_score': random.uniform(60, 85),
            'weak_subjects': ['Fizik', 'Kimya'],
            'strong_subjects': ['Matematik', 'Türkçe'],
            'last_study_date': timezone.now() - timedelta(hours=random.randint(1, 24))
        }
    )
    print(f"Kullanıcı ilerlemesi oluşturuldu: {progress}")
    return progress

def create_subject_performances(user, subjects):
    """Ders performansları oluştur"""
    performances = []
    for subject in subjects:
        total_questions = random.randint(100, 500)
        correct_answers = random.randint(50, total_questions)
        success_rate = (correct_answers / total_questions) * 100
        
        performance, created = SubjectPerformance.objects.get_or_create(
            user=user,
            subject=subject,
            defaults={
                'total_questions_answered': total_questions,
                'correct_answers': correct_answers,
                'success_rate': success_rate,
                'average_time_per_question': random.uniform(1.5, 3.5),
                'weak_topics': [f"{subject.name} Konu {i}" for i in range(1, 3)],
                'strong_topics': [f"{subject.name} Konu {i}" for i in range(4, 6)]
            }
        )
        performances.append(performance)
        print(f"Ders performansı oluşturuldu: {performance}")
    
    return performances

def create_study_plans(user, subjects):
    """Çalışma planları oluştur"""
    plan_titles = [
        "Matematik Temel Kavramlar Tekrarı",
        "Fizik Newton Yasaları Çalışması",
        "Türkçe Paragraf Pratiği",
        "Kimya Organik Kimya Konuları",
        "Biyoloji Hücre Konusu"
    ]
    
    priorities = ['low', 'medium', 'high', 'urgent']
    
    plans = []
    for i, title in enumerate(plan_titles):
        plan = StudyPlan.objects.create(
            user=user,
            title=title,
            description=f"{title} için detaylı çalışma planı",
            subject=random.choice(subjects),
            priority=random.choice(priorities),
            estimated_hours=random.uniform(2, 8),
            target_date=timezone.now().date() + timedelta(days=random.randint(1, 30)),
            is_completed=random.choice([True, False])
        )
        plans.append(plan)
        print(f"Çalışma planı oluşturuldu: {plan}")
    
    return plans

def create_coaching_recommendations(user, subjects):
    """Koçluk önerileri oluştur"""
    recommendation_types = [
        'study_plan', 'topic_focus', 'time_management', 
        'practice_more', 'review_weak'
    ]
    
    recommendations = []
    for i in range(5):
        rec_type = random.choice(recommendation_types)
        title = f"Öneri {i+1}: {rec_type.replace('_', ' ').title()}"
        
        recommendation = CoachingRecommendation.objects.create(
            user=user,
            recommendation_type=rec_type,
            title=title,
            description=f"Bu öneri {rec_type} ile ilgili detaylı açıklama içerir.",
            subject=random.choice(subjects),
            priority_score=random.randint(30, 90),
            is_read=random.choice([True, False]),
            is_applied=random.choice([True, False]),
            valid_until=timezone.now() + timedelta(days=random.randint(7, 30))
        )
        recommendations.append(recommendation)
        print(f"Koçluk önerisi oluşturuldu: {recommendation}")
    
    return recommendations

def create_study_sessions(user, subjects):
    """Çalışma oturumları oluştur"""
    session_types = ['study', 'practice', 'review', 'exam']
    
    sessions = []
    # Son 30 gün için çalışma oturumları
    for i in range(20):
        start_time = timezone.now() - timedelta(days=random.randint(1, 30), hours=random.randint(0, 23))
        duration = random.randint(30, 180)
        end_time = start_time + timedelta(minutes=duration)
        
        session = StudySession.objects.create(
            user=user,
            session_type=random.choice(session_types),
            subject=random.choice(subjects),
            start_time=start_time,
            end_time=end_time,
            duration_minutes=duration,
            questions_answered=random.randint(10, 50),
            correct_answers=random.randint(5, 30),
            focus_score=random.uniform(60, 95),
            notes=f"Çalışma oturumu {i+1} notları",
            is_completed=random.choice([True, False])
        )
        sessions.append(session)
        print(f"Çalışma oturumu oluşturuldu: {session}")
    
    return sessions

def create_daily_tasks(user):
    """Günlük görevler oluştur"""
    task_types = ['study', 'practice', 'review', 'exam', 'flashcard', 'custom']
    priorities = ['low', 'medium', 'high']
    subjects = ['Matematik', 'Fizik', 'Kimya', 'Türkçe', 'Biyoloji']
    topics = ['Temel Kavramlar', 'Problem Çözme', 'Tekrar', 'Pratik', 'Konu Anlatımı']
    
    tasks = []
    # Son 30 gün için görevler
    for i in range(25):  # Daha fazla görev
        created_at = timezone.now() - timedelta(days=random.randint(1, 30))
        estimated_duration = random.randint(30, 120)
        is_completed = random.choice([True, False])
        actual_duration = random.randint(20, estimated_duration + 30) if is_completed else None
        
        subject = random.choice(subjects)
        topic = random.choice(topics)
        
        task = DailyTask.objects.create(
            user_uid=user.firebase_uid,
            title=f"{subject} - {topic} Çalışması",
            description=f"{subject} dersinde {topic.lower()} konusunda çalışma yapılacak",
            task_type=random.choice(task_types),
            priority=random.choice(priorities),
            estimated_duration=estimated_duration,
            actual_duration=actual_duration,
            is_completed=is_completed,
            subject=subject,
            topic=topic,
            created_at=created_at,
            completed_at=created_at + timedelta(hours=random.randint(1, 4)) if is_completed else None
        )
        tasks.append(task)
        print(f"Günlük görev oluşturuldu: {task}")
    
    return tasks

def main():
    """Ana fonksiyon"""
    print("Mock veriler oluşturuluyor...")
    
    # Test kullanıcısı oluştur
    user = create_mock_user()
    print(f"Test kullanıcısı: {user}")
    
    # Kategoriler oluştur
    categories = create_exam_categories()
    
    # Dersler oluştur
    subjects = create_subjects(categories)
    
    # Konular oluştur
    topics = create_topics(subjects)
    
    # Deneme kayıtları oluştur
    exam_records = create_exam_records(user, subjects)
    
    # Kullanıcı ilerlemesi oluştur
    progress = create_user_progress(user)
    
    # Ders performansları oluştur
    subject_performances = create_subject_performances(user, subjects)
    
    # Çalışma planları oluştur
    study_plans = create_study_plans(user, subjects)
    
    # Koçluk önerileri oluştur
    recommendations = create_coaching_recommendations(user, subjects)
    
    # Çalışma oturumları oluştur
    study_sessions = create_study_sessions(user, subjects)
    
    # Günlük görevler oluştur
    daily_tasks = create_daily_tasks(user)
    
    print("\n" + "="*50)
    print("MOCK VERİLER BAŞARIYLA OLUŞTURULDU!")
    print("="*50)
    print(f"Test kullanıcısı: {user.email}")
    print(f"Oluşturulan veriler:")
    print(f"- {len(categories)} sınav kategorisi")
    print(f"- {len(subjects)} ders")
    print(f"- {len(topics)} konu")
    print(f"- {len(exam_records)} deneme kaydı")
    print(f"- {len(subject_performances)} ders performansı")
    print(f"- {len(study_plans)} çalışma planı")
    print(f"- {len(recommendations)} koçluk önerisi")
    print(f"- {len(study_sessions)} çalışma oturumu")
    print(f"- {len(daily_tasks)} günlük görev")
    print("\nAnaliz kısmını test etmek için Django admin panelini kullanabilirsiniz.")
    print("API endpoint'leri:")
    print("- /api/coaching/progress/analytics_summary/")
    print("- /api/coaching/progress/exam_analysis/")
    print("- /api/coaching/progress/task_analysis/")

if __name__ == '__main__':
    main() 