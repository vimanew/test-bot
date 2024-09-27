const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    SESSION_ID: process.env.SESSION_ID || 'G2QnxCgK#T5_HoMK5BFw5AMPam402CgzeCHxhkh73x2XvFDuW31U', // Enter Your Session ID
    MONGODB: process.env.MONGODB || 'mongodb+srv://spriky:1234@cluster0.sx9pb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',    // Enter Your MongoDB URL
    Owner: process.env.OwnerNumber || '94776734030',    // Enter Your Owner Number
    BotNumber: process.env.BotNumber || '94776734030'    // Enter Your Bot Number
};

