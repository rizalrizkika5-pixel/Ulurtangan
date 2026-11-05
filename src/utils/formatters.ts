// Format Rupiah (IDR)
export function formatIDR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format Indonesian Date: DD MMMM YYYY
export function formatDateID(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(date);
  } catch {
    return dateString;
  }
}

// Format Indonesian DateTime: DD MMMM YYYY, HH:mm
export function formatDateTimeID(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(date);
  } catch {
    return dateString;
  }
}

// Convert username to internal YIUT authentication email alias
export function usernameToInternalEmail(username: string): string {
  const clean = username.trim().toLowerCase();
  return `${clean}@akun.yiut.invalid`;
}

// Convert internal email to username
export function internalEmailToUsername(email: string | null | undefined): string {
  if (!email) return '';
  if (email.endsWith('@akun.yiut.invalid')) {
    return email.replace('@akun.yiut.invalid', '');
  }
  return email.split('@')[0];
}
