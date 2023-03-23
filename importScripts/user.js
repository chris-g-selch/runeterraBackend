const path = require('path')
console.log(path.resolve('importScripts', '../../.env'))
require('dotenv').config({ path: path.resolve('importScripts', '../../.env')});
const mongoose = require('mongoose');
const userOdm = require("../models/user");
const smallHash = require("../util/smallHash");

console.log(process.env.DATABASE_URL)
//Connect
mongoose.connect(process.env.DATABASE_URL);

let User = {
    username : "Weebstar",
    firstName: "Christopher",
    lastName: "Gholston",
    email: "c.gholston1861@gmail.com",
    password: "1234",
    runeterra:{
        decks:["CECQCAIDCQAQGBASAECAIEADAUBQCCINAQAQIJRHFU2AIAIBAMXACAIEAEAQGAYPAECQGBQCAEAQGMYBAUBQI"],
        rivals:[{
            summoner:"KumaOnKuma",
            tag: "Na1"
        }]
    }
}

User.password = smallHash.encryptPassword(User.password)

// userOdm.deleteOne({username: "Weebstar"}, (err) => {
//     if (err) {
//         console.log(err)
//         return;
//     }

//     console.log("record deleted");
// });

userOdm.create(User, (err, obj) => {
    if (err){ 
        console.log(err);
        return;
    }

    console.log("record created")
});