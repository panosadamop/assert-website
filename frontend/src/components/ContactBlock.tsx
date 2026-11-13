import { getContact } from '@/lib/cms';
import { getI18n } from '@/lib/i18n';
import { ContactForm } from './ContactForm';

/** Contact form with options and texts from the CMS, in the current language. */
export async function ContactBlock() {
  const { t, lang } = await getI18n();
  const c = await getContact(lang);
  return (
    <ContactForm
      sectors={c.sectorOptions || []}
      products={c.productOptions || []}
      consent={c.consentText}
      success={c.successMessage}
      labels={{
        requiredNote: t('formRequiredNote'),
        name: t('formName'),
        organisation: t('formOrganisation'),
        email: t('formEmail'),
        phone: t('formPhone'),
        sector: t('formSector'),
        product: t('formProduct'),
        select: t('formSelect'),
        message: t('formMessage'),
        send: t('formSend'),
        sending: t('formSending'),
        sentTitle: t('formSentTitle'),
        sentText: t('formSentText'),
        error: t('formError'),
      }}
    />
  );
}
