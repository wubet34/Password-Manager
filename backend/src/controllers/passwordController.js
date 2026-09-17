import db from '../config/db.js'
import { encrypt, decrypt } from '../utils/encrypt.js'

async function createPassword(req, res) {
  try {
    const {
      site_name,
      site_username,
      password,
    } = req.body

    const userId = req.userId

    if (!site_name || !password) {
      return res.status(400).json({
        error: 'site_name and password required',
      })
    }

    const { encrypted, iv } = encrypt(password)

    const result = await db.query(
      `INSERT INTO passwords
       (user_id, site_name, site_username, encrypted_pass, iv)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, site_name, site_username, created_at`,
      [
        userId,
        site_name,
        site_username || '',
        encrypted,
        iv,
      ]
    )

    res.status(201).json({
      message: 'Saved',
      password: result.rows[0],
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      error: 'Server error',
    })
  }
}

async function getPasswords(req, res) {
  try {
    const userId = req.userId

    const result = await db.query(
      `SELECT
         id,
         site_name,
         site_username,
         encrypted_pass,
         iv,
         created_at
       FROM passwords
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )

    const passwords = result.rows.map((row) => ({
      id: row.id,
      site_name: row.site_name,
      site_username: row.site_username,
      password: decrypt(
        row.encrypted_pass,
        row.iv
      ),
      created_at: row.created_at,
    }))

    res.json(passwords)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      error: 'Server error',
    })
  }
}

async function updatePassword(req, res) {
  try {
    const { id } = req.params

    const {
      site_name,
      site_username,
      password,
    } = req.body

    const userId = req.userId

    const existing = await db.query(
      `SELECT id
       FROM passwords
       WHERE id = $1
       AND user_id = $2`,
      [id, userId]
    )

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Password not found',
      })
    }

    if (!site_name || !password) {
      return res.status(400).json({
        error: 'site_name and password required',
      })
    }

    const { encrypted, iv } = encrypt(password)

    await db.query(
      `UPDATE passwords
       SET
         site_name = $1,
         site_username = $2,
         encrypted_pass = $3,
         iv = $4
       WHERE id = $5
       AND user_id = $6`,
      [
        site_name,
        site_username || '',
        encrypted,
        iv,
        id,
        userId,
      ]
    )

    res.json({
      message: 'Updated',
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      error: 'Server error',
    })
  }
}

async function deletePassword(req, res) {
  try {
    const { id } = req.params
    const userId = req.userId

    const result = await db.query(
      `DELETE FROM passwords
       WHERE id = $1
       AND user_id = $2
       RETURNING id`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Password not found',
      })
    }

    res.json({
      message: 'Deleted',
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      error: 'Server error',
    })
  }
}

export {
  createPassword,
  getPasswords,
  updatePassword,
  deletePassword,
}