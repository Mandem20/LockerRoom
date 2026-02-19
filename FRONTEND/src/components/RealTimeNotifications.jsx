import { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext'
import { FaBell } from 'react-icons/fa'

const RealTimeNotifications = () => {
    const socket = useSocket()
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        if (!socket) return

        const handleOrderUpdated = (data) => {
            const notification = {
                id: Date.now(),
                message: data.message,
                timestamp: new Date()
            }
            setNotifications(prev => [notification, ...prev].slice(0, 5))

            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== notification.id))
            }, 5000)
        }

        socket.on('orderUpdated', handleOrderUpdated)

        return () => {
            socket.off('orderUpdated', handleOrderUpdated)
        }
    }, [socket])

    if (notifications.length === 0) return null

    return (
        <div className='fixed bottom-4 right-4 z-50 space-y-2'>
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className='bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in'
                >
                    <FaBell className='text-sm' />
                    <span className='text-sm'>{notification.message}</span>
                </div>
            ))}
        </div>
    )
}

export default RealTimeNotifications
