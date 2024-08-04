import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export default function AuthLayout() {
    if (localStorage.getItem('token')){
        return <Navigate to={'/'}/>
    }
    return <Outlet/>
}
