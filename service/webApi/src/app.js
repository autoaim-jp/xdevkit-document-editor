import dotenv from 'dotenv'
import express from 'express'
import { ulid } from 'ulid'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { OpenAI } from 'openai'
import pg from 'pg'
import path from 'path'

import * as action from './action.js'
import * as core from './core.js'

const asocial = {
  core, action,
}

const a = asocial

const PUBLIC_STATIC_DIR = 'view'
const REGISTER_PROMPT = '/api/postMessage'
const CHAT_HISTORY = '/api/getChatHistory'
const CHAT_LIST = '/api/getChatList'
const RENAME_CHAT = '/api/postRename'
const DELETE_CHAT = '/api/postDelete'
const TAG_LIST = '/api/getTagItemList'
const TAG_CHAT = '/api/tagChat'
const REGISTER_TAG = '/api/registerTag'
const DB_HOST = 'mermaid-chatgpt-editor-postgresql'
const DB_PORT = 5432
const DB_NAME = 'xl_db'
const DB_USER = 'xl_admin'
const DB_PASS = 'xl_pass'
const mod = {}

const _getDefaultRouter = () => {
  const expressRouter = express.Router()

  const appPath = `${path.dirname(new URL(import.meta.url).pathname)}/`
  expressRouter.use(express.static(appPath + PUBLIC_STATIC_DIR, { index: 'index.html', extensions: ['html'] }))

  expressRouter.use(bodyParser.urlencoded({ extended: true }))
  expressRouter.use(bodyParser.json())
  expressRouter.use(cookieParser())

  return expressRouter
}

const _getFunctionRouter = () => {
  const expressRouter = express.Router()

  const registerPromptHandler = a.action.getHandlerRegisterPrompt({
    handleRegisterPrompt: a.core.handleRegisterPrompt
  })
  expressRouter.post(REGISTER_PROMPT, registerPromptHandler)

  const chatHistoryHandler = a.action.getHandlerChatHistory({
    handleChatHistory: a.core.handleChatHistory
  })
  expressRouter.get(CHAT_HISTORY, chatHistoryHandler)

  const chatListHandler = a.action.getChatListHandler({
    handleChatList: a.core.handleChatList
  })
  expressRouter.get(CHAT_LIST, chatListHandler)

  const renameChatHandler = a.action.getHandlerRenameChat({
    handleRenameChat: a.core.handleRenameChat
  })
  expressRouter.post(RENAME_CHAT, renameChatHandler)

  const deleteChatHandler = a.action.getHandlerDeleteChat({
    handleDeleteChat: a.core.handleDeleteChat
  })
  expressRouter.post(DELETE_CHAT, deleteChatHandler)

  const tagItemListHandler = a.action.getHandlerTagItemList({
    handleTagItemList: a.core.handleTagItemList
  })
  expressRouter.get(TAG_LIST, tagItemListHandler)

  const registerTagHandler = a.action.getHandlerRegisterTag({ 
    handleRegisterTag: a.core.handleRegisterTag 
  })
  expressRouter.post(REGISTER_TAG, registerTagHandler) 

  const tagChatHandler = a.action.getHandlerTagChat({ 
    handleTagChat: a.core.handleTagChat 
  })
  expressRouter.post(TAG_CHAT, tagChatHandler) 

  return expressRouter
}

const _getErrorRouter = () => {
  const expressRouter = express.Router()

  expressRouter.get('*', (req, res) => {
    res.status(404)
    return res.end('not found')
  })

  return expressRouter
}


const startServer = ({ app, port }) => {
  app.listen(port, () => {
    console.log(`listen to port: ${port}`)
  })
}

const createPgPool = ({ pg }) => {
  const dbCredential = {
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS,
    max: 5,
    idleTimeoutMillis: 5 * 1000,
    connectionTimeoutMillis: 5 * 1000,
  }

  return new pg.Pool(dbCredential)
}

const init = async () => {
  dotenv.config()

  const OPENAI_CHATGPT_API_KEY = process.env.OPENAI_CHATGPT_API_KEY
  const openaiClient = new OpenAI({
    apiKey: OPENAI_CHATGPT_API_KEY
  })
  mod.openaiClient = openaiClient

  const pgPool = createPgPool({ pg })
  mod.pgPool = pgPool

  a.core.init({ openaiClient, pgPool, ulid })
}

const main = async () => {
  await app.init()
  const expressApp = express()
  expressApp.disable('x-powered-by')

  expressApp.use(_getDefaultRouter())

  expressApp.use(_getFunctionRouter())

  expressApp.use(_getErrorRouter())

  startServer({ app: expressApp, port: process.env.SERVER_PORT })
}

const app = {
  init,
  main,
}

main()

export default app

