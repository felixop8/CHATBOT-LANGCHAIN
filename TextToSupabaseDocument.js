import fs from 'fs/promises';
import dotenv from 'dotenv'
dotenv.config()
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { createClient } from '@supabase/supabase-js'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';


/**
 * This script reads a text file, splits it into chunks using a text splitter,
 * and stores the chunks as documents in a Supabase vector store.
 */
try {
  const text = await fs.readFile('scrimba-info.txt', 'utf-8');
  
  // A text splitter that splits a string into chunks based on specified parameters.
  const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      separators: ['\n\n', '\n', ' ', ''],
      chunkOverlap: 50
  });
  

  // Creates documents from the given input text.
  const output = await splitter.createDocuments([text]);

  const sbApiKey = process.env.SUPABASE_API_KEY;
  const sbUrl = process.env.SUPABASE_PROJECT_URL;
  const openAIApiKey = process.env.OPENAI_API_KEY;

  const client = createClient(sbUrl, sbApiKey)


  // Stores the chunks as documents in a Supabase vector store.
  await SupabaseVectorStore.fromDocuments(
      output,
      new OpenAIEmbeddings({openAIApiKey}),
      {
          client,
          tableName: 'documents',
      }
  ).then(console.log())
} catch (err) {
  console.log(err);
}



