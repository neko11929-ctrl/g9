import type { Lang } from "@/lib/i18n";

type Doc = { title: string; sections: { h: string; p: string }[] };
const email = () => process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@example.com";

export function legalDoc(doc: string, lang: Lang): Doc | null {
  const e = email();
  const en: Record<string, Doc> = {
    privacy: {
      title: "Privacy Policy",
      sections: [
        { h: "What we collect", p: "NOCTIVA does not require an account to browse or download. When you download a wallpaper we record the wallpaper, the chosen quality, the time, and a salted one-way hash of your IP address. The hash is used only to avoid counting repeated downloads. We never store your raw IP address." },
        { h: "On your device", p: "Your favorites and language choice are stored in your browser (localStorage and a cookie). They never leave your device and can be cleared at any time from your browser settings." },
        { h: "Service providers", p: "The site is hosted on Vercel, data is stored in Supabase, and video files are delivered by Cloudflare R2. These providers process technical data (such as IP addresses) to deliver the service." },
        { h: "Your choices", p: `To ask about or request deletion of any data related to you, contact ${e}.` },
      ],
    },
    terms: {
      title: "Terms of Use",
      sections: [
        { h: "Personal use", p: "Wallpapers are provided for personal, non-commercial use on your own devices. You may not resell, redistribute as your own, or re-upload them as part of a competing wallpaper collection without written permission." },
        { h: "Availability", p: "Content may be changed, unpublished, or removed at any time. Links to removed content will show an unavailable page." },
        { h: "No warranty", p: "The service is provided as is, without warranties of any kind. We are not liable for damages arising from the use of the site or downloaded files." },
      ],
    },
    copyright: {
      title: "Copyright & Content Removal",
      sections: [
        { h: "Our approach", p: "We respect the rights of creators. If you own, or are authorized to represent the owner of, content on NOCTIVA and want it removed, send a request." },
        { h: "How to request removal", p: `Email ${e} with: the link(s) to the content, proof that you own or represent the rights, your name and contact details, and a statement that the information is accurate. We review requests promptly and remove content that infringes.` },
      ],
    },
    contact: {
      title: "Contact",
      sections: [{ h: "Get in touch", p: `For questions, partnerships, or content removal requests, email ${e}.` }],
    },
  };
  const ar: Record<string, Doc> = {
    privacy: {
      title: "سياسة الخصوصية",
      sections: [
        { h: "ما الذي نجمعه", p: "لا يتطلب NOCTIVA إنشاء حساب للتصفح أو التنزيل. عند تنزيل خلفية نسجّل الخلفية والجودة المختارة والوقت ورمزاً مشفّراً أحادي الاتجاه لعنوان IP الخاص بك. يُستخدم الرمز فقط لتجنّب احتساب التنزيلات المتكررة، ولا نخزّن عنوان IP الأصلي أبداً." },
        { h: "على جهازك", p: "تُحفظ مفضلاتك واللغة المختارة في متصفحك (localStorage وملف تعريف ارتباط) ولا تغادر جهازك، ويمكنك حذفها في أي وقت من إعدادات المتصفح." },
        { h: "مزوّدو الخدمة", p: "يُستضاف الموقع على Vercel وتُحفظ البيانات في Supabase وتُقدَّم ملفات الفيديو عبر Cloudflare R2. يعالج هؤلاء المزوّدون بيانات تقنية (مثل عناوين IP) لتقديم الخدمة." },
        { h: "خياراتك", p: `للاستفسار أو طلب حذف أي بيانات تخصّك، راسلنا على ${e}.` },
      ],
    },
    terms: {
      title: "شروط الاستخدام",
      sections: [
        { h: "الاستخدام الشخصي", p: "الخلفيات متاحة للاستخدام الشخصي غير التجاري على أجهزتك. لا يجوز بيعها أو إعادة توزيعها على أنها لك أو إعادة رفعها ضمن مجموعة منافسة دون إذن كتابي." },
        { h: "التوفر", p: "قد يتم تعديل المحتوى أو إلغاء نشره أو حذفه في أي وقت، وستعرض روابط المحتوى المحذوف صفحة «غير متاح»." },
        { h: "إخلاء المسؤولية", p: "تُقدَّم الخدمة كما هي دون أي ضمانات، ولسنا مسؤولين عن أي أضرار ناتجة عن استخدام الموقع أو الملفات المنزّلة." },
      ],
    },
    copyright: {
      title: "حقوق النشر وإزالة المحتوى",
      sections: [
        { h: "نهجنا", p: "نحترم حقوق المبدعين. إذا كنت تملك محتوى منشوراً على NOCTIVA أو مخوَّلاً بتمثيل مالكه وتريد إزالته، أرسل طلباً." },
        { h: "كيفية طلب الإزالة", p: `راسلنا على ${e} مع: رابط (روابط) المحتوى، وما يثبت ملكيتك أو تمثيلك للحقوق، واسمك ووسيلة التواصل معك، وإقراراً بصحة المعلومات. نراجع الطلبات سريعاً ونزيل المحتوى المخالف.` },
      ],
    },
    contact: {
      title: "تواصل معنا",
      sections: [{ h: "راسلنا", p: `للاستفسارات والشراكات وطلبات إزالة المحتوى، راسلنا على ${e}.` }],
    },
  };
  return (lang === "ar" ? ar : en)[doc] ?? null;
}
