#!/usr/bin/env python
"""
Firebase'e deneme verileri ekleme scripti
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Django setup
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yon_backend.settings')
django.setup()

import firebase_admin
from firebase_admin import firestore

# Firebase'i başlat
if not firebase_admin._apps:
    from fiverbase.firebase_init import *

db = firestore.client()

def add_exam_records():
    """Firebase'e deneme kayıtları ekle"""
    
    # Test kullanıcı UID'si (log'lardan alınan)
    user_uid = "5YcG8Zc0sfVsQGrR6VVAoCrCwfs2"
    
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
    
    exam_records_ref = db.collection('exam_records')
    
    for i, exam_name in enumerate(exam_names):
        # TYT veya AYT seç
        exam_type = 'TYT' if i < 5 else 'AYT'
        exam_structure_data = exam_structure[exam_type]
        
        # Deneme tarihi (son 3 ay içinde)
        exam_date = datetime.now() - timedelta(days=random.randint(1, 90))
        
        # Ders seç
        if exam_type == 'TYT':
            subject_name = random.choice(['Türkçe', 'Matematik', 'Sosyal Bilimler', 'Fen Bilimleri'])
        else:
            subject_name = random.choice(['Matematik', 'Fen Bilimleri'])
        
        # Gerçekçi istatistikler
        total_questions = exam_structure_data['total_questions']
        total_correct = random.randint(int(total_questions * 0.3), int(total_questions * 0.7))
        total_wrong = random.randint(int(total_questions * 0.1), int(total_questions * 0.3))
        total_empty = total_questions - total_correct - total_wrong
        
        # Net hesapla (doğru - yanlış/4)
        total_net = total_correct - (total_wrong / 4)
        
        # Konular (Firebase'den gelecek konular için placeholder)
        topics = [
            'Temel Kavramlar', 'Sayılar', 'Cebir', 'Denklemler',
            'Mekanik', 'Elektrik', 'Dil Bilgisi', 'Paragraf'
        ]
        
        exam_data = {
            'user_uid': user_uid,
            'exam_name': exam_name,
            'exam_date': exam_date.isoformat(),
            'exam_type': exam_type.lower(),
            'subject_name': subject_name,
            'normal_duration': 135 if exam_type == 'TYT' else 180,  # TYT: 135dk, AYT: 180dk
            'student_duration': random.randint(120, 150) if exam_type == 'TYT' else random.randint(150, 180),
            'difficulty': random.choice(['easy', 'medium', 'hard']),
            'total_questions': total_questions,
            'total_marked': total_correct + total_wrong,
            'total_correct': total_correct,
            'total_wrong': total_wrong,
            'total_empty': total_empty,
            'total_net': float(total_net),
            'topics': random.sample(topics, random.randint(3, 6)),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Firebase'e ekle
        doc_ref = exam_records_ref.add(exam_data)
        print(f"Deneme kaydı eklendi: {exam_name} - {exam_type} - Net: {total_net:.2f}")

def add_study_sessions():
    """Firebase'e çalışma oturumları ekle"""
    
    user_uid = "5YcG8Zc0sfVsQGrR6VVAoCrCwfs2"
    sessions_ref = db.collection('study_sessions')
    
    session_types = ['study', 'practice', 'review', 'exam']
    subjects = ['Matematik', 'Fizik', 'Kimya', 'Türkçe', 'Biyoloji']
    
    for i in range(20):
        start_time = datetime.now() - timedelta(days=random.randint(1, 30), hours=random.randint(0, 23))
        duration = random.randint(30, 180)
        end_time = start_time + timedelta(minutes=duration)
        
        session_data = {
            'user_uid': user_uid,
            'session_type': random.choice(session_types),
            'subject': random.choice(subjects),
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
            'duration_minutes': duration,
            'questions_answered': random.randint(10, 50),
            'correct_answers': random.randint(5, 30),
            'focus_score': random.uniform(60, 95),
            'notes': f"Çalışma oturumu {i+1} notları",
            'is_completed': random.choice([True, False]),
            'created_at': datetime.now().isoformat()
        }
        
        doc_ref = sessions_ref.add(session_data)
        print(f"Çalışma oturumu eklendi: {session_data['subject']} - {duration}dk")

def add_tasks():
    """Firebase'e görevler ekle"""
    
    user_uid = "5YcG8Zc0sfVsQGrR6VVAoCrCwfs2"
    tasks_ref = db.collection('tasks')
    
    task_types = ['study', 'practice', 'review', 'exam', 'flashcard', 'custom']
    priorities = ['low', 'medium', 'high']
    subjects = ['Matematik', 'Fizik', 'Kimya', 'Türkçe', 'Biyoloji']
    topics = ['Temel Kavramlar', 'Problem Çözme', 'Tekrar', 'Pratik', 'Konu Anlatımı']
    
    for i in range(25):
        created_at = datetime.now() - timedelta(days=random.randint(1, 30))
        estimated_duration = random.randint(30, 120)
        is_completed = random.choice([True, False])
        actual_duration = random.randint(20, estimated_duration + 30) if is_completed else None
        
        subject = random.choice(subjects)
        topic = random.choice(topics)
        
        task_data = {
            'user_uid': user_uid,
            'title': f"{subject} - {topic} Çalışması",
            'description': f"{subject} dersinde {topic.lower()} konusunda çalışma yapılacak",
            'task_type': random.choice(task_types),
            'priority': random.choice(priorities),
            'estimated_duration': estimated_duration,
            'actual_duration': actual_duration,
            'is_completed': is_completed,
            'subject': subject,
            'topic': topic,
            'created_at': created_at.isoformat(),
            'completed_at': (created_at + timedelta(hours=random.randint(1, 4))).isoformat() if is_completed else None
        }
        
        doc_ref = tasks_ref.add(task_data)
        print(f"Görev eklendi: {task_data['title']}")

def main():
    """Ana fonksiyon"""
    print("Firebase'e veri ekleniyor...")
    
    # Deneme kayıtları ekle
    add_exam_records()
    
    # Çalışma oturumları ekle
    add_study_sessions()
    
    # Görevler ekle
    add_tasks()
    
    print("\n" + "="*50)
    print("FIREBASE VERİLERİ BAŞARIYLA EKLENDİ!")
    print("="*50)
    print("Test kullanıcısı: 5YcG8Zc0sfVsQGrR6VVAoCrCwfs2")
    print("Eklenen veriler:")
    print("- 9 deneme kaydı")
    print("- 20 çalışma oturumu")
    print("- 25 görev")
    print("\nAnaliz kısmını test edebilirsiniz.")

if __name__ == '__main__':
    main() 