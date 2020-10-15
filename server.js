const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const connectDB = require('./config/db');

//connect database
connectDB();

var jsonParser = bodyParser.json()

//init middleware
app.use(jsonParser);

app.get('/', (req, res) => res.send('API Running'))

//define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;
app.listen(PORT,() => console.log(`server started on port ${PORT}`));
