const express = require('express');
const router = require('./Routes/Router');
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// All routes from Router.js
app.use('/api', router);


const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});