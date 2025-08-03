"""
Firebase'den veri çekme servisi
"""
import firebase_admin
from firebase_admin import firestore
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from django.utils import timezone

class FirebaseDataService:
    """Firebase'den veri çekme servisi"""
    
    def __init__(self):
        self.db = firestore.client()
    
    def get_user_exam_records(self, user_uid: str) -> List[Dict[str, Any]]:
        """Kullanıcının deneme kayıtlarını getir"""
        try:
            # Firebase'den deneme kayıtlarını çek
            exam_records_ref = self.db.collection('exam_records')
            query = exam_records_ref.where('user_uid', '==', user_uid)
            docs = query.stream()
            
            exam_records = []
            for doc in docs:
                data = doc.to_dict()
                exam_records.append({
                    'id': doc.id,
                    **data
                })
            
            return exam_records
        except Exception as e:
            print(f"Firebase'den deneme kayıtları alınırken hata: {e}")
            return []
    
    def get_user_questions(self, user_uid: str) -> List[Dict[str, Any]]:
        """Kullanıcının soru çözme kayıtlarını getir"""
        try:
            questions_ref = self.db.collection('user_questions')
            query = questions_ref.where('user_uid', '==', user_uid)
            docs = query.stream()
            
            questions = []
            for doc in docs:
                data = doc.to_dict()
                questions.append({
                    'id': doc.id,
                    **data
                })
            
            return questions
        except Exception as e:
            print(f"Firebase'den soru kayıtları alınırken hata: {e}")
            return []
    
    def get_user_tests(self, user_uid: str) -> List[Dict[str, Any]]:
        """Kullanıcının test kayıtlarını getir"""
        try:
            tests_ref = self.db.collection('user_tests')
            query = tests_ref.where('user_uid', '==', user_uid)
            docs = query.stream()
            
            tests = []
            for doc in docs:
                data = doc.to_dict()
                tests.append({
                    'id': doc.id,
                    **data
                })
            
            return tests
        except Exception as e:
            print(f"Firebase'den test kayıtları alınırken hata: {e}")
            return []
    
    def get_topics(self, subject_code: str = None) -> List[Dict[str, Any]]:
        """Konuları getir"""
        try:
            topics_ref = self.db.collection('topics')
            if subject_code:
                query = topics_ref.where('subject_code', '==', subject_code)
            else:
                query = topics_ref
            
            docs = query.stream()
            
            topics = []
            for doc in docs:
                data = doc.to_dict()
                topics.append({
                    'id': doc.id,
                    **data
                })
            
            return topics
        except Exception as e:
            print(f"Firebase'den konular alınırken hata: {e}")
            return []
    
    def get_subjects(self) -> List[Dict[str, Any]]:
        """Dersleri getir"""
        try:
            subjects_ref = self.db.collection('subjects')
            docs = subjects_ref.stream()
            
            subjects = []
            for doc in docs:
                data = doc.to_dict()
                subjects.append({
                    'id': doc.id,
                    **data
                })
            
            return subjects
        except Exception as e:
            print(f"Firebase'den dersler alınırken hata: {e}")
            return []
    
    def get_user_study_sessions(self, user_uid: str) -> List[Dict[str, Any]]:
        """Kullanıcının çalışma oturumlarını getir"""
        try:
            sessions_ref = self.db.collection('study_sessions')
            query = sessions_ref.where('user_uid', '==', user_uid)
            docs = query.stream()
            
            sessions = []
            for doc in docs:
                data = doc.to_dict()
                sessions.append({
                    'id': doc.id,
                    **data
                })
            
            return sessions
        except Exception as e:
            print(f"Firebase'den çalışma oturumları alınırken hata: {e}")
            return []
    
    def get_user_tasks(self, user_uid: str) -> List[Dict[str, Any]]:
        """Kullanıcının görevlerini getir"""
        try:
            tasks_ref = self.db.collection('tasks')
            query = tasks_ref.where('user_uid', '==', user_uid)
            docs = query.stream()
            
            tasks = []
            for doc in docs:
                data = doc.to_dict()
                tasks.append({
                    'id': doc.id,
                    **data
                })
            
            return tasks
        except Exception as e:
            print(f"Firebase'den görevler alınırken hata: {e}")
            return [] 