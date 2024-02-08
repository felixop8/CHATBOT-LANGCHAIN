import { ChatOpenAI } from "langchain/chat_models/openai"
import { PromptTemplate } from "langchain/prompts"
import { StringOutputParser } from 'langchain/schema/output_parser'
import { RunnableSequence, RunnablePassthrough } from "langchain/schema/runnable"
import retriever from '../utils/retriever.js'
import {combineDocuments} from '../utils/combineDocuments.js'
import formatChatHistory from '../utils/formatChatHistory.js'
import dotenv from 'dotenv'
dotenv.config()
const openAIApiKey = process.env.OPENAI_API_KEY

const chatHistory = []
const generateResponse = async (req, res) => {
  try {
    const {prompt} = req.body
    const llm = new ChatOpenAI({
      openAIApiKey,
      temperature: 0
    })
    
    const standaloneQuestionTemplate = `Given some chat history (if any) and a question, convert it to a standalone question. 
    Chat History: {chat_history} 
    question: {question} 
    standalone question:`
    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

    const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided and the conversation history. Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
    context: {context}
    chat history: {chat_history}
    question: {question}
    answer: `
    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)

    const standaloneQuestionChain = RunnableSequence.from([
      standaloneQuestionPrompt,
      llm,
      new StringOutputParser()
    ])

    const retrieverChain = RunnableSequence.from([
      prevResult => prevResult.standalone_question,
      retriever,
      combineDocuments
    ])

    const answerChain = RunnableSequence.from([
      answerPrompt,
      llm,
      new StringOutputParser()
    ])

    const chain = RunnableSequence.from([
      {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough(),
      },
      {
        context: retrieverChain,
        question: ({original_input}) => original_input.question,
        chat_history: ({original_input}) => original_input.chat_history
      },
      answerChain
    ])

    const response = await chain.invoke(
      {
        question: prompt,
        chat_history: formatChatHistory(chatHistory)
      }
   )
    res.status(200).json({success: true, data: response})
    chatHistory.push([prompt, response])
  } catch (error) {
    console.error(error)
  }

}

export default generateResponse;