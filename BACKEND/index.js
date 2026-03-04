
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const http = require('http')
require('dotenv').config()
const connectDB = require('./config/db')
const router = require('./routes')
const { initializeSocket } = require('./config/socket')

const app = express()

app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false
        return /json|text|javascript|css|html|xml/.test(res.getHeader('Content-Type'))
    },
    level: 6,
    threshold: 1024
}))

app.use(cors({
    origin: process.env.FRONTEND_URL, // must be full correct URL
    credentials: true,
}))



app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
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
