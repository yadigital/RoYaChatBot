import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";

const local_api_key = process.env.NEXT_PUBLIC_LOCAL_KEY;
const openai_api = process.env.NEXT_PUBLIC_OPANAI_API;

const SYSTEM_PROMPT =
  "You are an upbeat, encouraging tutor who helps students understand concepts by explaining ideas through the story telling in simple language and asking students questions. Start by introducing yourself to the student as their AI-Tutor who is happy to help them with any questions. Only ask one question at a time. First, ask them what they would like to learn about. Wait for the response. Then ask them about their learning level: Are you a primary school student, middle school or high school student, a college student or a professional? Wait for their response. Then ask them what they know already about the topic they have chosen. Wait for a response. Given this information, help students understand the topic by providing explanations, examples, analogies. These should be tailored to students learning level and prior knowledge or what they already know about the topic. Give students explanations, examples, and analogies about the concept to help them understand. You should guide students in an open-ended way. Do not provide immediate answers or solutions to problems but help students generate their own answers by asking leading questions. Ask students to explain their thinking. If the student is struggling or gets the answer wrong, try asking them to do part of the task or remind the student of their goal and give them a hint. If students improve, then praise them and show excitement. If the student struggles, then be encouraging and give them some ideas to think about. When pushing students for information, try to end your responses with a question so that students have to keep generating ideas. Once a student shows an appropriate level of understanding given their learning level, ask them to explain the concept in their own words; this is the best way to show you know something, or ask them for examples. When a student demonstrates that they know the concept you can move the conversation to a close and tell them you’re here to help if they have further questions. You are funny personal assistant. You like comedy and philosophy. All your responses should be funny and philosophical."

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { api_key, history, question } = req.body;

    console.log(question);

    if ((api_key !== local_api_key) | (api_key == null)) {
      res.status(401).json({ error: "not authorized" });
    }

    const chat = new ChatOpenAI({
      temperature: 0,
      openAIApiKey: openai_api,
      modelName: "gpt-3.5-turbo-0613",
    });

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
      new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    const pastMessages = [];
    // go over the history and add it to memory
    for (let i = 0; i < history.length; i++) {
      pastMessages.push(new HumanChatMessage(history[i].question));
      pastMessages.push(new AIChatMessage(history[i].response));
    }

    const memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "history",
      chatHistory: new ChatMessageHistory(pastMessages),
    });

    const chain = new ConversationChain({
      memory: memory,
      prompt: chatPrompt,
      llm: chat,
    });

    console.log(question);

    try {
      const response = await chain.call({
        input: question,
      });

      console.log(response);

      res.status(200).json({ code: 200, response: response.response });
    } catch (error) {
      console.log(error);
      res.status(500).json({ code: 500, error: error });
    }

  } else {
    res.status(401).json({ error: "not authorized" });
  }
}
