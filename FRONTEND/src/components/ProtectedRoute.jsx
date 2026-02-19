import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import ROLE from '../common/role'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const user = useSelector(state => state?.user?.user)

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (requireAdmin && user.role !== ROLE.ADMIN) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
