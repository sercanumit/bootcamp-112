from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from flashcards.models import Flashcard, FlashcardDeck, FlashcardDeckItem
from exams.models import Topic
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Örnek flashcard verileri yükler'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Mevcut flashcard verilerini sil'
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Mevcut flashcard verileri siliniyor...')
            Flashcard.objects.all().delete()
            FlashcardDeck.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Mevcut veriler silindi.'))

        with transaction.atomic():
            self.load_physics_flashcards()
            self.load_math_flashcards()
            self.create_sample_decks()

        self.stdout.write(self.style.SUCCESS('Örnek flashcard verileri başarıyla yüklendi!'))

    def load_physics_flashcards(self):
        self.stdout.write('Fizik flashcard\'ları yükleniyor...')
        
        # Fizik konularını bul
        physics_topics = Topic.objects.filter(subject__name='Fizik')
        
        if not physics_topics.exists():
            self.stdout.write(self.style.WARNING('Fizik konuları bulunamadı. Önce konuları yükleyin.'))
            return

        physics_flashcards = [
            # Kuvvet ve Hareket
            {
                'topic_name': 'Newton\'un Hareket Yasaları',
                'title': 'Newton\'un 1. Yasası',
                'question': 'Newton\'un 1. yasası nedir? Eylemsizlik yasası olarak da bilinir.',
                'answer': 'Bir cisim üzerine net kuvvet etki etmiyorsa, durgun cisim durgun kalır, hareketli cisim sabit hızla doğrusal harekete devam eder.',
                'explanation': 'Bu yasa eylemsizlik yasası olarak da bilinir. Cisimler mevcut durumlarını koruma eğilimindedir.'
            },
            {
                'topic_name': 'Newton\'un Hareket Yasaları',
                'title': 'Newton\'un 2. Yasası',
                'question': 'F = ma formülü neyi ifade eder?',
                'answer': 'Newton\'un 2. yasasını ifade eder. Net kuvvet, kütle ile ivmenin çarpımına eşittir.',
                'explanation': 'Bu formül kuvvet, kütle ve ivme arasındaki ilişkiyi gösterir. Kuvvet arttıkça ivme artar.'
            },
            {
                'topic_name': 'Newton\'un Hareket Yasaları',
                'title': 'Newton\'un 3. Yasası',
                'question': 'Etki-tepki yasası nedir?',
                'answer': 'Her etkiye eşit büyüklükte ve zıt yönde bir tepki vardır.',
                'explanation': 'İki cisim arasındaki kuvvetler her zaman eşit büyüklükte ve zıt yönlüdür.'
            },
            # Enerji
            {
                'topic_name': 'Enerji',
                'title': 'Kinetik Enerji',
                'question': 'Kinetik enerji formülü nedir?',
                'answer': 'Ek = ½mv² (Kinetik enerji = yarım × kütle × hızın karesi)',
                'explanation': 'Hareket halindeki cismin sahip olduğu enerjidir. Hızın karesiyle orantılıdır.'
            },
            {
                'topic_name': 'Enerji',
                'title': 'Potansiyel Enerji',
                'question': 'Çekim potansiyel enerjisi formülü nedir?',
                'answer': 'Ep = mgh (Potansiyel enerji = kütle × yer çekim × yükseklik)',
                'explanation': 'Cismin konumuna bağlı olarak sahip olduğu enerjidir.'
            },
            {
                'topic_name': 'Enerji',
                'title': 'Enerjinin Korunumu',
                'question': 'Enerjinin korunumu yasası nedir?',
                'answer': 'Enerji yoktan var edilemez, vardan yok edilemez. Sadece bir türden başka türe dönüşür.',
                'explanation': 'Kapalı bir sistemde toplam enerji her zaman sabittir.'
            },
            # Elektrik
            {
                'topic_name': 'Elektrostatik',
                'title': 'Coulomb Yasası',
                'question': 'İki nokta yükü arasındaki elektrik kuvveti nasıl hesaplanır?',
                'answer': 'F = k(q₁q₂)/r² (k: Coulomb sabiti, q: yükler, r: aralarındaki mesafe)',
                'explanation': 'Elektrik kuvveti yüklerin çarpımıyla doğru, mesafenin karesiyle ters orantılıdır.'
            },
            {
                'topic_name': 'Elektrik Akımı',
                'title': 'Ohm Yasası',
                'question': 'Ohm yasası formülü nedir?',
                'answer': 'V = IR (Gerilim = Akım × Direnç)',
                'explanation': 'Bir iletkendeki gerilim, akımla direncin çarpımına eşittir.'
            },
            {
                'topic_name': 'Elektrik Akımı',
                'title': 'Elektrik Gücü',
                'question': 'Elektrik gücü nasıl hesaplanır?',
                'answer': 'P = VI = I²R = V²/R (Güç = Gerilim × Akım)',
                'explanation': 'Elektrik gücü, birim zamanda harcanan elektrik enerjisidir.'
            },
            # Dalgalar
            {
                'topic_name': 'Dalgalar',
                'title': 'Dalga Denklemi',
                'question': 'Dalga hızı, frekans ve dalga boyu arasındaki ilişki nedir?',
                'answer': 'v = fλ (Dalga hızı = Frekans × Dalga boyu)',
                'explanation': 'Bu temel dalga denklemidir. Tüm dalgalar için geçerlidir.'
            },
            {
                'topic_name': 'Işık',
                'title': 'Kırılma Yasası',
                'question': 'Snell yasası (kırılma yasası) nedir?',
                'answer': 'n₁sinθ₁ = n₂sinθ₂ (Kırılma indisi × sinüs açı = sabit)',
                'explanation': 'Işık farklı ortamlara geçerken yönünü değiştirir. Bu değişim kırılma yasasına göre olur.'
            }
        ]

        created_count = 0
        for flashcard_data in physics_flashcards:
            try:
                # Konuyu bul
                topic = physics_topics.filter(name__icontains=flashcard_data['topic_name']).first()
                if not topic:
                    # Eğer tam eşleşme bulamazsa, ilk fizik konusunu kullan
                    topic = physics_topics.first()
                
                flashcard, created = Flashcard.objects.get_or_create(
                    title=flashcard_data['title'],
                    topic=topic,
                    defaults={
                        'question': flashcard_data['question'],
                        'answer': flashcard_data['answer'],
                        'explanation': flashcard_data['explanation']
                    }
                )
                if created:
                    created_count += 1
                    
            except Exception as e:
                self.stdout.write(f'Hata: {flashcard_data["title"]} - {str(e)}')

        self.stdout.write(f'✅ {created_count} fizik flashcard\'ı oluşturuldu.')

    def load_math_flashcards(self):
        self.stdout.write('Matematik flashcard\'ları yükleniyor...')
        
        # Matematik konularını bul
        math_topics = Topic.objects.filter(subject__name='Matematik')
        
        if not math_topics.exists():
            self.stdout.write(self.style.WARNING('Matematik konuları bulunamadı.'))
            return

        math_flashcards = [
            {
                'topic_name': 'Türev',
                'title': 'Türev Tanımı',
                'question': 'Türev matematiksel olarak nasıl tanımlanır?',
                'answer': 'f\'(x) = lim(h→0) [f(x+h) - f(x)]/h',
                'explanation': 'Türev, bir fonksiyonun belirli bir noktadaki anlık değişim hızıdır.'
            },
            {
                'topic_name': 'Türev',
                'title': 'Zincir Kuralı',
                'question': 'Bileşke fonksiyonların türevi nasıl alınır?',
                'answer': '[f(g(x))]′ = f′(g(x)) × g′(x)',
                'explanation': 'Zincir kuralı, iç içe fonksiyonların türevini almak için kullanılır.'
            },
            {
                'topic_name': 'İntegral',
                'title': 'Belirsiz İntegral',
                'question': '∫x^n dx integralinin sonucu nedir? (n ≠ -1)',
                'answer': '∫x^n dx = x^(n+1)/(n+1) + C',
                'explanation': 'Kuvvet kuralı: üs bir artırılır ve yeni üse bölünür, sabit eklenir.'
            },
            {
                'topic_name': 'Trigonometri',
                'title': 'Temel Trigonometrik Kimlik',
                'question': 'sin²x + cos²x = ?',
                'answer': 'sin²x + cos²x = 1',
                'explanation': 'Bu, en temel trigonometrik kimliktir. Pisagor teoreminden gelir.'
            },
            {
                'topic_name': 'Logaritma',
                'title': 'Logaritma Tanımı',
                'question': 'log_a(b) = c ifadesi neyi means?',
                'answer': 'a^c = b demektir. (a tabanında b\'nin logaritması c\'dir)',
                'explanation': 'Logaritma üstel fonksiyonun tersidir.'
            }
        ]

        created_count = 0
        for flashcard_data in math_flashcards:
            try:
                # Konuyu bul veya ilk matematik konusunu kullan
                topic = math_topics.filter(name__icontains=flashcard_data['topic_name']).first()
                if not topic:
                    topic = math_topics.first()
                
                flashcard, created = Flashcard.objects.get_or_create(
                    title=flashcard_data['title'],
                    topic=topic,
                    defaults={
                        'question': flashcard_data['question'],
                        'answer': flashcard_data['answer'],
                        'explanation': flashcard_data['explanation']
                    }
                )
                if created:
                    created_count += 1
                    
            except Exception as e:
                self.stdout.write(f'Hata: {flashcard_data["title"]} - {str(e)}')

        self.stdout.write(f'✅ {created_count} matematik flashcard\'ı oluşturuldu.')

    def create_sample_decks(self):
        self.stdout.write('Örnek desteler oluşturuluyor...')
        
        # Admin kullanıcısını bul veya oluştur
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@yon.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()

        # Fizik destesi
        physics_deck, created = FlashcardDeck.objects.get_or_create(
            name='Fizik Temelleri',
            user=admin_user,
            defaults={
                'description': 'Fizik dersinin temel konularını kapsayan flashcard destesi. Newton yasaları, enerji, elektrik ve dalgalar.',
                'is_public': True
            }
        )

        if created:
            physics_cards = Flashcard.objects.filter(topic__subject__name='Fizik')[:8]
            for i, card in enumerate(physics_cards):
                FlashcardDeckItem.objects.get_or_create(
                    deck=physics_deck,
                    flashcard=card,
                    defaults={'order': i}
                )

        # Matematik destesi
        math_deck, created = FlashcardDeck.objects.get_or_create(
            name='Matematik Formülleri',
            user=admin_user,
            defaults={
                'description': 'Matematik dersinin önemli formül ve kavramlarını içeren deste. Türev, integral, trigonometri.',
                'is_public': True
            }
        )

        if created:
            math_cards = Flashcard.objects.filter(topic__subject__name='Matematik')[:5]
            for i, card in enumerate(math_cards):
                FlashcardDeckItem.objects.get_or_create(
                    deck=math_deck,
                    flashcard=card,
                    defaults={'order': i}
                )

        self.stdout.write('✅ Örnek desteler oluşturuldu.')
        self.stdout.write(f'📚 Toplam {FlashcardDeck.objects.count()} deste var.')
        self.stdout.write(f'🗃️ Toplam {Flashcard.objects.count()} flashcard var.') 