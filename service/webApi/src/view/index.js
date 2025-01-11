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
        this.fetchHistoryList()
      } catch (error) {
        console.error('Error:', error);
        alert(error.message);
      }
    },
    updateDiagram() {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        renderMermaidDiagram(this.diagram, 'svgContainer');
      }, 1000);
    },
    init() {
      window.addEventListener('load', async () => {
        window.initializeMermaid();
        this.updateDiagram();
        this.showMessage('ロードが完了しました。');  // Add this line to show the message
      });
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
    async fetchChatList(chatId, chatTitle) {
      this.chatId = chatId
      this.chatTitle = chatTitle

      try {
        const response = await fetch(`/api/getChatList?chatId=${chatId}`);
        const data = await response.json();
        this.chatList = data.result;

        const mermaidMatch = data.result[data.result.length - 1].content.match(/```mermaid\n([\s\S]*?)\n```/);
        console.log(mermaidMatch)
        if (mermaidMatch) {
          this.diagram = mermaidMatch[1];
          this.updateDiagram();
        }
      } catch (error) {
        console.error('Error fetching chat list:', error);
      }
    },
    addTag() {
      this.showModal = true;  // Open the modal
    },
    updateTag() {
      alert('タグが更新されました。');
    },
    scrollChatListContainer() {
      Alpine.nextTick(() => { this.$refs.chatListContainer.scrollTop = this.$refs.chatListContainer.scrollHeight })
    },
    submitTag() {
      alert(`新しいタグ名: ${this.tagTitle}`);
      this.tagTitle = ''; // Clear the input after submission
      this.showModal = false; // Close the modal
    },
    async sendMessage() {
      if (!this.inputText.trim()) return;
      const newMessage = { role: 'user', content: this.inputText };
      this.chatList.push(newMessage);

      const messagesToSend = this.chatList.slice(-6);
      this.inputText = '';

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

        const mermaidMatch = botReply.content.match(/```mermaid\n([\s\S]*?)\n```/);
        if (mermaidMatch) {
          this.diagram = mermaidMatch[1];
          this.updateDiagram();
        }
      } catch (error) {
        console.error('Error:', error);
        alert(error.message);
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

