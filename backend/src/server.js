import 'dotenv/config'

import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import passwordRoutes from './routes/passwords.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Password Manager API running' })
})

app.use('/auth', authRoutes)
app.use('/passwords', passwordRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})