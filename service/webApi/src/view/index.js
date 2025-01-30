function bodyData() {
  return {
    diagram: null,
    diagramRenderError: '',
    promptTemplateList: {

      /* ======================================== */
      mind: `情報を整理したい。
フォーマットに従い、mermaidのmindmapで出力して。

# フォーマット
\`\`\`mermaid
%% ルール: idはアルファベットとハイフンを自動採番、ラベルは("id: 値")。このルールコメントは消してはいけない。
mindmap
  root("root: 〇〇")
    a("a: 〇〇")
      a-a("a-a: 〇〇")
      a-b("a-b: 〇〇")
    b("b: 〇〇")
\`\`\`

# 目的

# メモ
`,

      /* ======================================== */

      flow: `情報を整理したい。
下書きをフォーマットに従うようにしたい。mermaidのflowchartで出力して。

# フォーマット
\`\`\`mermaid
%% ルール: ルールコメントは消してはいけない。
%% ルール: subgraphのidはアルファベットとハイフンを自動採番
%% ルール: ノードのidはアルファベットとハイフンと数字を自動採番
%% ルール: 全てのラベルは["id: 値"]にする
flowchart LR
  subgraph a["a: ○○"]
    subgraph a-a["a-a: ○○"]
      a-a-1["a-a-1: ○○"]
      a-a-2["a-a-2: ○○"]
    end
    subgraph a-b["a-b: ○○"]
      a-b-1["a-b-1: ○○"]
    end

    %% arrow
    a-a-1 --> |"○○"|a-b-1
  end

  subgraph b["b: ○○"]
    subgraph b-a["b-a: ○○"]
      subgraph b-a-a["b-a-a: ○○"]
        b-a-a-1["b-a-a-1: ○○"]
        b-a-a-2["b-a-a-2: ○○"]
      end
    end  

   %% arrow

  end
\`\`\`

# メモ
`,

      /* ======================================== */

      seq: `情報を整理したい。
メモを参考に、フォーマットに従ってmermaidのsequenceDiagramを出力して。

# フォーマット
\`\`\`mermaid
%% ルール: 各エンティティには個別の役割を与え、対話を詳細に定義。コメントは消さずに参考にしてください。
sequenceDiagram
    autonumber
    actor エンティティA as DescriptionA
    participant エンティティB as DescriptionB
    participant エンティティC as DescriptionC
    participant エンティティD as DescriptionD

    エンティティA->>エンティティB: メッセージの詳細内容
    note over エンティティB: エンティティBの処理や<br/>状態変化に関する説明
    
    エンティティB->>エンティティC: データ送信や命令の説明
    note over エンティティC: 処理の開始やデータ受信

    エンティティC->>エンティティD: 関数呼び出し等の説明
    エンティティD-->>エンティティC: 呼び出し結果やレスポンスの詳細
    
    alt 条件X
        エンティティC->>エンティティA: 条件Xが真の場合の処理
    else 条件Y
        エンティティC-->>エンティティA: 条件Yが真の場合の処理
    end

    note right of エンティティA: 結果の保存や<br/>後続処理に関するコメント
\`\`\`

# メモ
`,

      /* ======================================== */
      gantt: `情報を整理したい。
フォーマットに従い、mermaidのganttで出力して。

# フォーマット
\`\`\`mermaid
gantt
    title タイトル
    dateFormat  YYYY-MM-DD
    excludes weekends
    section マイルストーン
    要件定義の期限     :milestone, 2025-02-06, 1d
    設計の期限         :milestone, 2025-02-27, 1d
    section Group1
    Task in sec      :a1, 2025-01-18  , 7d
    another task      : after a1, 7d
    section Group2
    Task in sec      :b1, 2025-02-07  , 4d
    another task      : after b1, 9d

\`\`\`

# 目的

# メモ
`,

      /* ======================================== */

    },
    diagramTimeout: null,
    messageTimeout: null,
    inputText: '',
    selectedModel: '4o',
    selectedTemplate: '',
    chatId: null,
    chatTitle: null,
    chatList: [],
    chatHistoryList: [],
    selectedContentIndex: -1,
    menuOpen: false,
    isMobileMode: false,
    popupIndex: null,
    isSending: false,  // Add isSending state
    renameInput: '',
    tagRenameInput: '',
    notificationMessage: '',  // Add this property for the message text
    showNotification: false,  // Add this property to control visibility
    tagTitle: '',  // Add tagTitle property
    showModal: false,  // Add showModal property
    tagItemList: {},  // Add tagItemList to store tags
    tagList: {},  // Add tagItemList to store tags
    selectedTagId: '',  // Track selected tag ID
    viewInfo: '',

    showMessage(message) {
      clearTimeout(this.messageTimeout)
      this.notificationMessage = message
      this.showNotification = true
      this.messageTimeout = setTimeout(() => this.showNotification = false, 5 * 1000)  // Hide after 5 seconds
    },
    togglePopup(index) {
      this.popupIndex = this.popupIndex === index ? null : index
    },

    loadPromptTemplate() {
      const promptTemplate = this.promptTemplateList[this.selectedTemplate]
      if(!promptTemplate) {
        return
      }
      if (!confirm('テンプレートを先頭に追加しますか？')) {
        return
      }

      this.inputText = promptTemplate + this.inputText
      this.showMessage(`成功: テンプレート呼び出し${this.selectedTemplate}`)
    },

    async renameChat(chatId, chatTitle) {
      this.popupIndex = null // ポップアップを閉じる
      if (!this.renameInput.trim()) return
      const newChatTitle = this.renameInput
      this.renameInput = ''

      try {
        const response = await fetch('/api/postRename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, oldChatTitle: chatTitle, newChatTitle }),
        })
        this.fetchHistoryList()
        this.fetchTagItemList()
        this.showMessage(`成功: チャットリネーム ${chatTitle} -> ${newChatTitle}`)
      } catch (error) {
        console.error('Error:', error)
        alert(error.message)
      }
    },
    async deleteChat(chatId, chatTitle) {
      // this.chatHistoryList = this.chatHistoryList.filter(chat => chat.chatId !== chatId)
      this.popupIndex = null // ポップアップを閉じる

      if(!confirm(`チャットを削除しますか？\n${chatTitle}`)) {
        return
      }

      try {
        const response = await fetch('/api/postDelete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, chatTitle }),
        })
        this.fetchTagItemList()
        await this.fetchHistoryList()
        this.showMessage(`成功: チャット削除 ${chatTitle}`)

        if(this.chatHistoryList.length === 0) {
          return
        }

        // 最新のチャットを表示
        const { chatId: latestChatId, chatTitle: latestChatTitle } = this.chatHistoryList[0]
        await this.fetchChatList(latestChatId, latestChatTitle)
      } catch (error) {
        console.error('Error:', error)
        alert(error.message)
      }
    },

    async renameTag(tagId, tagTitle) {
      this.showMessage(`成功: タグリネーム ${tagTitle} -> ${"------------------------"}`)
    },
    async deleteTag(tagId, tagTitle) {
      this.showMessage(`成功: タグ削除 ${tagTitle}`)
    },

    updateDiagram() {
      clearTimeout(this.diagramTimeout)
      this.diagramTimeout = setTimeout(async () => {
        this.diagramRenderError = await renderMermaidDiagram(this.diagram, 'svgContainer')
        this.showMessage('成功: ロードが完了')
      }, 1000)
    },
    bodyInit() {
      window.addEventListener('load', async () => {
        window.initializeMermaid()
        this.updateDiagram()
      })

      this.fetchHistoryList()
      this.fetchTagList()
      this.fetchTagItemList()

      this.startNewChat(false)
      const url = new URL(window.location.href)
      this.fetchChatList(url.searchParams.get('chatId'), url.searchParams.get('chatTitle'))
    },
    async fetchTagItemList() {
      try {
        const response = await fetch('/api/getTagItemList')
        const data = await response.json()
        this.tagItemList = data.result
      } catch (error) {
        console.error('Error fetching tag item list:', error)
      }
    },
    async fetchTagList() {
      try {
        const response = await fetch('/api/getTagList')
        const data = await response.json()
        this.tagList = data.result

        // selectのデフォルト値を設定
        if (Object.keys(this.tagList).length === 0) {
          return
        }
        this.selectedTagId = Object.keys(this.tagList)[0]

      } catch (error) {
        console.error('Error fetching tag list:', error)
      }
    },
    async fetchHistoryList() {
      try {
        const response = await fetch('/api/getchatHistory?chatIdBefore=')
        const data = await response.json()
        this.chatHistoryList = data.result
      } catch (error) {
        console.error('Error fetching history list:', error)
      }
    },
    getMermaidCode(content) {
      const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)\n```/)
      if (mermaidMatch && mermaidMatch[1]) {
        return mermaidMatch[1]
      } else {
        return null
      }
    },
    async loadCodeBlock(index) {
      const { role, content } = this.chatList[index]

      // 最新版でないならば世代情報更新
      if (index !== (this.chatList.length -1)) {
        const indexDiff = Math.floor(((this.chatList.length -1) - index) / 2)
        this.viewInfo = `${indexDiff}世代前の${role}`
      } else {
        this.viewInfo = ''
      }

      const mermaidCode = this.getMermaidCode(content)
      console.log({ mermaidCode })
      if (mermaidCode !== null) {
        this.diagram = mermaidCode

        // 選択行が変わったならばダイアグラム更新
        if (this.selectedContentIndex !== index) {
          this.selectedContentIndex = index
          this.updateDiagram()
        }

        return true
      } else {
        this.showMessage('失敗: mermaidコードブロックが見つかりません')
      }

      return false
    },
    async loadAndCopy(index) {
      const isSuccessLoadCodeBlock = await this.loadCodeBlock(index)
      if(!isSuccessLoadCodeBlock) {
        return
      }

      if(!confirm(`コードブロックをコピーしますか？\n（現在コピーしているクリップボードテキストが消えます）`)) {
        return
      }

      try {
        await navigator.clipboard.writeText(this.diagram)
        this.showMessage('成功: クリップボードにコピー')
      } catch (err) {
        console.error('Error copying to clipboard:', err)
        this.showMessage('失敗: クリップボードコピーできません')
      }
    },
    async resetChatList(chatList) {
      this.chatList = chatList
      this.selectedContentIndex = -1
    },
    updateQueryParameter() {
      const url = new URL(window.location.href)
      if (url.searchParams.has("chatId")) {
        url.searchParams.set("chatId", this.chatId)
      } else {
        url.searchParams.append("chatId", this.chatId)
      }

      if (url.searchParams.has("chatTitle")) {
        url.searchParams.set("chatTitle", this.chatTitle)
      } else {
        url.searchParams.append("chatTitle", this.chatTitle)
      }

      window.history.pushState({}, "", url)
    },
    async fetchChatList(chatId, chatTitle) {
      if (chatId === null || chatTitle === null) {
        return
      }
      this.chatId = chatId
      this.chatTitle = chatTitle
      this.menuOpen = false

      try {
        const response = await fetch(`/api/getChatList?chatId=${chatId}`)
        const data = await response.json()
        this.resetChatList(data.result)
        this.loadCodeBlock(this.chatList.length - 1)
        this.updateQueryParameter()

        this.showMessage('成功: チャット読み込み')
      } catch (error) {
        console.error('Error fetching chat list:', error)
      }
    },
    addTag() {
      this.showModal = true  // Open the modal
    },
    async tagChat(chatId, chatTitle) {
      if (!this.selectedTagId || !chatId) {
        this.showMessage('失敗: タグまたはチャットが未選択')
        return
      }

      const currentTagId = this.selectedTagId

      try {
        const response = await fetch('/api/tagChat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagId: this.selectedTagId, chatId: chatId }),
        })

        if (response.ok) {
          this.showMessage(`成功: チャットにタグを追加 ${chatTitle} に ${this.tagList[currentTagId].tagTitle}`)
        } else {
          this.showMessage('失敗: タグ追加エラー')
        }
      } catch (error) {
        console.error('Error:', error)
        this.showMessage('失敗: タグ追加エラー')
      }

      // ポップアップとサイドメニューを消す
      document.body.click()
    },
    scrollChatListContainer() {
      Alpine.nextTick(() => { this.$refs.chatListContainer.scrollTop = this.$refs.chatListContainer.scrollHeight })
    },
    async submitTag() {
      if (!this.tagTitle.trim()) {
        this.showMessage('失敗: タグタイトルが未入力')
        return
      }

      this.showModal = false // Close the modal

      try {
        const response = await fetch('/api/registerTag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagTitle: this.tagTitle }),
        })

        this.tagTitle = ''
        this.showMessage(`成功: タグ作成 ${this.tagTitle}`)
      } catch (error) {
        console.error('Error:', error)
        this.showMessage('失敗: タグ作成エラー')
      }
    },

    async sendMessage() {
      if (!this.inputText.trim() || this.isSending) return
      this.isSending = true
      const newMessage = { role: 'user', content: this.inputText }
      this.chatList.push(newMessage)

      const messagesToSend = this.chatList.slice(-6)
      this.inputText = ''
      this.showMessage(`成功: プロンプト送信`)

      try {
        const response = await fetch('/api/postMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: this.chatId,
            chatList: messagesToSend,
            selectedModel: this.selectedModel
          }),
        })

        const data = await response.json()
        if (this.chatId !== data.result.chatId) {
          this.chatId = data.result.chatId
          this.fetchHistoryList()
          console.log('reload history list', this.chatId)
        }
        this.isSending = false

        const botReply = { role: 'assistant', content: data.result.message }
        this.chatList.push(botReply)

        this.loadCodeBlock(this.chatList.length - 1)

      } catch (error) {
        console.error('Error:', error)
        this.showMessage(`失敗: 通信エラー`)
        this.isSending = false
      }
    },
    switchMobileMode() {
      this.isMobileMode = !this.isMobileMode
      if (this.isMobileMode) {
        this.$refs.miniDisplayForm.classList.remove('hidden')
        this.$refs.chatUiContainer.classList.add('hidden')
        this.$refs.mermaidUiContainer.classList.replace('w-1/2', 'w-full')
      } else {
        this.$refs.miniDisplayForm.classList.add('hidden')
        this.$refs.chatUiContainer.classList.remove('hidden')
        this.$refs.mermaidUiContainer.classList.replace('w-full', 'w-1/2')
      }
    },


    toggleTagItem(tagId) {
      if(this.tagItemList[tagId].isVisible) {
        this.tagItemList[tagId].isVisible = false
      } else {
        this.tagItemList[tagId].isVisible = true
      }
    },

    startNewChat(isResetUrl) {
      this.chatTitle = 'New Chat'
      this.diagram = `flowchart
    チャット内にダイアグラムの記述が見つかりません
           `
      this.updateDiagram()
      this.resetChatList()

      if(isResetUrl) {
        const url = new URL(window.location.href)
        url.search = ''
        window.history.pushState({}, "", url)
      }
    },
  }
}
