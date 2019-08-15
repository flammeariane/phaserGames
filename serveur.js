const express = require('express')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

let arr = []
app.use(express.static("asset"))
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection',socket => {

//  reçu de socket input 
    socket.on('input', function(input) {
        arr.push({
            socket:socket.id,
            input:input,
        })
        let index = input.username;
        
        io.emit("new user",index)
    })



    socket.on('disconnect', function (username) {
        let num = -1;
        let index = arr.find((value,index) => {
            num = index;
            return value.socket == socket.id;
            
        });
        if(index){
            io.emit("user disconnect",index.username);
            console.log(index.input.username+' disconnect')
            arr.splice(num,1);
        }
    });
})

setInterval(()=>{
    console.log(arr)
},10000)

server.listen(8085)