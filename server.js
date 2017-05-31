// =============== DEPENDENCIES ================
const express = require('express');
const app = express();

const port = 3050;

// =============== MIDDLEWARE ===================
app.use(express.static('public'));

// =============== LISTENER =====================
app.listen(port, () => console.log("MyFriends App server running on port:", port));
