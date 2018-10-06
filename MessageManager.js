const firebase = require('./Firebase');

class MessageManager {
    constructor() {

    }

    sendSystemMessage(text) {
        let timestamp = this.timestamp;
        let user = {
          name: "Block Party",
          _id: "0",
        }
        firebase.database.ref('messages').push({ text, user, timestamp });
    }
}

messageManager = new MessageManager();

module.exports = messageManager;