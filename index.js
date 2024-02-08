import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import router from './routes/openaiRoutes.js';

dotenv.config()

const port = process.env.PORT || 6000

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Set static folder
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/openai', router)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});