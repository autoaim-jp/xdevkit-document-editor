function bodyData() {
  return {
    diagram: `sequenceDiagram
           autonumber
           Alice->>John: Hello John, how are you?
           loop HealthCheck
           John->>John: Fight against hypochondria
           end
           Note right of John: Rational thoughts!
           John-->>Alice: Great!
           John->>Bob: How about you?
           Bob-->>John: Jolly good!`,
    timeout: null,
    inputText: '',
    selectedModel: '4o',
    chatId: null,
    chatTitle: 'New Chat',
    chatList: [],
    chatHistoryList: [],
    selectedContentIndex: -1,
    menuOpen: false,
    isMobileMode: false,
    popupIndex: null,
    renameInput: '',
    notificationMessage: '',  // Add this property for the message text
    showNotification: false,  // Add this property to control visibility
    tagTitle: '',  // Add tagTitle property
    showModal: false,  // Add showModal property
    tagItemList: {},  // Add tagItemList to store tags
    selectedTagId: '',  // Track selected tag ID
    viewInfo: '',

    showMessage(message) {
      this.notificationMessage = message;
      this.showNotification = true;
      setTimeout(() => this.showNotification = false, 5 * 1000);  // Hide after 5 seconds
    },
    togglePopup(index) {
      this.popupIndex = this.popupIndex === index ? null : index;
    },
    async renameChat(chatId, chatTitle) {
      this.popupIndex = null; // ポップアップを閉じる
      if (!this.renameInput.trim()) return;
      const newChatTitle = this.renameInput
      this.renameInput = ''

      try {
        const response = await fetch('/api/postRename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, oldChatTitle: chatTitle, newChatTitle }),
        });
        this.fetchHistoryList()
        this.showMessage(`成功: リネーム ${chatTitle} -> ${newChatTitle}`);
      } catch (error) {
        console.error('Error:', error);
        alert(error.message);
      }
    },
    async deleteChat(chatId, chatTitle) {
      // this.chatHistoryList = this.chatHistoryList.filter(chat => chat.chatId !== chatId);
      this.popupIndex = null; // ポップアップを閉じる

      if(!confirm(`チャットを削除しますか？\n${chatTitle}`)) {
        return
      }

      try {
        const response = await fetch('/api/postDelete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, chatTitle }),
        });
        await this.fetchHistoryList()
        this.showMessage(`成功: チャット削除 ${chatTitle}`);

        if(this.chatHistoryList.length === 0) {
          return
        }

        // 最新のチャットを表示
        const { chatId: latestChatId, chatTitle: latestChatTitle } = this.chatHistoryList[0]
        await this.fetchChatList(latestChatId, latestChatTitle)
      } catch (error) {
        console.error('Error:', error);
        alert(error.message);
      }
    },
    updateDiagram() {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        renderMermaidDiagram(this.diagram, 'svgContainer');
        this.showMessage('成功: ロードが完了');
      }, 1000);
    },
    init() {
      window.addEventListener('load', async () => {
        window.initializeMermaid();
        this.updateDiagram();
        await this.fetchTagItemList();  // Fetch tag item list on initialization
      });
    },
    async fetchTagItemList() {
      try {
        const response = await fetch('/api/getTagItemList');
        const data = await response.json();
        this.tagItemList = data.result;
      } catch (error) {
        console.error('Error fetching tag item list:', error);
      }
    },
    async fetchHistoryList() {
      try {
        const response = await fetch('/api/getchatHistory?chatIdBefore=');
        const data = await response.json();
        this.chatHistoryList = data.result;
      } catch (error) {
        console.error('Error fetching history list:', error);
      }
    },
    getMermaidCode(content) {
      const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)\n```/);
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
        this.diagram = mermaidCode;

        // 選択行が変わったならばダイアグラム更新
        if (this.selectedContentIndex !== index) {
          this.selectedContentIndex = index
          this.updateDiagram();
        }

        return true
      } else {
        this.showMessage('失敗: mermaidコードブロックが見つかりません');
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
        await navigator.clipboard.writeText(this.diagram);
        this.showMessage('成功: クリップボードにコピー');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        this.showMessage('失敗: クリップボードコピーできません');
      }
    },
    async resetChatList(chatList) {
      this.chatList = chatList;
      this.selectedContentIndex = -1
    },
    async fetchChatList(chatId, chatTitle) {
      this.chatId = chatId
      this.chatTitle = chatTitle

      try {
        const response = await fetch(`/api/getChatList?chatId=${chatId}`);
        const data = await response.json();
        this.resetChatList(data.result)
        this.loadCodeBlock(this.chatList.length - 1)

        this.showMessage('成功: チャット読み込み');
      } catch (error) {
        console.error('Error fetching chat list:', error);
      }
    },
    addTag() {
      this.showModal = true;  // Open the modal
    },
    updateTag() {
      this.showMessage('成功: タグ更新');
    },
    scrollChatListContainer() {
      Alpine.nextTick(() => { this.$refs.chatListContainer.scrollTop = this.$refs.chatListContainer.scrollHeight })
    },
    async submitTag() {
      if (!this.tagTitle.trim()) {
        this.showMessage('失敗: タグタイトルが未入力');
        return;
      }

      this.showModal = false; // Close the modal

      try {
        const response = await fetch('/api/registerTag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagTitle: this.tagTitle }),
        });

        this.tagTitle = '';
        this.showMessage(`成功: タグ作成 ${this.tagTitle}`);
      } catch (error) {
        console.error('Error:', error);
        this.showMessage('失敗: タグ作成エラー');
      }
    },

    async sendMessage() {
      if (!this.inputText.trim()) return;
      const newMessage = { role: 'user', content: this.inputText };
      this.chatList.push(newMessage);

      const messagesToSend = this.chatList.slice(-6);
      this.inputText = '';
      this.showMessage(`成功: プロンプト送信`);

      try {
        const response = await fetch('/api/postMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: this.chatId,
            chatList: messagesToSend,
            selectedModel: this.selectedModel
          }),
        });

        const data = await response.json();
        if (this.chatId !== data.result.chatId) {
          this.chatId = data.result.chatId
          this.fetchHistoryList()
          console.log('reload history list', this.chatId)
        }

        const botReply = { role: 'assistant', content: data.result.message };
        this.chatList.push(botReply);

        this.loadCodeBlock(this.chatList.length - 1)

      } catch (error) {
        console.error('Error:', error);
        this.showMessage(`失敗: 通信エラー`);
      }
    },
    switchMobileMode() {
      this.isMobileMode = !this.isMobileMode;
      if (this.isMobileMode) {
        this.$refs.miniDisplayForm.classList.remove('hidden');
        this.$refs.chatUiContainer.classList.add('hidden');
        this.$refs.mermaidUiContainer.classList.replace('w-1/2', 'w-full');
      } else {
        this.$refs.miniDisplayForm.classList.add('hidden');
        this.$refs.chatUiContainer.classList.remove('hidden');
        this.$refs.mermaidUiContainer.classList.replace('w-full', 'w-1/2');
      }
    }
  }
}

