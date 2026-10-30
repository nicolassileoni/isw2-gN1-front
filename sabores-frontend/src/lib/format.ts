const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function toNumber(value: number | string): number {
  const amount = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(amount) ? amount : 0;
}

function toDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatMoney(value: number | string): string {
  return currencyFormatter.format(toNumber(value));
}

export function formatDate(value: string | Date): string {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : '';
}

export function formatDateTime(value: string | Date): string {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : '';
}

export function normalizeTrackingCode(value: string): string {
  return value.trim().toUpperCase();
}

export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Muestra AAAA-MM-DD como DD/MM/AAAA sin convertir la fecha a UTC. */
export function formatDateInputLabel(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}
