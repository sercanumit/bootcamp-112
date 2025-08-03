import { Question } from "@/types";

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "1",
    subject: "Matematik",
    topic: "Türev Uygulamaları",
    difficulty: "Zor",
    questionText:
      "f(x) = x³ - 3x² + 2x + 1 fonksiyonunun yerel minimum noktasının x koordinatı nedir? Bu fonksiyonun türevini alarak kritik noktalarını bulunuz ve ikinci türev testi ile bu noktaların doğasını belirleyiniz.",
    isWrong: true,
    isBookmarked: false,
  },
  {
    id: "2",
    subject: "Matematik",
    topic: "Limit ve Süreklilik",
    difficulty: "Orta",
    questionText:
      "lim(x→2) (x² - 4)/(x - 2) limitinin değeri nedir? Bu limit hesaplanırken hangi yöntem kullanılmalıdır ve neden 0/0 belirsizliği ortaya çıkar?",
    isWrong: true,
    isBookmarked: true,
  },
  {
    id: "3",
    subject: "Fizik",
    topic: "Elektrik ve Manyetizma",
    difficulty: "Zor",
    questionText:
      "Paralel levha kondansatörün kapasitesi 4µF'dır. Levhalar arası mesafe 2mm ve alan 100 cm² olduğuna göre, levhalar arasına dielektrik sabiti 3 olan bir madde yerleştirilirse yeni kapasite değeri ne olur?",
    isWrong: false,
    isBookmarked: true,
  },
  {
    id: "4",
    subject: "Kimya",
    topic: "Asit-Baz Dengesi",
    difficulty: "Kolay",
    questionText:
      "0.1 M HCl çözeltisinin pH değeri kaçtır? HCl güçlü bir asit olduğu için tamamen iyonlaştığını varsayarak hesaplama yapınız ve [H+] konsantrasyonunu bulunuz.",
    isWrong: true,
    isBookmarked: false,
  },
  {
    id: "5",
    subject: "Matematik",
    topic: "İntegral Uygulamaları",
    difficulty: "Orta",
    questionText:
      "∫(2x + 1)dx integralinin sonucu nedir? Bu belirli olmayan integrali hesaplarken hangi kuralları kullanıyorsunuz ve integrasyon sabitini neden ekliyorsunuz?",
    isWrong: false,
    isBookmarked: true,
  },
  {
    id: "6",
    subject: "Biyoloji",
    topic: "Hücre Bölünmesi",
    difficulty: "Orta",
    questionText:
      "Mitoz ve mayoz bölünmeleri arasındaki temel farklar nelerdir? Her iki bölünme türünün hangi hücrelerde gerçekleştiğini ve sonuçlarını açıklayınız.",
    isWrong: false,
    isBookmarked: false,
  },
  {
    id: "7",
    subject: "Fizik",
    topic: "Hareket ve Kuvvet",
    difficulty: "Kolay",
    questionText:
      "5 kg kütleli bir cisim 10 m/s² ivme ile hareket ediyor. Bu cisme etki eden net kuvvet kaç Newton'dur? Newton'un ikinci yasasını kullanarak hesaplayınız.",
    isWrong: true,
    isBookmarked: true,
  },
  {
    id: "8",
    subject: "Kimya",
    topic: "Kimyasal Denge",
    difficulty: "Zor",
    questionText:
      "N₂ + 3H₂ ⇌ 2NH₃ denge tepkimesi için, 2 atm basınçta 500°C'de denge sabiti Kp = 0.5'tir. Bu koşullarda NH₃'ün parsiyel basıncı nedir?",
    isWrong: false,
    isBookmarked: true,
  },
  {
    id: "9",
    subject: "Matematik",
    topic: "Trigonometri",
    difficulty: "Orta",
    questionText:
      "sin²x + cos²x = 1 temel trigonometrik özdeşliğini kullanarak sin(30°) + cos(60°) değerini hesaplayınız ve sonucu basitleştiriniz.",
    isWrong: true,
    isBookmarked: false,
  },
  {
    id: "10",
    subject: "Tarih",
    topic: "Osmanlı İmparatorluğu",
    difficulty: "Kolay",
    questionText:
      "Osmanlı İmparatorluğu hangi yüzyılda kurulmuştur ve ilk padişahı kimdir? Osmanlı'nın kuruluş dönemindeki coğrafi konumu neredeydi?",
    isWrong: false,
    isBookmarked: false,
  },
  {
    id: "11",
    subject: "Coğrafya",
    topic: "İklim Tipleri",
    difficulty: "Orta",
    questionText:
      "Akdeniz ikliminin karakteristik özellikleri nelerdir? Bu iklim tipinin görüldüğü bölgeleri ve bitki örtüsünü açıklayınız.",
    isWrong: false,
    isBookmarked: true,
  },
  {
    id: "12",
    subject: "Fizik",
    topic: "Optik",
    difficulty: "Zor",
    questionText:
      "Odak uzaklığı 20 cm olan ince kenarlı yakınsak mercekten 30 cm uzaklığa yerleştirilen cismin görüntüsü nerede oluşur? Büyütme oranı nedir?",
    isWrong: true,
    isBookmarked: true,
  },
  {
    id: "13",
    subject: "Kimya",
    topic: "Organik Kimya",
    difficulty: "Orta",
    questionText:
      "Alkanlar, alkenler ve alkinler arasındaki yapısal farklar nelerdir? Her grubun genel formülünü yazınız ve bir örnek vererek açıklayınız.",
    isWrong: false,
    isBookmarked: false,
  },
  {
    id: "14",
    subject: "Matematik",
    topic: "Geometri",
    difficulty: "Kolay",
    questionText:
      "Kenar uzunlukları 3, 4 ve 5 birim olan üçgenin alanı kaç birim karedir? Bu üçgenin özel bir özelliği var mıdır?",
    isWrong: true,
    isBookmarked: false,
  },
  {
    id: "15",
    subject: "Biyoloji",
    topic: "Fotosentez",
    difficulty: "Orta",
    questionText:
      "Fotosentez olayının ışık ve karanlık tepkimeleri nelerdir? Bu süreçte hangi organellerde hangi tepkimeler gerçekleşir?",
    isWrong: false,
    isBookmarked: true,
  },
  {
    id: "16",
    subject: "Edebiyat",
    topic: "Nazım Türleri",
    difficulty: "Kolay",
    questionText:
      "Gazel ve kaside arasındaki temel farklar nelerdir? Her iki nazım türünün yapısal özelliklerini ve kullanım amaçlarını açıklayınız.",
    isWrong: false,
    isBookmarked: false,
  },
  {
    id: "17",
    subject: "Fizik",
    topic: "Termodinamik",
    difficulty: "Zor",
    questionText:
      "Termodinamiğin birinci yasası nedir? Bu yasayı kullanarak izobarik bir süreçte gazın yaptığı işi hesaplayınız.",
    isWrong: true,
    isBookmarked: true,
  },
  {
    id: "18",
    subject: "Matematik",
    topic: "Fonksiyonlar",
    difficulty: "Orta",
    questionText:
      "f(x) = 2x + 3 ve g(x) = x² - 1 fonksiyonları için (f∘g)(x) bileşke fonksiyonunu bulunuz ve x = 2 için değerini hesaplayınız.",
    isWrong: false,
    isBookmarked: false,
  },
  {
    id: "19",
    subject: "Kimya",
    topic: "Periyodik Sistem",
    difficulty: "Kolay",
    questionText:
      "Periyodik sistemde aynı grupta bulunan elementlerin ortak özellikleri nelerdir? Alkali metaller grubuna örnek vererek açıklayınız.",
    isWrong: false,
    isBookmarked: true,
  },
  {
    id: "20",
    subject: "Biyoloji",
    topic: "Genetik",
    difficulty: "Zor",
    questionText:
      "Mendel'in birinci yasası nedir? Monohybrit çaprazlamada F2 kuşağında görülen fenotip oranını açıklayınız ve bir örnek veriniz.",
    isWrong: true,
    isBookmarked: false,
  },
];
