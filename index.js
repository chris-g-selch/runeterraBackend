require('dotenv').config();
const mongoose = require('mongoose');

const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express()

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;

//Event listeners
db.on('error', (error) => console.error(error));
db.once('open', ()=> console.log('Connected to Database'));


//Server Config
app.use(express.json());
app.use(cors());



//Routes
const userRouter = require('./routes/user');
const summonerRouter = require('./routes/summoner');

app.use('/users', userRouter);
app.use('/summoner', summonerRouter);
app.get('/', (req, res)=>{
    res.send("hello");
})



app.listen(2000, ()=>{ console.log("started")});