/** Lucide tidak menyertakan logo merek, jadi ikon WhatsApp dibuat sebagai SVG sendiri. */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 21l1.65-4.95A8.5 8.5 0 1 1 8.1 19.4L3 21z" />
      <path d="M9 8.5c.2 2.6 3.4 5.8 6 6l1.3-1.3c.3-.3.3-.7 0-1l-1.2-.9a.7.7 0 0 0-.9.1l-.5.5c-1-.4-2-1.4-2.4-2.4l.5-.5c.3-.3.3-.6.1-.9l-.9-1.2a.7.7 0 0 0-1 0L9 8.5z" />
    </svg>
  );
}