require('dotenv').config();

var router = module.exports = require('express').Router();
const axios = require('axios');
const querystring = require("querystring");
const userORM = require('../models/user');
const messageHandler = require('../util/messageHandler');
const smallHash = require('../util/smallHash');
const jwt = require("jsonwebtoken");


//testing purposes only
router.get("/", async (req, res) => {
    try {
        const users = await userORM.find();
        res.status(200).json(users);
    
    } catch(err){
        res.status(500).json({message: err})
    }
})

router.put("/", async (req, res) => {
    try {
        let user = await userORM.findOne({username: req.body.username});
        if(user === undefined){
            res.status(400).json({message: messageHandler.CANT_FIND_USER })    
        }
   
        if (req.body.firstName)  user.firstName = req.body.firstName;
        if (req.body.lastName) user.lastName = req.body.lastName;
        if (req.body.email) user.email = req.body.email;
        
        if(req.body.runeterra.decks) user.runeterra.decks = req.body.runeterra.decks;
        if(req.body.runeterra.rivals) user.runeterra.rivals = req.body.runeterra.rivals;

   
        await user.save();
        let clientSafeUser = user.toJSON()
        clientSafeUser.password = ""

        console.log(clientSafeUser);
        const accessToken = jwt.sign(clientSafeUser, process.env.SECRET)
        console.log(accessToken)
        res.status(200).json({
            user: clientSafeUser,
            token: accessToken
        })
    

    } catch(err) {
        console.log(err);
        res.status(500).json({message: err})
    }

})

router.post("/token", (req, res) => {
    try {
        const token = req.headers['authorization']
        console.log(req.headers);
        console.log(token);
        jwt.verify(token, process.env.SECRET, (err, payload) => {
            if(err) return res.status(403).json(err);
            res.status(200).json(payload)
            
        })
        
    } catch(err) {
        res.status(500).json({message: "testing"})
    }
})

router.get("/google", (req, res) => {
    try {
        console.log(req);
        let code = req.query.code;
        let authuser = req.query.authuser;
        let scope = req.query.scope;
        let prompt = req.query.prompt;

        const url = 'https://oauth2.googleapis.com/token';
        const values = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: "http://localhost:2000/users/google",
            grant_type: 'authorization_code',
          };
        
        axios.post(url, querystring.stringify(values), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
          .then((resa) => console.log(resa.data))
          .catch((error) => {
            console.log(error);
          });

        res.status(200).json({message: "k"})
    } catch (err){
        res.status(500).json({message: err})
    }
})

router.post("/login", async (req, res) => {
    try {
        
        const username = req.body.username;
        const password =  String(req.body.password);
        const redirectLink = req.body.redirectLink;


        const user = await userORM.findOne({ username: username}).exec();
        
        if (user === null) 
            res.status(404).json({ message: messageHandler.CANT_FIND_USER })            
        
    
        if(smallHash.matchEncryptedPassword(password, user.password)){
            let clientSafeUser = user.toJSON()
            clientSafeUser.password = ""
            const accessToken = jwt.sign(clientSafeUser, process.env.SECRET)
          
            res.status(200).json({
                user: clientSafeUser,
                token: accessToken,
                redirectLink: redirectLink
            })
        }
        
    } catch(err) {
        res.status(500).json({ message: err })
    }
})

//Register
router.post("/register", async (req, res) =>{
    try{
        
        let user = new userORM();
        user.username = req.body.username;
        //check password requirements before encryption because cant use validator for it
        user.password = smallHash.encryptPassword(String(req.body.password), process.env.SECRET);

        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        
        let error = user.validateSync();
        if(error){
            res.status(400).json({
                errors: error.errors
            })
            return;
        }
        
        //Unique is not a validation
        user.save((err) => {
            if ( err ){
                res.status(400).json({
                    error: err
                })
            }else{
                const accessToken = jwt.sign(user.toJSON(), process.env.SECRET, {expiresIn: 60 * 15})
                let clientSafeUser = user.toJSON()
                clientSafeUser.password = ""
                res.status(201).json({
                    user: clientSafeUser,
                    token: accessToken,
                    redirectLink: req.redirectLink
                })
            }            
        })
        
    } catch( err) {
        res.status(500).json({message: err })
    }
})

