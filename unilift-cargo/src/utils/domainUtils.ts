const SKIP_PAYMENT_EMAIL_DOMAINS: string[] = process.env
  .NEXT_PUBLIC_SKIP_PAYMENT_EMAIL_DOMAINS
  ? process.env.NEXT_PUBLIC_SKIP_PAYMENT_EMAIL_DOMAINS.split(',').map(domain =>
      domain.trim().toLowerCase()
    )
  : [];

export const getEmailDomain = (email: string): string => {
  if (!email || !email.includes('@')) {
    return '';
  }
  return email.split('@')[1].toLowerCase();
};

export const shouldSkipPaymentByEmail = (email: string): boolean => {
  if (!email) {
    return false;
  }

  const emailDomain = getEmailDomain(email);
  const shouldSkip = SKIP_PAYMENT_EMAIL_DOMAINS.includes(emailDomain);

  return shouldSkip;
};
