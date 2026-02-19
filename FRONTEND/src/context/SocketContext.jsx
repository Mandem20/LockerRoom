import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        const BackendDomain = "http://localhost:8080"
        
        const socketInstance = io(BackendDomain, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        })

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id)
        })

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected')
        })

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}
