const express = require('express');
const http = require('http');

const app = express();
app.use("/",express.static(__dirname+'/www')); //Filepath must be relative to main nodejs file or we can use dirname for the filepath

http.createServer(app).listen(80,()=>console.log('http server online'));
