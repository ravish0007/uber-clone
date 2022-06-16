const express = require('express')

const app = express()
const http = require('http')
const { Server } = require('socket.io')
const https = require('https')

const cors = require('cors')

const fs = require('fs')

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}

const server = https.createServer(options)

const io = require('socket.io')(server, {
  cors: { origin: '*' }
})

io.on('connection', (socket) => {
  console.log('user connected', socket.id)

  socket.on('send_location', (data) => {
    console.log(data)
    io.emit('receive_location', data)
  })
})

server.listen(3001, () => { console.log('server is running') })
