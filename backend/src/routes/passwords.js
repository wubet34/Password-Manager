import express from 'express'

import auth from '../middleware/auth.js'

import {
  createPassword,
  getPasswords,
  updatePassword,
  deletePassword,
} from '../controllers/passwordController.js'

const router = express.Router()

router.use(auth)

router.post('/', createPassword)

router.get('/', getPasswords)

router.put('/:id', updatePassword)

router.delete('/:id', deletePassword)

export default router