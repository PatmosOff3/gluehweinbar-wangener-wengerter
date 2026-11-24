export interface Pin {
  version: 1
  verfahren: 'PBKDF2-SHA-256'
  iterationen: number
  salt: string
  pruefwert: string
}
const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')

async function ableiten(eingabe: string, salt: string, iterationen: number) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(eingabe),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bytes = Uint8Array.from(salt.match(/../g)!, (b) => parseInt(b, 16))
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: bytes, iterations: iterationen },
    key,
    256,
  )
  return hex(new Uint8Array(bits))
}

export async function pinErstellen(eingabe: string): Promise<Pin> {
  if (!/^\d{4,12}$/.test(eingabe))
    throw new Error('Bitte eine PIN aus 4 bis 12 Ziffern wählen.')
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)))
  const iterationen = 600000
  return {
    version: 1,
    verfahren: 'PBKDF2-SHA-256',
    salt,
    iterationen,
    pruefwert: await ableiten(eingabe, salt, iterationen),
  }
}
export async function pinPruefen(eingabe: string, pin: Pin) {
  return (
    pin.version === 1 &&
    pin.verfahren === 'PBKDF2-SHA-256' &&
    (await ableiten(eingabe, pin.salt, pin.iterationen)) === pin.pruefwert
  )
}
