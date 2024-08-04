import React from 'react'
import { jwtDecode } from 'jwt-decode'
import NotFound from '../Components/NotFound/NotFound'

export default function AdminRoutes({ children }) {
    let token = localStorage.getItem('token')
    const decoded = token ? jwtDecode(token) : null
    if (decoded && decoded.Role == "Admin") return children
    return <NotFound />
}
