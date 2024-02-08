import { SupabaseVectorStore } from "langchain/vectorstores/supabase"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { createClient } from "@supabase/supabase-js"
import dotenv from 'dotenv'
dotenv.config()

const embeddings = new OpenAIEmbeddings(process.env.OPENAI_API_KEY)
const sbApiKey = process.env.SUPABASE_API_KEY
const sbUrl = process.env.SUPABASE_PROJECT_URL
const client = createClient(sbUrl, sbApiKey)

const vectorStore = new SupabaseVectorStore(embeddings, {
  client,
  tableName: 'documents',
  queryName: 'match_documents'
})

// You can increase/reduce the number of chunks retrieved by increasing the limit i.e. vectorStore.asRetriever(10)
const retriever = vectorStore.asRetriever()

export default retriever;