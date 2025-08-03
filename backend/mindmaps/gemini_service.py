import google.generativeai as genai
import json
import re
from typing import Dict, List, Any
from django.conf import settings

# Gemini API Key'i settings'den al
GEMINI_API_KEY = getattr(settings, 'GEMINI_API_KEY', 'your-gemini-api-key')
genai.configure(api_key=GEMINI_API_KEY)

class MindMapGeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-pro')
    
    def analyze_speech_for_mindmap(self, speech_text: str) -> Dict[str, Any]:
        """Ses kaydını analiz edip zihin haritası yapısı oluştur"""
        
        prompt = f"""
        Bu ses kaydını analiz et ve kapsamlı bir zihin haritası için yapılandır. 
        Eğitim konuları için optimize edilmiş, detaylı bir yapı oluştur.
        
        Ses Kaydı: "{speech_text}"
        
        Lütfen şu JSON formatında döndür:
        {{
            "main_topic": "Ana konu adı",
            "title": "Zihin haritası başlığı",
            "description": "Kısa açıklama",
            "nodes": [
                {{
                    "label": "Alt konu 1 adı",
                    "icon": "📚",
                    "color": "#4CAF50",
                    "level": 1,
                    "notes": "Bu alt konunun açıklaması"
                }},
                {{
                    "label": "Alt konu 2 adı",
                    "icon": "🔬",
                    "color": "#2196F3",
                    "level": 1,
                    "notes": "Bu alt konunun açıklaması"
                }},
                {{
                    "label": "Alt konu 3 adı",
                    "icon": "⚡",
                    "color": "#FF9800",
                    "level": 1,
                    "notes": "Bu alt konunun açıklaması"
                }},
                {{
                    "label": "Alt konu 4 adı",
                    "icon": "💡",
                    "color": "#9C27B0",
                    "level": 1,
                    "notes": "Bu alt konunun açıklaması"
                }},
                {{
                    "label": "Alt konu 5 adı",
                    "icon": "🎯",
                    "color": "#F44336",
                    "level": 1,
                    "notes": "Bu alt konunun açıklaması"
                }}
            ],
            "connections": [
                {{
                    "source": "Ana konu adı",
                    "target": "Alt konu 1 adı",
                    "type": "default"
                }},
                {{
                    "source": "Ana konu adı",
                    "target": "Alt konu 2 adı",
                    "type": "default"
                }},
                {{
                    "source": "Ana konu adı",
                    "target": "Alt konu 3 adı",
                    "type": "default"
                }},
                {{
                    "source": "Ana konu adı",
                    "target": "Alt konu 4 adı",
                    "type": "default"
                }},
                {{
                    "source": "Ana konu adı",
                    "target": "Alt konu 5 adı",
                    "type": "default"
                }}
            ],
            "suggested_icons": {{
                "Ana konu": "🧠",
                "Alt konu": "📝"
            }},
            "difficulty_level": "beginner|intermediate|advanced",
            "estimated_study_time": "2 saat"
        }}
        
        ÖNEMLİ KURALLAR:
        1. Ana konu net ve anlaşılır olsun
        2. EN AZ 4-5 ALT KONU oluştur
        3. Her alt konu için farklı ikonlar kullan (📚, 🔬, ⚡, 💡, 🎯, 📖, 🔍, ⚛️, 🧪, 📊)
        4. Her alt konu için farklı renkler kullan
        5. Alt konular mantıklı ve konuyla ilgili olsun
        6. Her alt konu için kısa açıklama ekle
        7. Tüm bağlantıları doğru şekilde oluştur
        8. Eğitim konuları için uygun terminoloji kullan
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = self._parse_gemini_response(response.text)
            return result
        except Exception as e:
            return self._create_fallback_mindmap(speech_text, str(e))
    
    def expand_mindmap_node(self, node_label: str, speech_text: str) -> Dict[str, Any]:
        """Mevcut düğümü genişlet"""
        
        prompt = f"""
        Bu düğümü genişlet ve alt konular ekle:
        
        Ana Düğüm: "{node_label}"
        Kullanıcı Açıklaması: "{speech_text}"
        
        Lütfen şu JSON formatında döndür:
        {{
            "parent_node": "{node_label}",
            "new_nodes": [
                {{
                    "label": "Yeni alt konu",
                    "icon": "📝",
                    "color": "#4CAF50",
                    "level": 2,
                    "notes": "Açıklama"
                }}
            ],
            "new_connections": [
                {{
                    "source": "{node_label}",
                    "target": "Yeni alt konu",
                    "type": "default"
                }}
            ]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = self._parse_gemini_response(response.text)
            return result
        except Exception as e:
            return {"error": f"Genişletme hatası: {str(e)}"}
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """Gemini yanıtını parse et"""
        try:
            # JSON kısmını bul
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            else:
                return self._create_fallback_mindmap(response_text, "JSON parse hatası")
        except json.JSONDecodeError:
            return self._create_fallback_mindmap(response_text, "JSON decode hatası")
    
    def _create_fallback_mindmap(self, speech_text: str, error: str) -> Dict[str, Any]:
        """Hata durumunda basit bir zihin haritası oluştur"""
        return {
            "main_topic": speech_text[:50] if speech_text else "Yeni Konu",
            "title": "Yeni Zihin Haritası",
            "description": f"Oluşturulan harita (Hata: {error})",
            "nodes": [
                {
                    "label": speech_text[:50] if speech_text else "Ana Konu",
                    "icon": "🧠",
                    "color": "#4CAF50",
                    "level": 0,
                    "notes": ""
                }
            ],
            "connections": [],
            "suggested_icons": {},
            "difficulty_level": "beginner",
            "estimated_study_time": "1 saat"
        } 