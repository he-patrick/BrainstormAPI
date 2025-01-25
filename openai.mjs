import OpenAI from "openai";
import dotenv from "dotenv";

require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API;


const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [
    {"role": "user", "content": "write a haiku about ai"},
  ],
});

completion.then((result) => console.log(result.choices[0].message));