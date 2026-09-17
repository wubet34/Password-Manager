import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import db from '../config/db.js'

async function register(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be 6+ characters',
      })
    }

    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: 'Email already exists',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await db.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, passwordHash]
    )

    res.status(201).json({
      message: 'Registered',
      user: result.rows[0],
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      error: 'Server error',
    })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required',
      })
    }

    const result = await db.query(
      `SELECT id, email, password_hash
       FROM users
       WHERE email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
      })
    }

    const user = result.rows[0]

    const match = await bcrypt.compare(
      password,
      user.password_hash
    )

    if (!match) {
      return res.status(401).json({
        error: 'Invalid credentials',
      })
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Logged in',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      error: 'Server error',
    })
  }
}

export { register, login }