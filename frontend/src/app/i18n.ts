export interface TranslationSet {
  inbox: string
  compose: string
  search: string
  searchMobile: string
  all: string
  unread: string
  favorites: string
  attachments: string
  online: string
  starred: string
  sent: string
  drafts: string
  spam: string
  trash: string
  emptyInbox: string
  emptySent: string
  emptyStarred: string
  emptyDrafts: string
  emptySpam: string
  emptyTrash: string
  settingsAccount: string
  new: string
}

type SupportedLanguage = 'en' | 'es' | 'fr' | 'hi' | 'ta'

export const getTranslations = (lang: string): TranslationSet => {
  const translations: Record<SupportedLanguage, TranslationSet> = {
    en: { 
      inbox: 'Inbox', compose: 'Compose', search: 'Search mail', searchMobile: 'Search by phone, email...',
      all: 'All', unread: 'Unread', favorites: 'Favorites', attachments: 'Attachments', 
      online: 'Online', starred: 'Starred', sent: 'Sent', drafts: 'Drafts', spam: 'Spam', trash: 'Trash',
      emptyInbox: 'Your inbox is empty!', emptySent: "You haven't sent anything yet!",
      emptyStarred: 'No starred emails yet.', emptyDrafts: 'No drafts saved.',
      emptySpam: 'Hooray, no spam!', emptyTrash: 'Trash is empty.',
      settingsAccount: 'Settings & Account',
      new: 'New'
    },
    es: { 
      inbox: 'Bandeja', compose: 'Redactar', search: 'Buscar correo', searchMobile: 'Buscar por teléfono, correo...',
      all: 'Todo', unread: 'No leídos', favorites: 'Favoritos', attachments: 'Adjuntos', 
      online: 'En línea', starred: 'Destacados', sent: 'Enviados', drafts: 'Borradores', spam: 'Spam', trash: 'Papelera',
      emptyInbox: '¡Tu bandeja está vacía!', emptySent: '¡No has enviado nada!',
      emptyStarred: 'Sin correos destacados.', emptyDrafts: 'Sin borradores.',
      emptySpam: '¡Hurra, no hay spam!', emptyTrash: 'La papelera está vacía.',
      settingsAccount: 'Ajustes y Cuenta',
      new: 'Nuevo'
    },
    fr: { 
      inbox: 'Boîte', compose: 'Rédiger', search: 'Rechercher', searchMobile: 'Rechercher par tél, e-mail...',
      all: 'Tout', unread: 'Non lus', favorites: 'Favoris', attachments: 'Pièces', 
      online: 'En ligne', starred: 'Suivis', sent: 'Envoyés', drafts: 'Brouillons', spam: 'Spam', trash: 'Corbeille',
      emptyInbox: 'Votre boîte est vide !', emptySent: 'Rien envoyé pour l\'instant !',
      emptyStarred: 'Aucun e-mail suivi.', emptyDrafts: 'Aucun brouillon.',
      emptySpam: 'Super, pas de spam !', emptyTrash: 'Corbeille vide.',
      settingsAccount: 'Paramètres',
      new: 'Nouveau'
    },
    hi: { 
      inbox: 'इनबॉक्स', compose: 'लिखें', search: 'मेल खोजें', searchMobile: 'फोन, ईमेल से खोजें...',
      all: 'सभी', unread: 'अपठित', favorites: 'पसंदीदा', attachments: 'अटैचमेंट', 
      online: 'ऑनलाइन', starred: 'तारांकित', sent: 'भेजा गया', drafts: 'ड्राफ्ट', spam: 'स्पैम', trash: 'कचरा',
      emptyInbox: 'आपका इनबॉक्स खाली है!', emptySent: 'आपने अभी तक कुछ नहीं भेजा!',
      emptyStarred: 'कोई तारांकित मेल नहीं.', emptyDrafts: 'कोई ड्राफ्ट नहीं.',
      emptySpam: 'कोई स्पैम नहीं!', emptyTrash: 'कचरा खाली है.',
      settingsAccount: 'सेटिंग्स और खाता',
      new: 'नया'
    },
    ta: { 
      inbox: 'இன்பாக்ஸ்', compose: 'எழுது', search: 'அஞ்சல் தேடுக', searchMobile: 'தொலைபேசி, மின்னஞ்சல் மூலம் தேடுக...',
      all: 'எல்லாம்', unread: 'படிக்காதவை', favorites: 'பிடித்தவை', attachments: 'இணைப்புகள்', 
      online: 'ஆன்லைனில்', starred: 'நட்சத்திரம்', sent: 'அனுப்பப்பட்டவை', drafts: 'வரைவுகள்', spam: 'ஸ்பேம்', trash: 'குப்பை',
      emptyInbox: 'இன்பாக்ஸ் காலியாக உள்ளது!', emptySent: 'நீங்கள் இன்னும் எதையும் அனுப்பவில்லை!',
      emptyStarred: 'நட்சத்திர மின்னஞ்சல்கள் இல்லை.', emptyDrafts: 'வரைவுகள் இல்லை.',
      emptySpam: 'ஸ்பேம் இல்லை!', emptyTrash: 'குப்பை காலியாக உள்ளது.',
      settingsAccount: 'அமைப்புகள் மற்றும் கணக்கு',
      new: 'புதியது'
    }
  }
  return translations[lang as SupportedLanguage] || translations.en
}
