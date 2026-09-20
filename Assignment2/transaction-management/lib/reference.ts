// lib/reference.ts
// Human-readable transaction reference generator.
// Format: TXN-XXXXXXXX. The DB column is @unique, so duplicates are rejected.

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 for readability

export function generateTransactionReference(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `TXN-${out}`;
}
