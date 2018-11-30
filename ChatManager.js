class ChatManager {
    constructor(socketManager) {
        this.messages = {
            items: []
        }
        this.socketManager = socketManager;
    }

    addMessage(playerName, message) {
        const length = this.messages.items.push({ playerName: playerName, message: message });
        this.socketManager.server.emit('chat', this.messages.items[length - 1]);
        console.log("Added chat message:");
        console.log(this.messages.items[length - 1]);
    }
}

module.exports = ChatManager;