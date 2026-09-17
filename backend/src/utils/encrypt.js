import crypto from 'crypto'

const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')

function encrypt(text) {
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    KEY,
    iv
  )

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return {
    encrypted,
    iv: iv.toString('hex'),
  }
}

function decrypt(encrypted, ivHex) {
  const iv = Buffer.from(ivHex, 'hex')

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    KEY,
    iv
  )

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

export { encrypt, decrypt }