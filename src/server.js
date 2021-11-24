'use strict';

const express = require('express');
const app = express();
require('dotenv').config();


//------------------------------------------------
// Esoteric Resources
//------------------------------------------------

const port = process.env.PORT || 8080;
const errorHandler = require('./error-handlers/500');
const notFoundHandler = require('./error-handlers/404'); 
const logger = require('./middlewares/logger');

//------------------------------------------------
// App MW
//------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);


//------------------------------------------------
// Routes
//------------------------------------------------

app.get('/',(req,res)=>{
    res.send('Server is Up & Running');
})





//------------------------------------------------
// Startin the server
//------------------------------------------------

function start(){
app.listen(port, ()=>{
    console.log(`server is running on port ${port}`);
})
}


//------------------------------------------------
// Error Handlers
//------------------------------------------------
app.get('*', notFoundHandler);
app.use(errorHandler);



module.exports = {
    app: app,
    start: start
}