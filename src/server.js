// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// const port = 3000;

// // Parse JSON request body
// app.use(bodyParser.json());

// // Handle file upload POST request
// app.post('/upload', (req, res) => {
//   const fileName = req.body.fileName;
//   const date = req.body.date;
//   console.log(fileName); // Handle the file name data
//   console.log(date);
//   res.json({ message: 'File name received' });
// });

// // Handle root URL
// app.get('/', (req, res) => {
//   res.send('Hello, World!');
// });

// app.listen(port, () => {
//   console.log(`Server listening at http://localhost:${port}`);
// });

