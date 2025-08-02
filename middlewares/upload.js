const multer = require('multer');
const storage = multer.memoryStorage(); // we use buffer, not disk
const upload = multer({ storage });

module.exports = upload;
