import { Language } from '@/hooks/useThemeStore';

interface TranslationDictionary {
  [key: string]: string;
}

export interface Translations {
  en: TranslationDictionary;
  ar: TranslationDictionary;
  ur: TranslationDictionary;
  fa: TranslationDictionary;
  tr: TranslationDictionary;
}

const translations: Translations = {
  en: {
    // Common
    welcome: 'Assalamu Alaikum',
    welcomeSubtitle: 'Find mosques and events near you',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    apply: 'Apply',
    reset: 'Reset',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    saved: 'Saved',
    share: 'Share',
    
    // Home screen
    upcomingEvents: 'Upcoming Events',
    savedEvents: 'Your Saved Events',
    favoriteMosques: 'Your Favorite Mosques',
    nearbyMosques: 'Nearby Mosques',
    seeAll: 'See All',
    prayerTimes: 'Prayer Times',
    prayerTimesSubtitle: 'Check prayer times at your nearest mosque',
    view: 'View',
    
    // Events
    eventType: 'Event Type',
    allEvents: 'All Events',
    lectures: 'Lectures',
    workshops: 'Workshops',
    community: 'Community',
    charity: 'Charity',
    other: 'Other',
    language: 'Language',
    denomination: 'Denomination',
    proximity: 'Proximity (km)',
    savedEventsOnly: 'Show only saved events',
    noEventsFound: 'No Events Found',
    noEventsFoundMessage: "We couldn't find any events matching your filters.",
    noSavedEventsMessage: "You haven't saved any events yet.",
    noSearchResultsMessage: "We couldn't find any events matching your search.",
    
    // Event details
    aboutEvent: 'About this event',
    getDirections: 'Get Directions',
    notificationsOn: 'Notifications On',
    notificationsOff: 'Notifications Off',
    rateEvent: 'Rate This Event',
    
    // Mosques
    noMosquesFound: 'No Mosques Found',
    noMosquesFoundMessage: "We couldn't find any mosques near your current location.",
    noFavoriteMosquesMessage: "You haven't added any mosques to your favorites yet.",
    noMosquesSearchMessage: "We couldn't find any mosques matching your search.",
    
    // Settings
    preferences: 'Preferences',
    notifications: 'Notifications',
    darkMode: 'Dark Mode',
    timeFormat24: '24-hour Time Format',
    timeFormat12: '12-hour Time Format',
    languageSetting: 'Language',
    about: 'About',
    aboutMosqueFinder: 'About Mosque Finder',
    rateApp: 'Rate the App',
    version: 'Version',
    selectLanguage: 'Select Language',
    
    // Feedback
    feedbackTitle: 'How was your experience?',
    feedbackPrompt: 'Share your thoughts about this event',
    feedbackThankYou: 'Thank you for your feedback!',
    donatePrompt: 'Would you like to donate to this mosque?',
    donate: 'Donate',
    maybeLater: 'Maybe Later',
    submitFeedback: 'Submit Feedback',
  },
  
  ar: {
    // Common
    welcome: 'السلام عليكم',
    welcomeSubtitle: 'ابحث عن المساجد والفعاليات بالقرب منك',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    apply: 'تطبيق',
    reset: 'إعادة ضبط',
    cancel: 'إلغاء',
    close: 'إغلاق',
    save: 'حفظ',
    saved: 'تم الحفظ',
    share: 'مشاركة',
    
    // Home screen
    upcomingEvents: 'الفعاليات القادمة',
    savedEvents: 'الفعاليات المحفوظة',
    favoriteMosques: 'المساجد المفضلة',
    nearbyMosques: 'المساجد القريبة',
    seeAll: 'عرض الكل',
    prayerTimes: 'أوقات الصلاة',
    prayerTimesSubtitle: 'تحقق من أوقات الصلاة في أقرب مسجد',
    view: 'عرض',
    
    // Events
    eventType: 'نوع الفعالية',
    allEvents: 'جميع الفعاليات',
    lectures: 'محاضرات',
    workshops: 'ورش عمل',
    community: 'مجتمع',
    charity: 'خيري',
    other: 'أخرى',
    language: 'اللغة',
    denomination: 'المذهب',
    proximity: 'القرب (كم)',
    savedEventsOnly: 'عرض الفعاليات المحفوظة فقط',
    noEventsFound: 'لم يتم العثور على فعاليات',
    noEventsFoundMessage: 'لم نتمكن من العثور على أي فعاليات تطابق عوامل التصفية الخاصة بك.',
    noSavedEventsMessage: 'لم تقم بحفظ أي فعاليات بعد.',
    noSearchResultsMessage: 'لم نتمكن من العثور على أي فعاليات تطابق بحثك.',
    
    // Event details
    aboutEvent: 'حول هذه الفعالية',
    getDirections: 'الحصول على الاتجاهات',
    notificationsOn: 'الإشعارات مفعلة',
    notificationsOff: 'الإشعارات غير مفعلة',
    rateEvent: 'تقييم هذه الفعالية',
    
    // Mosques
    noMosquesFound: 'لم يتم العثور على مساجد',
    noMosquesFoundMessage: 'لم نتمكن من العثور على أي مساجد بالقرب من موقعك الحالي.',
    noFavoriteMosquesMessage: 'لم تقم بإضافة أي مساجد إلى المفضلة بعد.',
    noMosquesSearchMessage: 'لم نتمكن من العثور على أي مساجد تطابق بحثك.',
    
    // Settings
    preferences: 'التفضيلات',
    notifications: 'الإشعارات',
    darkMode: 'الوضع الداكن',
    timeFormat24: 'تنسيق 24 ساعة',
    timeFormat12: 'تنسيق 12 ساعة',
    languageSetting: 'اللغة',
    about: 'حول',
    aboutMosqueFinder: 'حول تطبيق الباحث عن المساجد',
    rateApp: 'تقييم التطبيق',
    version: 'الإصدار',
    selectLanguage: 'اختر اللغة',
    
    // Feedback
    feedbackTitle: 'كيف كانت تجربتك؟',
    feedbackPrompt: 'شارك أفكارك حول هذه الفعالية',
    feedbackThankYou: 'شكرًا على ملاحظاتك!',
    donatePrompt: 'هل ترغب في التبرع لهذا المسجد؟',
    donate: 'تبرع',
    maybeLater: 'ربما لاحقًا',
    submitFeedback: 'إرسال الملاحظات',
  },
  
  ur: {
    // Common
    welcome: 'السلام علیکم',
    welcomeSubtitle: 'اپنے قریب مساجد اور تقریبات تلاش کریں',
    search: 'تلاش',
    filter: 'فلٹر',
    sort: 'ترتیب دیں',
    apply: 'لاگو کریں',
    reset: 'ری سیٹ',
    cancel: 'منسوخ',
    close: 'بند کریں',
    save: 'محفوظ کریں',
    saved: 'محفوظ شدہ',
    share: 'شیئر کریں',
    
    // Home screen
    upcomingEvents: 'آنے والی تقریبات',
    savedEvents: 'آپ کی محفوظ شدہ تقریبات',
    favoriteMosques: 'آپ کی پسندیدہ مساجد',
    nearbyMosques: 'قریبی مساجد',
    seeAll: 'سب دیکھیں',
    prayerTimes: 'نماز کے اوقات',
    prayerTimesSubtitle: 'اپنی قریب ترین مسجد میں نماز کے اوقات چیک کریں',
    view: 'دیکھیں',
    
    // Events
    eventType: 'تقریب کی قسم',
    allEvents: 'تمام تقریبات',
    lectures: 'لیکچرز',
    workshops: 'ورکشاپس',
    community: 'کمیونٹی',
    charity: 'خیرات',
    other: 'دیگر',
    language: 'زبان',
    denomination: 'مسلک',
    proximity: 'قربت (کیلومیٹر)',
    savedEventsOnly: 'صرف محفوظ شدہ تقریبات دکھائیں',
    noEventsFound: 'کوئی تقریب نہیں ملی',
    noEventsFoundMessage: 'ہم آپ کے فلٹرز سے مطابقت رکھنے والی کوئی تقریب نہیں پا سکے۔',
    noSavedEventsMessage: 'آپ نے ابھی تک کوئی تقریب محفوظ نہیں کی ہے۔',
    noSearchResultsMessage: 'ہم آپ کی تلاش سے مطابقت رکھنے والی کوئی تقریب نہیں پا سکے۔',
    
    // Event details
    aboutEvent: 'اس تقریب کے بارے میں',
    getDirections: 'راستہ حاصل کریں',
    notificationsOn: 'نوٹیفیکیشنز آن',
    notificationsOff: 'نوٹیفیکیشنز آف',
    rateEvent: 'اس تقریب کو ریٹ کریں',
    
    // Mosques
    noMosquesFound: 'کوئی مسجد نہیں ملی',
    noMosquesFoundMessage: 'ہم آپ کے موجودہ مقام کے قریب کوئی مسجد نہیں پا سکے۔',
    noFavoriteMosquesMessage: 'آپ نے ابھی تک کوئی مسجد اپنی پسندیدہ میں شامل نہیں کی ہے۔',
    noMosquesSearchMessage: 'ہم آپ کی تلاش سے مطابقت رکھنے والی کوئی مسجد نہیں پا سکے۔',
    
    // Settings
    preferences: 'ترجیحات',
    notifications: 'نوٹیفیکیشنز',
    darkMode: 'ڈارک موڈ',
    timeFormat24: '24 گھنٹے کا وقت فارمیٹ',
    timeFormat12: '12 گھنٹے کا وقت فارمیٹ',
    languageSetting: 'زبان',
    about: 'تعارف',
    aboutMosqueFinder: 'مسجد فائنڈر کے بارے میں',
    rateApp: 'ایپ کو ریٹ کریں',
    version: 'ورژن',
    selectLanguage: 'زبان منتخب کریں',
    
    // Feedback
    feedbackTitle: 'آپ کا تجربہ کیسا رہا؟',
    feedbackPrompt: 'اس تقریب کے بارے میں اپنے خیالات شیئر کریں',
    feedbackThankYou: 'آپ کی رائے کے لیے شکریہ!',
    donatePrompt: 'کیا آپ اس مسجد کو عطیہ دینا چاہیں گے؟',
    donate: 'عطیہ دیں',
    maybeLater: 'شاید بعد میں',
    submitFeedback: 'رائے جمع کرائیں',
  },
  
  fa: {
    // Common
    welcome: 'سلام علیکم',
    welcomeSubtitle: 'مساجد و رویدادهای نزدیک خود را پیدا کنید',
    search: 'جستجو',
    filter: 'فیلتر',
    sort: 'مرتب‌سازی',
    apply: 'اعمال',
    reset: 'بازنشانی',
    cancel: 'لغو',
    close: 'بستن',
    save: 'ذخیره',
    saved: 'ذخیره شده',
    share: 'اشتراک‌گذاری',
    
    // Home screen
    upcomingEvents: 'رویدادهای آینده',
    savedEvents: 'رویدادهای ذخیره شده شما',
    favoriteMosques: 'مساجد مورد علاقه شما',
    nearbyMosques: 'مساجد نزدیک',
    seeAll: 'دیدن همه',
    prayerTimes: 'اوقات نماز',
    prayerTimesSubtitle: 'اوقات نماز در نزدیک‌ترین مسجد را بررسی کنید',
    view: 'مشاهده',
    
    // Events
    eventType: 'نوع رویداد',
    allEvents: 'همه رویدادها',
    lectures: 'سخنرانی‌ها',
    workshops: 'کارگاه‌ها',
    community: 'اجتماعی',
    charity: 'خیریه',
    other: 'سایر',
    language: 'زبان',
    denomination: 'مذهب',
    proximity: 'نزدیکی (کیلومتر)',
    savedEventsOnly: 'فقط رویدادهای ذخیره شده را نشان بده',
    noEventsFound: 'هیچ رویدادی یافت نشد',
    noEventsFoundMessage: 'ما نتوانستیم هیچ رویدادی مطابق با فیلترهای شما پیدا کنیم.',
    noSavedEventsMessage: 'شما هنوز هیچ رویدادی را ذخیره نکرده‌اید.',
    noSearchResultsMessage: 'ما نتوانستیم هیچ رویدادی مطابق با جستجوی شما پیدا کنیم.',
    
    // Event details
    aboutEvent: 'درباره این رویداد',
    getDirections: 'دریافت مسیر',
    notificationsOn: 'اعلان‌ها روشن',
    notificationsOff: 'اعلان‌ها خاموش',
    rateEvent: 'امتیازدهی به این رویداد',
    
    // Mosques
    noMosquesFound: 'هیچ مسجدی یافت نشد',
    noMosquesFoundMessage: 'ما نتوانستیم هیچ مسجدی نزدیک موقعیت فعلی شما پیدا کنیم.',
    noFavoriteMosquesMessage: 'شما هنوز هیچ مسجدی را به علاقه‌مندی‌های خود اضافه نکرده‌اید.',
    noMosquesSearchMessage: 'ما نتوانستیم هیچ مسجدی مطابق با جستجوی شما پیدا کنیم.',
    
    // Settings
    preferences: 'تنظیمات',
    notifications: 'اعلان‌ها',
    darkMode: 'حالت تاریک',
    timeFormat24: 'قالب زمانی ۲۴ ساعته',
    timeFormat12: 'قالب زمانی ۱۲ ساعته',
    languageSetting: 'زبان',
    about: 'درباره',
    aboutMosqueFinder: 'درباره مسجدیاب',
    rateApp: 'امتیازدهی به برنامه',
    version: 'نسخه',
    selectLanguage: 'انتخاب زبان',
    
    // Feedback
    feedbackTitle: 'تجربه شما چگونه بود؟',
    feedbackPrompt: 'نظرات خود را درباره این رویداد به اشتراک بگذارید',
    feedbackThankYou: 'از بازخورد شما متشکریم!',
    donatePrompt: 'آیا می‌خواهید به این مسجد کمک مالی کنید؟',
    donate: 'اهدا',
    maybeLater: 'شاید بعداً',
    submitFeedback: 'ارسال بازخورد',
  },
  
  tr: {
    // Common
    welcome: 'Selamün Aleyküm',
    welcomeSubtitle: 'Yakınınızdaki camileri ve etkinlikleri bulun',
    search: 'Ara',
    filter: 'Filtrele',
    sort: 'Sırala',
    apply: 'Uygula',
    reset: 'Sıfırla',
    cancel: 'İptal',
    close: 'Kapat',
    save: 'Kaydet',
    saved: 'Kaydedildi',
    share: 'Paylaş',
    
    // Home screen
    upcomingEvents: 'Yaklaşan Etkinlikler',
    savedEvents: 'Kaydettiğiniz Etkinlikler',
    favoriteMosques: 'Favori Camileriniz',
    nearbyMosques: 'Yakındaki Camiler',
    seeAll: 'Tümünü Gör',
    prayerTimes: 'Namaz Vakitleri',
    prayerTimesSubtitle: 'En yakın camideki namaz vakitlerini kontrol edin',
    view: 'Görüntüle',
    
    // Events
    eventType: 'Etkinlik Türü',
    allEvents: 'Tüm Etkinlikler',
    lectures: 'Dersler',
    workshops: 'Atölyeler',
    community: 'Topluluk',
    charity: 'Hayır',
    other: 'Diğer',
    language: 'Dil',
    denomination: 'Mezhep',
    proximity: 'Yakınlık (km)',
    savedEventsOnly: 'Sadece kaydedilen etkinlikleri göster',
    noEventsFound: 'Etkinlik Bulunamadı',
    noEventsFoundMessage: 'Filtrelerinize uyan herhangi bir etkinlik bulamadık.',
    noSavedEventsMessage: 'Henüz hiçbir etkinlik kaydetmediniz.',
    noSearchResultsMessage: 'Aramanıza uyan herhangi bir etkinlik bulamadık.',
    
    // Event details
    aboutEvent: 'Bu etkinlik hakkında',
    getDirections: 'Yol Tarifi Al',
    notificationsOn: 'Bildirimler Açık',
    notificationsOff: 'Bildirimler Kapalı',
    rateEvent: 'Bu Etkinliği Değerlendir',
    
    // Mosques
    noMosquesFound: 'Cami Bulunamadı',
    noMosquesFoundMessage: 'Mevcut konumunuzun yakınında herhangi bir cami bulamadık.',
    noFavoriteMosquesMessage: 'Henüz favorilerinize herhangi bir cami eklemediniz.',
    noMosquesSearchMessage: 'Aramanıza uyan herhangi bir cami bulamadık.',
    
    // Settings
    preferences: 'Tercihler',
    notifications: 'Bildirimler',
    darkMode: 'Karanlık Mod',
    timeFormat24: '24 saat Zaman Formatı',
    timeFormat12: '12 saat Zaman Formatı',
    languageSetting: 'Dil',
    about: 'Hakkında',
    aboutMosqueFinder: 'Cami Bulucu Hakkında',
    rateApp: 'Uygulamayı Değerlendir',
    version: 'Sürüm',
    selectLanguage: 'Dil Seçin',
    
    // Feedback
    feedbackTitle: 'Deneyiminiz nasıldı?',
    feedbackPrompt: 'Bu etkinlik hakkındaki düşüncelerinizi paylaşın',
    feedbackThankYou: 'Geri bildiriminiz için teşekkürler!',
    donatePrompt: 'Bu camiye bağış yapmak ister misiniz?',
    donate: 'Bağış Yap',
    maybeLater: 'Belki Daha Sonra',
    submitFeedback: 'Geri Bildirim Gönder',
  }
};

export default translations;