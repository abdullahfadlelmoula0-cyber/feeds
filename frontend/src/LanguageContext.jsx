import { createContext, useContext, useEffect, useState } from 'react'

const translations = {
  en: {
    'app.loading': 'Loading...',

    'layout.appTitle': 'Feed Reservation',
    'layout.logout': 'Logout',
    'layout.nav.feed': 'Feed',
    'layout.nav.reserve': 'Reserve',
    'layout.nav.myReservations': 'My Reservations',
    'layout.nav.notifications': 'Notifications',
    'layout.nav.admin': 'Admin',
    'layout.lang.en': 'EN',
    'layout.lang.ar': 'AR',

    'login.title': 'Sign in',
    'login.subtitle': 'Use your National ID and password.',
    'login.nationalId': 'National ID',
    'login.nationalId.placeholder': 'Enter National ID',
    'login.password': 'Password',
    'login.password.placeholder': 'Enter password',
    'login.submit': 'Sign in',
    'login.submitting': 'Signing in...',
    'login.noAccount': "Don't have an account?",
    'login.registerLink': 'Register',
    'login.error.generic': 'Login failed',

    'register.title': 'Create account',
    'register.subtitle': 'Register with your National ID. No external verification.',
    'register.nationalId': 'National ID Number',
    'register.nationalId.placeholder': 'National ID',
    'register.password': 'Password (min 6 characters)',
    'register.password.placeholder': 'Password',
    'register.confirmPassword': 'Confirm password',
    'register.confirmPassword.placeholder': 'Confirm password',
    'register.submit': 'Register',
    'register.submitting': 'Creating account...',
    'register.haveAccount': 'Already have an account?',
    'register.signInLink': 'Sign in',
    'register.error.mismatch': 'Passwords do not match',
    'register.error.tooShort': 'Password must be at least 6 characters',
    'register.error.generic': 'Registration failed',
    'register.success': 'Registration successful. Please sign in.',

    'feed.title': 'Available feed',
    'feed.subtitle': 'Current stock (approved only). Quantities update after admin approval of reservations.',
    'feed.empty': 'No feed types available.',
    'feed.reserve': 'Reserve',
    'feed.error.generic': 'Failed to load feed types',

    'reserve.title': 'New reservation',
    'reserve.subtitle': 'Create a reservation, then upload your bank transfer receipt when ready.',
    'reserve.feedType': 'Feed type',
    'reserve.feedType.placeholder': 'Select feed type',
    'reserve.quantity': 'Quantity',
    'reserve.quantity.placeholder': 'Amount',
    'reserve.unitPrice': 'Price per unit',
    'reserve.total': 'Total',
    'reserve.submit': 'Create reservation',
    'reserve.submitting': 'Creating...',
    'reserve.error.selectFeed': 'Select a feed type',
    'reserve.error.invalidQty': 'Enter a valid quantity',
    'reserve.error.maxQty': 'Maximum available',
    'reserve.error.generic': 'Failed to create reservation',
    'reserve.error.loadFeed': 'Failed to load feed types',

    'myReservations.title': 'My reservations',
    'myReservations.empty': 'No reservations yet.',
    'myReservations.empty.action': 'Create one',
    'myReservations.empty.fromFeed': 'from the Feed page.',
    'myReservations.error.generic': 'Failed to load',
    'myReservations.total': 'Total',

    'status.pending_payment': 'Pending payment',
    'status.waiting_approval': 'Waiting approval',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',
    'status.auto_rejected': 'Auto-rejected',

    'reservationDetail.title': 'Reservation',
    'reservationDetail.quantity': 'Quantity',
    'reservationDetail.createdAt': 'Created',
    'reservationDetail.unitPrice': 'Unit price',
    'reservationDetail.total': 'Total',
    'reservationDetail.timeLeft': 'Time to upload receipt',
    'reservationDetail.expired':
      'Time limit exceeded. This reservation was auto-rejected. Create a new one from Reserve.',
    'reservationDetail.bank.title': 'Bank transfer details',
    'reservationDetail.bank.accountName': 'Account name',
    'reservationDetail.bank.bank': 'Bank',
    'reservationDetail.bank.accountNumber': 'Account number',
    'reservationDetail.bank.iban': 'IBAN',
    'reservationDetail.upload.label': 'Upload payment receipt (image only)',
    'reservationDetail.upload.choose': 'Choose image',
    'reservationDetail.upload.uploading': 'Uploading...',
    'reservationDetail.error.notFound': 'Not found',
    'reservationDetail.error.invalidImage':
      'Please select an image (JPEG, PNG, WebP, or GIF)',
    'reservationDetail.error.uploadFailed': 'Upload failed',

    'notifications.title': 'Notifications',
    'notifications.empty': 'No notifications.',
    'notifications.error.generic': 'Failed to load',

    'admin.title': 'Admin',
    'admin.subtitle': 'Review and approve or reject reservation requests.',
    'admin.empty': 'No pending reservations.',
    'admin.user': 'User',
    'admin.qty': 'Qty',
    'admin.viewReceipt': 'View receipt image',
    'admin.viewReceipt.loading': 'Loading...',
    'admin.viewReceipt.error': 'Could not load image',
    'admin.approve': 'Approve',
    'admin.reject': 'Reject',
    'admin.error.load': 'Failed to load',
    'admin.error.approve': 'Approve failed',
    'admin.error.reject': 'Reject failed',
    'admin.tab.reservations': 'Reservations',
    'admin.tab.feed': 'Feed Management',
    'admin.tab.bank': 'Bank Info',
    'admin.tab.users': 'Users',
    'admin.feed.title': 'Manage Feed Types',
    'admin.feed.add': 'Add Feed Type',
    'admin.feed.edit': 'Edit',
    'admin.feed.delete': 'Delete',
    'admin.feed.name': 'Name',
    'admin.feed.description': 'Description',
    'admin.feed.quantity': 'Quantity',
    'admin.feed.unit': 'Unit',
    'admin.feed.price': 'Price',
    'admin.feed.save': 'Save',
    'admin.feed.cancel': 'Cancel',
    'admin.feed.empty': 'No feed types.',
    'admin.feed.deleteConfirm': 'Delete this feed type?',
    'admin.feed.deleteError': 'Cannot delete feed type with pending reservations.',
    'admin.feed.hasReservations': 'Has pending reservations; cannot delete.',
    'admin.feed.error.create': 'Failed to create feed type',
    'admin.feed.error.update': 'Failed to update feed type',
    'admin.feed.error.delete': 'Failed to delete feed type',
    'admin.bank.title': 'Bank Payment Information',
    'admin.bank.accountName': 'Account Name',
    'admin.bank.bankName': 'Bank Name',
    'admin.bank.accountNumber': 'Account Number',
    'admin.bank.iban': 'IBAN',
    'admin.bank.save': 'Save Bank Info',
    'admin.bank.saved': 'Bank information saved successfully!',
    'admin.bank.error.load': 'Failed to load bank info',
    'admin.bank.error.save': 'Failed to save bank info',
    'admin.users.title': 'User Management',
    'admin.users.add': 'Add User',
    'admin.users.nationalId': 'National ID',
    'admin.users.password': 'Password',
    'admin.users.role': 'Role',
    'admin.users.roleUser': 'User',
    'admin.users.roleAdmin': 'Admin',
    'admin.users.save': 'Create User',
    'admin.users.cancel': 'Cancel',
    'admin.users.empty': 'No users yet.',
    'admin.users.delete': 'Delete',
    'admin.users.deleteConfirm': 'Delete this user?',
    'admin.users.createdAt': 'Created',
    'admin.users.hasReservations': 'Has pending reservations; cannot delete.',
    'admin.users.cannotDeleteSelf': 'Cannot delete your own account.',
    'admin.users.cannotDeleteLastAdmin': 'Cannot delete the last admin.',
    'admin.users.error.load': 'Failed to load users',
    'admin.users.error.create': 'Failed to create user',
    'admin.users.error.delete': 'Failed to delete user',
    'admin.users.error.required': 'National ID and password are required',
    'admin.users.error.passwordLength': 'Password must be at least 6 characters',
  },
  ar: {
    'app.loading': 'جارٍ التحميل...',

    'layout.appTitle': 'حجز الأعلاف',
    'layout.logout': 'تسجيل الخروج',
    'layout.nav.feed': 'الأعلاف',
    'layout.nav.reserve': 'حجز جديد',
    'layout.nav.myReservations': 'حجوزاتي',
    'layout.nav.notifications': 'الإشعارات',
    'layout.nav.admin': 'لوحة المشرف',
    'layout.lang.en': 'EN',
    'layout.lang.ar': 'ع',

    'login.title': 'تسجيل الدخول',
    'login.subtitle': 'استخدم رقم الهوية الوطنية وكلمة المرور.',
    'login.nationalId': 'رقم الهوية الوطنية',
    'login.nationalId.placeholder': 'أدخل رقم الهوية الوطنية',
    'login.password': 'كلمة المرور',
    'login.password.placeholder': 'أدخل كلمة المرور',
    'login.submit': 'دخول',
    'login.submitting': 'جاري تسجيل الدخول...',
    'login.noAccount': 'ليس لديك حساب؟',
    'login.registerLink': 'إنشاء حساب',
    'login.error.generic': 'فشل في تسجيل الدخول',

    'register.title': 'إنشاء حساب',
    'register.subtitle': 'سجّل باستخدام رقم الهوية الوطنية. لا يوجد تحقق خارجي.',
    'register.nationalId': 'رقم الهوية الوطنية',
    'register.nationalId.placeholder': 'رقم الهوية الوطنية',
    'register.password': 'كلمة المرور (6 أحرف على الأقل)',
    'register.password.placeholder': 'كلمة المرور',
    'register.confirmPassword': 'تأكيد كلمة المرور',
    'register.confirmPassword.placeholder': 'تأكيد كلمة المرور',
    'register.submit': 'تسجيل',
    'register.submitting': 'جاري إنشاء الحساب...',
    'register.haveAccount': 'لديك حساب بالفعل؟',
    'register.signInLink': 'تسجيل الدخول',
    'register.error.mismatch': 'كلمتا المرور غير متطابقتين',
    'register.error.tooShort': 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
    'register.error.generic': 'فشل في إنشاء الحساب',
    'register.success': 'تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول.',

    'feed.title': 'الأعلاف المتاحة',
    'feed.subtitle':
      'المخزون المتاح (المعتمد فقط). يتم تحديث الكميات بعد موافقة المشرف على الحجز.',
    'feed.empty': 'لا توجد أنواع أعلاف متاحة.',
    'feed.reserve': 'حجز',
    'feed.error.generic': 'فشل في تحميل أنواع الأعلاف',

    'reserve.title': 'حجز جديد',
    'reserve.subtitle':
      'أنشئ حجزاً ثم ارفع إيصال التحويل البنكي عند جاهزيته.',
    'reserve.feedType': 'نوع العلف',
    'reserve.feedType.placeholder': 'اختر نوع العلف',
    'reserve.quantity': 'الكمية',
    'reserve.quantity.placeholder': 'الكمية',
    'reserve.unitPrice': 'السعر للوحدة',
    'reserve.total': 'الإجمالي',
    'reserve.submit': 'إنشاء الحجز',
    'reserve.submitting': 'جاري إنشاء الحجز...',
    'reserve.error.selectFeed': 'اختر نوع العلف',
    'reserve.error.invalidQty': 'أدخل كمية صحيحة',
    'reserve.error.maxQty': 'الحد الأقصى المتاح',
    'reserve.error.generic': 'فشل في إنشاء الحجز',
    'reserve.error.loadFeed': 'فشل في تحميل أنواع الأعلاف',

    'myReservations.title': 'حجوزاتي',
    'myReservations.empty': 'لا توجد حجوزات بعد.',
    'myReservations.empty.action': 'قم بإنشاء حجز',
    'myReservations.empty.fromFeed': 'من صفحة الأعلاف.',
    'myReservations.error.generic': 'فشل في التحميل',
    'myReservations.total': 'الإجمالي',

    'status.pending_payment': 'بانتظار الدفع',
    'status.waiting_approval': 'بانتظار الموافقة',
    'status.approved': 'معتمد',
    'status.rejected': 'مرفوض',
    'status.auto_rejected': 'مرفوض تلقائياً',

    'reservationDetail.title': 'الحجز',
    'reservationDetail.quantity': 'الكمية',
    'reservationDetail.createdAt': 'تاريخ الإنشاء',
    'reservationDetail.unitPrice': 'سعر الوحدة',
    'reservationDetail.total': 'الإجمالي',
    'reservationDetail.timeLeft': 'الوقت المتبقي لرفع الإيصال',
    'reservationDetail.expired':
      'انتهت المدة. تم إلغاء هذا الحجز تلقائياً. يرجى إنشاء حجز جديد.',
    'reservationDetail.bank.title': 'بيانات التحويل البنكي',
    'reservationDetail.bank.accountName': 'اسم الحساب',
    'reservationDetail.bank.bank': 'البنك',
    'reservationDetail.bank.accountNumber': 'رقم الحساب',
    'reservationDetail.bank.iban': 'الآيبان',
    'reservationDetail.upload.label': 'ارفع صورة إيصال التحويل (صورة فقط)',
    'reservationDetail.upload.choose': 'اختيار صورة',
    'reservationDetail.upload.uploading': 'جاري الرفع...',
    'reservationDetail.error.notFound': 'غير موجود',
    'reservationDetail.error.invalidImage':
      'يرجى اختيار ملف صورة (JPEG أو PNG أو WebP أو GIF)',
    'reservationDetail.error.uploadFailed': 'فشل في رفع الملف',

    'notifications.title': 'الإشعارات',
    'notifications.empty': 'لا توجد إشعارات.',
    'notifications.error.generic': 'فشل في التحميل',

    'admin.title': 'لوحة المشرف',
    'admin.subtitle': 'مراجعة طلبات الحجز والموافقة عليها أو رفضها.',
    'admin.empty': 'لا توجد طلبات حجز قيد الانتظار.',
    'admin.user': 'المستخدم',
    'admin.qty': 'الكمية',
    'admin.viewReceipt': 'عرض صورة الإيصال',
    'admin.viewReceipt.loading': 'جاري التحميل...',
    'admin.viewReceipt.error': 'تعذر تحميل الصورة',
    'admin.approve': 'اعتماد',
    'admin.reject': 'رفض',
    'admin.error.load': 'فشل في التحميل',
    'admin.error.approve': 'فشل في الاعتماد',
    'admin.error.reject': 'فشل في الرفض',
    'admin.tab.reservations': 'الحجوزات',
    'admin.tab.feed': 'إدارة الأعلاف',
    'admin.tab.bank': 'معلومات البنك',
    'admin.tab.users': 'المستخدمون',
    'admin.feed.title': 'إدارة أنواع الأعلاف',
    'admin.feed.add': 'إضافة نوع علف',
    'admin.feed.edit': 'تعديل',
    'admin.feed.delete': 'حذف',
    'admin.feed.name': 'الاسم',
    'admin.feed.description': 'الوصف',
    'admin.feed.quantity': 'الكمية',
    'admin.feed.unit': 'الوحدة',
    'admin.feed.price': 'السعر',
    'admin.feed.save': 'حفظ',
    'admin.feed.cancel': 'إلغاء',
    'admin.feed.empty': 'لا توجد أنواع أعلاف.',
    'admin.feed.deleteConfirm': 'حذف نوع العلف هذا؟',
    'admin.feed.deleteError': 'لا يمكن حذف نوع العلف الذي يحتوي على حجوزات قيد الانتظار.',
    'admin.feed.hasReservations': 'يوجد حجوزات قيد الانتظار؛ لا يمكن الحذف.',
    'admin.feed.error.create': 'فشل في إنشاء نوع العلف',
    'admin.feed.error.update': 'فشل في تحديث نوع العلف',
    'admin.feed.error.delete': 'فشل في حذف نوع العلف',
    'admin.bank.title': 'معلومات الدفع البنكي',
    'admin.bank.accountName': 'اسم الحساب',
    'admin.bank.bankName': 'اسم البنك',
    'admin.bank.accountNumber': 'رقم الحساب',
    'admin.bank.iban': 'الآيبان',
    'admin.bank.save': 'حفظ معلومات البنك',
    'admin.bank.saved': 'تم حفظ معلومات البنك بنجاح!',
    'admin.bank.error.load': 'فشل في تحميل معلومات البنك',
    'admin.bank.error.save': 'فشل في حفظ معلومات البنك',
    'admin.users.title': 'إدارة المستخدمين',
    'admin.users.add': 'إضافة مستخدم',
    'admin.users.nationalId': 'رقم الهوية الوطنية',
    'admin.users.password': 'كلمة المرور',
    'admin.users.role': 'الدور',
    'admin.users.roleUser': 'مستخدم',
    'admin.users.roleAdmin': 'مشرف',
    'admin.users.save': 'إنشاء مستخدم',
    'admin.users.cancel': 'إلغاء',
    'admin.users.empty': 'لا يوجد مستخدمون بعد.',
    'admin.users.delete': 'حذف',
    'admin.users.deleteConfirm': 'حذف هذا المستخدم؟',
    'admin.users.createdAt': 'تاريخ الإنشاء',
    'admin.users.hasReservations': 'يوجد حجوزات قيد الانتظار؛ لا يمكن الحذف.',
    'admin.users.cannotDeleteSelf': 'لا يمكن حذف حسابك الشخصي.',
    'admin.users.cannotDeleteLastAdmin': 'لا يمكن حذف آخر مشرف.',
    'admin.users.error.load': 'فشل في تحميل المستخدمين',
    'admin.users.error.create': 'فشل في إنشاء المستخدم',
    'admin.users.error.delete': 'فشل في حذف المستخدم',
    'admin.users.error.required': 'رقم الهوية وكلمة المرور مطلوبان',
    'admin.users.error.passwordLength': 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en')

  useEffect(() => {
    const stored = window.localStorage.getItem('lang')
    const initial = stored === 'ar' || stored === 'en' ? stored : 'en'
    applyLang(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyLang = (value) => {
    setLangState(value)
    try {
      window.localStorage.setItem('lang', value)
    } catch {
      // ignore
    }
    const dir = value === 'ar' ? 'rtl' : 'ltr'
    const html = document.documentElement
    html.setAttribute('lang', value === 'ar' ? 'ar' : 'en')
    html.setAttribute('dir', dir)
  }

  const setLang = (value) => {
    applyLang(value)
  }

  const t = (key) => {
    return translations[lang]?.[key] ?? translations.en[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}

