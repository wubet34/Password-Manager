import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express();

app.use(express.json())
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

