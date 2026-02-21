
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const http = require('http')
require('dotenv').config()
const connectDB = require('./config/db')
const router = require('./routes')
const { initializeSocket } = require('./config/socket')

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL, // must be full correct URL
    credentials: true,
}))



app.use(express.json())
app.use(cookieParser())

app.use("/api", router)

const PORT = 8080 || process.env.PORT 

const server = http.createServer(app)

initializeSocket(server)

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log("connected to DB")
        console.log("Server is running on port", PORT)
    })
})
