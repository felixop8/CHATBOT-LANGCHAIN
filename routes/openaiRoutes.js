import express from 'express'
import generateResponse from "../controllers/openaiController.js";

const router = express.Router()

router.post('/generateResponse', generateResponse)

export default router