const alphabet = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const encoder = new TextEncoder();
const shifts = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];
const constants = Array.from({ length: 64 }, (_, i) =>
  Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0
);

function join(...parts) {
  const bytes = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return bytes;
}

function md5(bytes) {
  const length = bytes.length;
  const paddedLength = Math.ceil((length + 9) / 64) * 64;
  const buffer = new ArrayBuffer(paddedLength);
  const padded = new Uint8Array(buffer);
  padded.set(bytes);
  padded[length] = 0x80;
  const view = new DataView(buffer);
  const bitLength = length * 8;
  view.setUint32(paddedLength - 8, bitLength >>> 0, true);
  view.setUint32(paddedLength - 4, Math.floor(bitLength / 0x100000000), true);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;

  for (let offset = 0; offset < paddedLength; offset += 64) {
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    for (let i = 0; i < 64; i++) {
      let f;
      let g;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      const next = (a + f + constants[i] + view.getUint32(offset + g * 4, true)) | 0;
      a = d;
      d = c;
      c = b;
      b = (b + ((next << shifts[i]) | (next >>> (32 - shifts[i])))) | 0;
    }
    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
  }

  const result = new ArrayBuffer(16);
  const output = new DataView(result);
  output.setUint32(0, h0, true);
  output.setUint32(4, h1, true);
  output.setUint32(8, h2, true);
  output.setUint32(12, h3, true);
  return new Uint8Array(result);
}

function to64(value, count) {
  let result = "";
  for (let i = 0; i < count; i++) {
    result += alphabet[value & 0x3f];
    value >>>= 6;
  }
  return result;
}

export function md5Crypt(password, setting) {
  const rawSalt = setting.startsWith("$1$") ? setting.slice(3) : setting;
  const salt = Array.from(rawSalt.split("$")[0]).slice(0, 8).join("");
  const pw = encoder.encode(password);
  const s = encoder.encode(salt);
  const magic = encoder.encode("$1$");
  const alternate = md5(join(pw, s, pw));
  const initial = [pw, magic, s];

  for (let length = pw.length; length > 0; length -= 16) {
    initial.push(alternate.subarray(0, Math.min(16, length)));
  }
  for (let length = pw.length; length > 0; length >>>= 1) {
    initial.push(length & 1 ? new Uint8Array([0]) : pw.subarray(0, 1));
  }

  let final = md5(join(...initial));
  for (let i = 0; i < 1000; i++) {
    const parts = [i & 1 ? pw : final];
    if (i % 3) parts.push(s);
    if (i % 7) parts.push(pw);
    parts.push(i & 1 ? final : pw);
    final = md5(join(...parts));
  }

  const encoded =
    to64((final[0] << 16) | (final[6] << 8) | final[12], 4) +
    to64((final[1] << 16) | (final[7] << 8) | final[13], 4) +
    to64((final[2] << 16) | (final[8] << 8) | final[14], 4) +
    to64((final[3] << 16) | (final[9] << 8) | final[15], 4) +
    to64((final[4] << 16) | (final[10] << 8) | final[5], 4) +
    to64(final[11], 2);

  return `$1$${salt}$${encoded}`;
}

export function generateUnlockKey(serial) {
  return Array.from(md5Crypt("SH_adb_quectel", `$1$${serial}$`)).slice(12, 27).join("");
}
