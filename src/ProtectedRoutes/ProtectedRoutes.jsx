import React from 'react'
import { jwtDecode } from 'jwt-decode'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoutes({ children }) {
    let token = localStorage.getItem('token')
    const decoded = token ? jwtDecode(token) : null
    if (decoded) return children
    return <Navigate to={"/login"} />
}
