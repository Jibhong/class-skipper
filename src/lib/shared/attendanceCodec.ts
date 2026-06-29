/**
 * Attendance Codec
 *
 * Encodes a month of attendance data (31 days × 8 periods) into a compact
 * base64 string. Each day is 1 byte (8 bits → 8 periods), so a full month
 * is 31 bytes → ~44 base64 characters.
 *
 * Bit layout per byte:  bit 0 = period 1, bit 1 = period 2, …, bit 7 = period 8
 * Byte index:           byte 0 = day 1, byte 1 = day 2, …, byte 30 = day 31
 */

const DAYS_IN_BUFFER = 31;
const PERIODS_PER_DAY = 8;

// ---------- helpers ----------

function emptyBuffer(): Uint8Array {
  return new Uint8Array(DAYS_IN_BUFFER);
}

function b64ToBytes(b64: string): Uint8Array {
  if (!b64) return emptyBuffer();
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    // Pad to 31 if shorter (shouldn't happen normally)
    if (bytes.length >= DAYS_IN_BUFFER) return bytes.slice(0, DAYS_IN_BUFFER);
    const padded = emptyBuffer();
    padded.set(bytes);
    return padded;
  } catch {
    return emptyBuffer();
  }
}

function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// ---------- public API ----------

/** Create an empty base64 attendance string (all zeros). */
export function emptyAttendance(): string {
  return bytesToB64(emptyBuffer());
}

/**
 * Decode a base64 attendance string into a 2D boolean array.
 * Returns `boolean[31][8]` — `result[dayIndex][periodIndex]`.
 * Day and period are 0-indexed here.
 */
export function decodeAttendance(b64: string): boolean[][] {
  const bytes = b64ToBytes(b64);
  const result: boolean[][] = [];
  for (let d = 0; d < DAYS_IN_BUFFER; d++) {
    const day: boolean[] = [];
    for (let p = 0; p < PERIODS_PER_DAY; p++) {
      day.push(((bytes[d] >> p) & 1) === 1);
    }
    result.push(day);
  }
  return result;
}

/**
 * Encode a 2D boolean array back into a base64 string.
 * Expects `boolean[31][8]`.
 */
export function encodeAttendance(data: boolean[][]): string {
  const bytes = emptyBuffer();
  for (let d = 0; d < DAYS_IN_BUFFER && d < data.length; d++) {
    let byte = 0;
    for (let p = 0; p < PERIODS_PER_DAY && p < (data[d]?.length ?? 0); p++) {
      if (data[d][p]) byte |= 1 << p;
    }
    bytes[d] = byte;
  }
  return bytesToB64(bytes);
}

/**
 * Toggle or set a single period bit and return the new base64 string.
 * `day` is 1-indexed (1–31), `period` is 1-indexed (1–8).
 */
export function setPeriod(
  b64: string,
  day: number,
  period: number,
  value: boolean,
): string {
  const bytes = b64ToBytes(b64);
  const d = day - 1;
  const p = period - 1;
  if (d < 0 || d >= DAYS_IN_BUFFER || p < 0 || p >= PERIODS_PER_DAY)
    return b64;
  if (value) {
    bytes[d] |= 1 << p;
  } else {
    bytes[d] &= ~(1 << p);
  }
  return bytesToB64(bytes);
}

/**
 * Toggle a single period and return the new base64 string.
 * `day` is 1-indexed (1–31), `period` is 1-indexed (1–8).
 */
export function togglePeriod(b64: string, day: number, period: number): string {
  const bytes = b64ToBytes(b64);
  const d = day - 1;
  const p = period - 1;
  if (d < 0 || d >= DAYS_IN_BUFFER || p < 0 || p >= PERIODS_PER_DAY)
    return b64;
  bytes[d] ^= 1 << p;
  return bytesToB64(bytes);
}

/**
 * Set all 8 periods of a day to `value`. Returns new base64 string.
 * `day` is 1-indexed (1–31).
 */
export function setFullDay(b64: string, day: number, value: boolean): string {
  const bytes = b64ToBytes(b64);
  const d = day - 1;
  if (d < 0 || d >= DAYS_IN_BUFFER) return b64;
  bytes[d] = value ? 0xff : 0x00;
  return bytesToB64(bytes);
}

/**
 * Check if a day is fully attended (all 8 bits set).
 * `day` is 1-indexed.
 */
export function isDayFullyAttended(b64: string, day: number): boolean {
  const bytes = b64ToBytes(b64);
  const d = day - 1;
  if (d < 0 || d >= DAYS_IN_BUFFER) return false;
  return bytes[d] === 0xff;
}

/**
 * Check if a day has any attendance at all.
 * `day` is 1-indexed.
 */
export function isDayPartiallyAttended(b64: string, day: number): boolean {
  const bytes = b64ToBytes(b64);
  const d = day - 1;
  if (d < 0 || d >= DAYS_IN_BUFFER) return false;
  return bytes[d] !== 0;
}

/**
 * Get the attendance for a specific period.
 * `day` is 1-indexed (1–31), `period` is 1-indexed (1–8).
 */
export function getPeriod(b64: string, day: number, period: number): boolean {
  const bytes = b64ToBytes(b64);
  const d = day - 1;
  const p = period - 1;
  if (d < 0 || d >= DAYS_IN_BUFFER || p < 0 || p >= PERIODS_PER_DAY)
    return false;
  return ((bytes[d] >> p) & 1) === 1;
}
