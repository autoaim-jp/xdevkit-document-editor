export default {}

export const getHandlerTagChat = ({ handleTagChat }) => {
  return async (req, res) => {
    const { tagId, chatId } = req.body
    console.log({ debug: true, request: 'registerChatInTag', tagId, chatId })

    const result = await handleTagChat({ tagId, chatId })

    res.json({ result })
  }
}

export const getHandlerRegisterTag = ({ handleRegisterTag }) => {
  return async (req, res) => {
    const { tagId, tagTitle } = req.body
    console.log({ debug: true, request: 'addTag', tagTitle })

    const result = await handleRegisterTag({ tagTitle })

    res.json({ result })
  }
}

export const getHandlerRegisterPrompt = ({ handleRegisterPrompt }) => {
  return async (req, res) => {
    const { chatId, chatList, selectedModel } = req.body
    console.log({ debug: true, request: 'ok!', chatId, chatList, selectedModel })

    const handleResult = await handleRegisterPrompt({ chatId, chatList, selectedModel })

    res.json({ result: handleResult })
  }
}

export const getHandlerChatHistory = ({ handleChatHistory }) => {
  return async (req, res) => {
    const { chatIdBefore } = req.query
    console.log({ debug: true, request: 'ok!', chatIdBefore })

    const handleResult = await handleChatHistory({ chatIdBefore })

    res.json({ result: handleResult })
  }
}

export const getChatListHandler = ({ handleChatList }) => {
  return async (req, res) => {
    const { chatId } = req.query
    console.log({ debug: true, request: 'ok!', chatId })

    const handleResult = await handleChatList({ chatId })

    res.json({ result: handleResult })
  }
}

export const getHandlerRenameChat = ({ handleRenameChat }) => {
  return async (req, res) => {
    const { chatId, oldChatTitle, newChatTitle } = req.body
    console.log({ debug: true, request: 'ok!', chatId, oldChatTitle, newChatTitle })

    const handleResult = await handleRenameChat({ chatId, oldChatTitle, newChatTitle })

    res.json({ result: handleResult })
  }
}

export const getHandlerDeleteChat = ({ handleDeleteChat }) => {
  return async (req, res) => {
    const { chatId, chatTitle } = req.body
    console.log({ debug: true, request: 'ok!', chatId, chatTitle })

    const handleResult = await handleDeleteChat({ chatId, chatTitle })

    res.json({ result: handleResult })
  }
}

export const getHandlerTagList = ({ handleTagList }) => {
  return async (req, res) => {
    console.log({ debug: true, request: 'GET Tag List' })

    const handleResult = await handleTagList()

    res.json({ result: handleResult })
  }
}

export const getHandlerTagItemList = ({ handleTagItemList }) => {
  return async (req, res) => {
    console.log({ debug: true, request: 'GET Tag Item List' })

    const handleResult = await handleTagItemList()

    res.json({ result: handleResult })
  }
}


