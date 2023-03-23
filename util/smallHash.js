require('dotenv').config();
const {createHmac, randomFillSync} = require('crypto');
const { Buffer } = require('buffer');

/**
 * Small Hash and match algorithm
 * @module smallHash
 * 
 */
var smallHash = module.exports;

/**
 * Prints a hex with salt attached too it
 * @param {string} password 
 * @returns {string}
 */
smallHash.encryptPassword = (password) => {
    const buf = Buffer.alloc(10);
    const salt = randomFillSync(buf).toString('hex') 
    const frontSalt = salt.substring(0, (salt.length / 2))
    const lastSalt = salt.substring((salt.length/ 2), salt.length)
          
    const secretSalt = frontSalt + process.env.SECRET + lastSalt;
    const newPassword = frontSalt + createHmac('sha256', secretSalt).update(password).digest('hex') + lastSalt;
    return newPassword;
}

/**
 * Matches password from the ecryptPassword function
 * @param {string} password - Entry password
 * @param {string} storedPassword - Encrypted password
 * @returns {boolean}
 */
smallHash.matchEncryptedPassword = (password, storedPassword) => {

    const saltLength = 10 * 2;
    const frontSalt = storedPassword.substring(0, saltLength/2)
    const lastSalt = storedPassword.substring(storedPassword.length - (saltLength/2), storedPassword.length)  
    
    const secretSalt = frontSalt + process.env.SECRET + lastSalt;
    let newPassword = frontSalt + createHmac('sha256', secretSalt).update(password).digest('hex') + lastSalt;

    if(newPassword === storedPassword)
        return true;

    return false;
}