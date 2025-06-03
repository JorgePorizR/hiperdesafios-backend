module.exports = {
  generateUuid() {
    const { v4: uuidv4 } = require("uuid");
    return uuidv4();
  },
};