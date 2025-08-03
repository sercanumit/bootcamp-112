from django.core.management.base import BaseCommand
from exams.models import ExamCategory, Subject, Topic

class Command(BaseCommand):
    help = 'TYT ve AYT konularını veritabanına yükler'

    def handle(self, *args, **options):
        self.stdout.write('Konular yükleniyor...')
        
        # TYT Kategorisi oluştur
        tyt_category, created = ExamCategory.objects.get_or_create(
            category_type='tyt',
            defaults={
                'name': 'Temel Yeterlilik Testi',
                'description': 'TYT sınavı konuları'
            }
        )
        
        # AYT Kategorisi oluştur  
        ayt_category, created = ExamCategory.objects.get_or_create(
            category_type='ayt',
            defaults={
                'name': 'Alan Yeterlilik Testi',
                'description': 'AYT sınavı konuları'
            }
        )

        # FİZİK TYT Konuları
        fizik_tyt, created = Subject.objects.get_or_create(
            category=tyt_category,
            name='Fizik',
            defaults={'order': 1}
        )
        
        # Fizik TYT Ana Konuları
        fizik_tyt_topics = {
            'FİZİK BİLİMİNE GİRİŞ': [
                'Fiziğin Tanımı ve Özellikleri',
                'Fiziğin Alt Dalları', 
                'Fiziğin Diğer Disiplinlerle İlişkisi',
                'Fiziksel Niceliklerin Sınıflandırılması',
                'Fizik ve Bilim Araştırma Merkezleri'
            ],
            'MADDE VE ÖZELLİKLERİ': [
                'Madde ve Özkütle',
                'Dayanıklılık',
                'Adezyon ve Kohezyon'
            ],
            'HAREKET VE KUVVET': [
                'Hareket',
                'Kuvvet',
                "Newton'un Hareket Yasaları",
                'Sürtünme Kuvveti'
            ],
            'ENERJİ': [
                'İş, Güç ve Enerji',
                'Mekanik Enerji',
                'Enerjinin Korunumu ve Enerji Dönüşümleri',
                'Verim',
                'Enerji Kaynakları'
            ],
            'ISI VE SICAKLIK': [
                'Isı ve Sıcaklık',
                'Hal Değişimi',
                'Isıl Denge',
                'Enerji İletim Yolları ve Enerji Tüketim Hızı',
                'Genleşme'
            ],
            'ELEKTROSTATİK': [
                'Elektrik Yükü',
                'Elektrikle Yüklenme Çeşitleri',
                'Elektroskop',
                'İletken ve Yalıtkanlarda Yük Dağılımı',
                'Topraklama',
                'Coulomb Kuvveti',
                'Elektrik Alanı'
            ],
            'ELEKTRİK VE MANYETİZMA': [
                'Elektrik Akımı,Potansiyel Farkı ve Direnci',
                'Elektrik Devreleri',
                'Mıknatıs ve Manyetik Alan',
                'Akım ve Manyetik Alan'
            ],
            'BASINÇ VE KALDIRMA KUVVETİ': [
                'Basınç',
                'Kaldırma Kuvveti'
            ],
            'DALGALAR': [
                'Temel Dalga Bilgileri',
                'Yay Dalgası',
                'Su Dalgası',
                'Ses Dalgası',
                'Deprem Dalgaları'
            ],
            'AYDINLANMA': [
                'Aydınlanma',
                'Gölge',
                'Yansıma',
                'Düzlem Ayna',
                'Kırılma',
                'Mercekler',
                'Prizmalar'
            ]
        }
        
        self.create_topics(fizik_tyt, fizik_tyt_topics)
        
        # FİZİK AYT Konuları
        fizik_ayt, created = Subject.objects.get_or_create(
            category=ayt_category,
            name='Fizik',
            defaults={'order': 1}
        )
        
        fizik_ayt_topics = {
            'KUVVET VE HAREKET': [
                'Kuvvet ve Hareket',
                'Vektörler',
                'Bağıl Hareket',
                "Newton'un Hareket Yasaları",
                'Bir Boyutta Sabit İvmeli Hareket',
                'İki Boyutta Sabit İvmeli Hareket',
                'Enerji ve Hareket',
                'İtme ve Çizgisel Momentum',
                'Tork',
                'Denge',
                'Basit Makineler'
            ],
            'ELEKTRİK VE MANYETİZMA': [
                'Elektriksel Kuvvet ve Elektrik Alanı',
                'Elektriksel Potansiyel',
                'Düzgün Elektrik Alanı ve Sığa',
                'Manyetizma ve Elektromanyetik İndükleme',
                'Alternatif Akım',
                'Transformatörler'
            ],
            'MODERN FİZİK': [
                'Özel Görelelik',
                'Kuantum Fiziğine Giriş',
                'Fotoelektrik Olayı',
                'Compton Saçılması ve De Broglie Dalga Boyu',
                'Modern Fiziğin Teknolojideki Uygulamaları',
                'Görüntüleme Teknolojileri',
                'Yarı İletken Teknolojisi',
                'Süper İletkenler',
                'Nanoteknoloji',
                'Lazer Işınları'
            ]
        }
        
        self.create_topics(fizik_ayt, fizik_ayt_topics)
        
        self.stdout.write(self.style.SUCCESS('✅ Fizik konuları başarıyla yüklendi!'))
        
        # MATEMATİK TYT Konuları
        matematik_tyt, created = Subject.objects.get_or_create(
            category=tyt_category,
            name='Matematik',
            defaults={'order': 2}
        )
        
        matematik_tyt_topics = {
            'TEMEL KAVRAMLAR': [
                'Sayılar',
                'Sayı Basamakları',
                'Bölme ve Bölünebilme',
                'OBEB-OKEK',
                'Rasyonel Sayılar',
                'Basit Eşitsizlikler',
                'Mutlak Değer',
                'Üslü Sayılar',
                'Köklü Sayılar',
                'Çarpanlara Ayırma',
                'Oran Orantı',
                'Denklem Çözme',
                'Problemler'
            ],
            'KÜMELEr VE FONKSİYONLAR': [
                'Kümeler',
                'Fonksiyonlar'
            ],
            'OLASLIK VE İSTATİSTİK': [
                'Permütasyon',
                'Kombinasyon', 
                'Binom',
                'Olasılık',
                'İstatistik'
            ],
            'DENKLEMLER': [
                '2. Dereceden Denklemler',
                'Karmaşık Sayılar',
                'Parabol',
                'Polinomlar'
            ]
        }
        
        self.create_topics(matematik_tyt, matematik_tyt_topics)
        self.stdout.write(self.style.SUCCESS('✅ Matematik TYT konuları başarıyla yüklendi!'))

    def create_topics(self, subject, topics_dict):
        """Ana konular ve alt konuları oluştur"""
        for order, (main_topic, subtopics) in enumerate(topics_dict.items(), 1):
            # Ana konu oluştur
            main_topic_obj, created = Topic.objects.get_or_create(
                subject=subject,
                name=main_topic,
                parent_topic=None,
                defaults={'order': order}
            )
            
            # Alt konuları oluştur
            for sub_order, subtopic in enumerate(subtopics, 1):
                Topic.objects.get_or_create(
                    subject=subject,
                    name=subtopic,
                    parent_topic=main_topic_obj,
                    defaults={'order': sub_order}
                ) 