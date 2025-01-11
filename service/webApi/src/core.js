export default {}

const mod = {}

export const init = ({ openaiClient, pgPool, ulid }) => {
  Object.assign(mod, {
    openaiClient,
    pgPool,
    ulid,
  })
}

export const handleRegisterChatInTag = async ({ tagId, chatId }) => {
  const paramList = [tagId, chatId]
  const query = 'UPDATE chat_info.chat_list SET tag_id = $1 WHERE chat_id = $2'
  const { result } = await execQuery({ query, paramList })
  const { rowCount } = result
  return rowCount === 1? 'ok': 'ng'
}


export const handleAddTag = async ({ tagId, tagTitle }) => {
  const paramList = [tagId, tagTitle]
  const query = 'INSERT INTO chat_info.tag_list (tag_id, tag_title) VALUES ($1, $2)'
  const { result } = await execQuery({ query, paramList })
  const { rowCount } = result
  return rowCount === 1? 'ok': 'ng'
}

export const handleTagItemList = async () => {
  const query = 'SELECT * FROM chat_info.chat_history h LEFT JOIN chat_info.tag_list p ON h.tag_id = p.tag_id where h.is_visible = true order BY p.tag_id DESC;'
  const { result } = await execQuery({ query })
  
  const tagItemList = {}
  result.rows.forEach((row) => {
    const { tagId, tagTitle, chatId, chatTitle } = paramSnakeToCamel({ paramList: row })
    if (!tagItemList[tagId]) {
      tagItemList[tagId] = { tagTitle, historyList: [] }
    }
    tagItemList[tagId].historyList.push({ chatId, chatTitle })
  })

  return tagItemList
}

export const handleRegisterPrompt = async ({ chatId, chatList, selectedModel }) => {
  let currentChatId = null
  console.log({ handleRegisterPrompt: true, chatId })
  if (chatId) {
    currentChatId = chatId
  } else {
    currentChatId = mod.ulid()
    await registerChatId({ chatId: currentChatId })
  }

  const prompt = chatList[chatList.length - 1].content
  await registerChat({ chatId: currentChatId, role: 'user', content: prompt })

  const model = selectedModel === 'o1' ? 'o1-preview' : 'gpt-4o'
  console.log({ handleRegisterPrompt: true, chatId, model })
  const stream = await mod.openaiClient.chat.completions.create({
    model,
    messages: chatList,
    stream: true,
    // max_tokens: 8192,
  })
  let responseMessage = ''
  for await (const part of stream) {
    // process.stdout.write(part.choices[0]?.delta?.content || '')
    responseMessage += part.choices[0]?.delta?.content || ''
  }

  await registerChat({ chatId: currentChatId, role: 'assistant', content: responseMessage })

  const handleResult = { chatId: currentChatId, message: responseMessage }
  return handleResult
}

export const handleRenameChat =  async ({ chatId, oldChatTitle, newChatTitle }) => {
  const paramList = [newChatTitle, chatId, oldChatTitle]
  const query = 'update chat_info.chat_history set chat_title = $1 where chat_id = $2 and chat_title = $3'
  const { result } = await execQuery({ query, paramList })
  const { affectedRows } = result
  return affectedRows === 1? 'ok': 'ng'
}

export const handleDeleteChat =  async ({ chatId, chatTitle }) => {
  const paramList = [chatId, chatTitle]
  const query = 'update chat_info.chat_history set is_visible = false where chat_id = $1 and chat_title = $2'
  const { result } = await execQuery({ query, paramList })
  const { affectedRows } = result
  return affectedRows === 1? 'ok': 'ng'
}


export const handleChatHistory = async ({ chatIdBefore }) => {
  const paramList = []
  let query = ''
  if (chatIdBefore) {
    query = 'select chat_id, chat_title from chat_info.chat_history where chat_id <= $1 and is_visible = true order by chat_id desc'
    paramList.push(chatIdBefore)
  } else {
    query = 'select chat_id, chat_title from chat_info.chat_history where is_visible = true order by chat_id desc'
  }
  const { result } = await execQuery({ query, paramList })
  const chatHistory = []
  result.rows.forEach((row) => {
    const { chatId, chatTitle } = paramSnakeToCamel({ paramList: row })
    chatHistory.push({ chatId, chatTitle })
  })

  // return [{ chatId: 'abc', chatTitle: 'title abc', }, { chatId: 'xyz', chatTitle: 'title xyz', }]
  return chatHistory
}

export const handleChatList = async ({ chatId }) => {
  const paramList = [chatId]
  const query = 'select role, content from chat_info.chat_list where chat_id = $1 order by date_registered asc'
  const { result } = await execQuery({ query, paramList })
  const chatList = []
  result.rows.forEach((row) => {
    const { role, content } = row
    chatList.push({ role, content })
  })

  // return [{"role":"user","content":"適当なmindmapをmermaidで出力して。投資に関するもの。"},{"role":"assistant","content":"もちろん、投資に関するマインドマップの例をMermaidで作成できます。以下に示します。\n\n```mermaid\nmindmap\n  root((投資))\n    資産クラス\n      株式\n        個別株\n        ETF\n        投資信託\n      債券\n        国債\n        社債\n      不動産\n        不動産投資信託(REIT)\n        不動産クラウドファンディング\n      商品\n        金\n        原油\n    投資スタイル\n      短期\n      中長期\n      デイトレード\n    リスク管理\n      分散投資\n      損切り\n      ヘッジ\n    分析手法\n      ファンダメンタルズ分析\n        株価収益率(PER)\n        株価純資産倍率(PBR)\n      テクニカル分析\n        移動平均線\n        RSI\n      マクロ経済分析\n        業種サイクル\n        経済指標\n    株式市場\n      国内市場\n      海外市場\n```\n\nこのマインドマップは、投資に関連する基本的な要素を示していますが、具体的な投資戦略や個別のニーズに応じて詳細を追加することもできます。"}]
  return chatList
}

const registerChatId =  async ({ chatId }) => {
  const date = new Date()
  date.setHours(date.getHours() + 9)
  const chatTitle = formatDate({ date })
  const paramList = [chatId, chatTitle]
  const query = 'insert into chat_info.chat_history (chat_id, chat_title) values ($1, $2)'
  const { result } = await execQuery({ query, paramList })
  const { rowCount } = result
  return rowCount === 1? 'ok': 'ng'
}

const registerChat =  async ({ chatId, role, content }) => {
  const paramList = [chatId, role, content]
  const query = 'insert into chat_info.chat_list (chat_id, date_registered, role, content) values ($1, NOW(), $2, $3)'
  const { result } = await execQuery({ query, paramList })
  const { rowCount } = result
  return rowCount === 1? 'ok': 'ng'
}

const execQuery = async ({ query, paramList }) => {
  if (paramList === undefined) {
    paramList = []
  }

  return new Promise((resolve) => {
    mod.pgPool
      .query(query, paramList)
      .then((result) => {
        console.log({ query, paramList, rows: result.rows })
        return resolve({ err: null, result })
      })
      .catch((err) => {
        console.log('Error executing query', { err })
        return resolve({ err, result: null })
      })
  })
}

const formatDate = ({ format, date }) => {
  if (format === undefined) {
    format = 'YYYY-MM-DD hh:mm:ss'
  }
  if (date === undefined) {
    date = new Date()
  }

  return format.replace(/YYYY/g, date.getFullYear())
    .replace(/MM/g, (`0${date.getMonth() + 1}`).slice(-2))
    .replace(/DD/g, (`0${date.getDate()}`).slice(-2))
    .replace(/hh/g, (`0${date.getHours()}`).slice(-2))
    .replace(/mm/g, (`0${date.getMinutes()}`).slice(-2))
    .replace(/ss/g, (`0${date.getSeconds()}`).slice(-2))
}

const paramSnakeToCamel = ({ paramList }) => {
  if (paramList === undefined) {
    paramList = {}
  }

  const newParamList = {}
  Object.entries(paramList).forEach(([key, value]) => {
    const newKey = key.replace(/([_][a-z])/g, (group) => {
      return group.toUpperCase().replace('_', '')
    })
    newParamList[newKey] = value
  })
  return newParamList
}


