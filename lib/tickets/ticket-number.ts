/** Format lama `NXD-YYMM-XXXX` tetap diterima agar tiket lama masih bisa dilacak. */
export const LEGACY_TICKET_NUMBER_PATTERN = /^NXD-[0-9]{4}-[0-9]{4,}$/;

/** Huruf I/O dan angka 0/1 dibuang supaya token tidak ambigu saat dibaca. */
export const NEW_TICKET_NUMBER_PATTERN =
  /^NXD-[0-9]{4}-[0-9]{3,}-[A-HJ-NP-Z2-9]{4}$/;

export const TICKET_NUMBER_PATTERN =
  /^NXD-[0-9]{4}-(?:[0-9]{4,}|[0-9]{3,}-[A-HJ-NP-Z2-9]{4})$/;

export const TICKET_NUMBER_PLACEHOLDER = "NXD-2611-001-K9M4";

export function isTicketNumber(value: string): boolean {
  return TICKET_NUMBER_PATTERN.test(value.trim().toUpperCase());
}
