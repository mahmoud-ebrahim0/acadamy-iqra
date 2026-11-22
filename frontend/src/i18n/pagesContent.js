// Content of the information pages linked from the footer (About, Terms, Privacy, Refund).
// NOTE: The policy texts are a general starting point – please review them (ideally with a lawyer)
// so they match how the academy actually works before publishing.

export const pagesContent = {
  en: {
    about: {
      title: 'About Tarteel Academy',
      intro: 'Tarteel Academy is an online academy for teaching the Holy Quran, Tajweed, Qira\'at, Arabic and Islamic studies, taught by qualified teachers from Al-Azhar Al-Sharif.',
      sections: [
        { heading: 'Our Mission', text: 'To help students of every age connect with the Book of Allah through correct recitation, understanding and memorization, with a continuous chain of transmission (Sanad) reaching the Prophet ﷺ.' },
        { heading: 'How We Teach', text: 'Classes are live and mostly one-to-one, using the classical method of Talaqqi and Mushafahah (face-to-face recitation). Every student starts with a free evaluation session so we can match them with the right teacher, level and schedule.' },
        { heading: 'Our Teachers', text: 'All our teachers are carefully selected Al-Azhar graduates with long teaching experience, and many of them hold Ijazahs. Female teachers are available for sisters and children.' },
        { heading: 'Who We Teach', text: 'Children, adults and families around the world — from complete beginners learning the Arabic letters to advanced students preparing for an Ijazah.' },
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      intro: 'By creating an account or enrolling in a course at Tarteel Academy, you agree to the following terms.',
      sections: [
        { heading: 'Enrollment & Accounts', text: 'You must provide accurate information when registering. You are responsible for keeping your password secret and for all activity on your account. Parents or guardians enroll on behalf of children under 18.' },
        { heading: 'Classes & Scheduling', text: 'Class times are agreed with the academy. Please attend on time; if you cannot attend, inform your teacher or the academy at least 24 hours in advance so the class can be rescheduled. Classes missed without notice may not be made up.' },
        { heading: 'Payments', text: 'Course fees must be paid in advance using one of the payment methods shown at checkout. An enrollment becomes active once the payment has been confirmed by the academy.' },
        { heading: 'Conduct', text: 'We expect respectful behaviour from students, parents and teachers. The academy may suspend an account in case of abuse, harassment or misuse of the platform.' },
        { heading: 'Changes', text: 'We may update these terms from time to time. The latest version is always available on this page.' },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      intro: 'We respect your privacy. This page explains what information we collect and how we use it.',
      sections: [
        { heading: 'Information We Collect', text: 'Your name, email address, WhatsApp number, the student\'s age and level, the courses you enroll in, payment receipts you upload, and your learning progress and attendance.' },
        { heading: 'How We Use It', text: 'To create your account, arrange your classes, contact you about your learning, confirm payments, and improve our teaching. We do not sell your personal information.' },
        { heading: 'Who Can See It', text: 'Only academy staff who need it to serve you. Your teacher sees your name, contact number, level and progress — not your payment details.' },
        { heading: 'Security', text: 'Passwords are stored encrypted and access to your data requires a secure login. No system is 100% secure, so please choose a strong password and keep it private.' },
        { heading: 'Your Rights', text: 'You may ask us at any time to correct or delete your information by contacting us on WhatsApp.' },
      ],
    },
    refund: {
      title: 'Refund Policy',
      intro: 'We want you to be fully satisfied with your learning experience.',
      sections: [
        { heading: 'Free Evaluation First', text: 'Every new student can take a free evaluation session before paying, to make sure the teacher and level are the right fit.' },
        { heading: 'Before Classes Start', text: 'If you cancel before your first paid class, you are entitled to a full refund.' },
        { heading: 'After Classes Start', text: 'Refunds for the remaining unused classes of the current period can be requested within 7 days of payment. Classes already taken are not refundable.' },
        { heading: 'How to Request', text: 'Contact us on WhatsApp with your registered email address. Approved refunds are sent back using the original payment method.' },
      ],
    },
    contactTitle: 'Have a question?',
    contactText: 'Contact us on WhatsApp and our team will be happy to help.',
    contactButton: 'Chat on WhatsApp',
    coursesTitle: 'All Courses',
    coursesSubtitle: 'Choose the course that fits your level and goals.',
    instructorsPageTitle: 'Our Instructors',
  },

  ar: {
    about: {
      title: 'عن أكاديمية ترتيل',
      intro: 'أكاديمية ترتيل أكاديمية أونلاين لتعليم القرآن الكريم والتجويد والقراءات واللغة العربية والعلوم الشرعية، على يد معلمين مؤهلين من الأزهر الشريف.',
      sections: [
        { heading: 'رسالتنا', text: 'أن نساعد الطلاب من جميع الأعمار على الارتباط بكتاب الله تلاوةً وفهماً وحفظاً، بسند متصل إلى النبي ﷺ.' },
        { heading: 'طريقة التدريس', text: 'الحصص مباشرة وأغلبها فردية، بالطريقة الأصيلة في التلقي والمشافهة. يبدأ كل طالب بجلسة تقييم مجانية لنختار له المعلم والمستوى والمواعيد المناسبة.' },
        { heading: 'معلمونا', text: 'جميع معلمينا من خريجي الأزهر المختارين بعناية وأصحاب خبرة طويلة في التدريس، وكثير منهم من حَمَلة الإجازات. ولدينا معلمات للأخوات والأطفال.' },
        { heading: 'لمن نُعلّم', text: 'للأطفال والكبار والعائلات حول العالم؛ من المبتدئين الذين يتعلمون الحروف العربية إلى الطلاب المتقدمين الساعين للإجازة.' },
      ],
    },
    terms: {
      title: 'الشروط والأحكام',
      intro: 'بإنشاء حساب أو الاشتراك في أي كورس بأكاديمية ترتيل فإنك توافق على الشروط التالية.',
      sections: [
        { heading: 'الاشتراك والحسابات', text: 'يجب إدخال بيانات صحيحة عند التسجيل، وأنت مسؤول عن الحفاظ على سرية كلمة المرور وعن أي نشاط يتم من حسابك. يقوم ولي الأمر بالتسجيل نيابةً عن الأطفال أقل من 18 سنة.' },
        { heading: 'الحصص والمواعيد', text: 'يتم الاتفاق على مواعيد الحصص مع الأكاديمية. نرجو الالتزام بالمواعيد، وفي حالة الاعتذار يُرجى إبلاغ المعلم أو الأكاديمية قبل الحصة بـ 24 ساعة على الأقل لإعادة جدولتها. الحصص التي يتم التغيب عنها دون إبلاغ قد لا يتم تعويضها.' },
        { heading: 'المدفوعات', text: 'تُدفع رسوم الكورس مقدماً بإحدى طرق الدفع الموضحة في صفحة الدفع، ويتم تفعيل الاشتراك بعد تأكيد الأكاديمية لاستلام المبلغ.' },
        { heading: 'السلوك', text: 'نتوقع الاحترام المتبادل بين الطلاب وأولياء الأمور والمعلمين، ويحق للأكاديمية إيقاف أي حساب في حالة الإساءة أو سوء استخدام المنصة.' },
        { heading: 'التعديلات', text: 'قد نقوم بتحديث هذه الشروط من وقت لآخر، وتكون أحدث نسخة متاحة دائماً في هذه الصفحة.' },
      ],
    },
    privacy: {
      title: 'سياسة الخصوصية',
      intro: 'نحن نحترم خصوصيتك، وتوضح هذه الصفحة البيانات التي نجمعها وكيف نستخدمها.',
      sections: [
        { heading: 'البيانات التي نجمعها', text: 'الاسم والبريد الإلكتروني ورقم الواتساب وسن الطالب ومستواه، والكورسات التي تشترك فيها، وإيصالات الدفع التي ترفعها، وتقدمك الدراسي وحضورك.' },
        { heading: 'كيف نستخدمها', text: 'لإنشاء حسابك وتنظيم حصصك والتواصل معك بخصوص دراستك وتأكيد المدفوعات وتحسين التعليم. نحن لا نبيع بياناتك الشخصية.' },
        { heading: 'من يمكنه رؤيتها', text: 'فقط فريق الأكاديمية الذي يحتاجها لخدمتك. يرى المعلم اسمك ورقم التواصل ومستواك وتقدمك، ولا يرى بيانات الدفع.' },
        { heading: 'الحماية', text: 'كلمات المرور محفوظة بشكل مشفر، والوصول لبياناتك يتطلب تسجيل دخول آمن. لا يوجد نظام آمن بنسبة 100%، لذا اختر كلمة مرور قوية واحتفظ بها لنفسك.' },
        { heading: 'حقوقك', text: 'يمكنك في أي وقت أن تطلب منا تصحيح بياناتك أو حذفها بالتواصل معنا على واتساب.' },
      ],
    },
    refund: {
      title: 'سياسة الاسترداد',
      intro: 'نريدك أن تكون راضياً تماماً عن تجربتك التعليمية.',
      sections: [
        { heading: 'التقييم المجاني أولاً', text: 'يحصل كل طالب جديد على جلسة تقييم مجانية قبل الدفع، للتأكد من مناسبة المعلم والمستوى.' },
        { heading: 'قبل بدء الحصص', text: 'إذا ألغيت اشتراكك قبل أول حصة مدفوعة فيحق لك استرداد المبلغ كاملاً.' },
        { heading: 'بعد بدء الحصص', text: 'يمكن طلب استرداد قيمة الحصص المتبقية غير المستخدمة من الفترة الحالية خلال 7 أيام من الدفع، ولا يتم استرداد قيمة الحصص التي تمت بالفعل.' },
        { heading: 'طريقة الطلب', text: 'تواصل معنا على واتساب مع ذكر بريدك الإلكتروني المسجل، ويتم رد المبالغ الموافق عليها بنفس طريقة الدفع الأصلية.' },
      ],
    },
    contactTitle: 'عندك سؤال؟',
    contactText: 'تواصل معنا على واتساب وسيسعد فريقنا بمساعدتك.',
    contactButton: 'تواصل على واتساب',
    coursesTitle: 'كل الكورسات',
    coursesSubtitle: 'اختر الكورس المناسب لمستواك وأهدافك.',
    instructorsPageTitle: 'معلمونا',
  },
};

export const WHATSAPP_NUMBER = '201011927852';
