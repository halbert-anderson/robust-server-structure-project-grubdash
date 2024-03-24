const express = require('express');
const cors = require('cors');

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 5001;

router.get('/', cors(), (req, res) => {
  res.json({ message: 'Hello Render!' });
});

app.use('/', router);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT} `);
});

module.exports = app;


// const { PORT = 5000 } = process.env;

// const path = require("path");
// const app = require(path.resolve(
//   `${process.env.SOLUTION_PATH || ""}`,
//   "src/app"
// ));

// const listener = () => console.log(`Listening on Port ${PORT}!`);
// app.listen(PORT, listener);


