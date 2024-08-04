import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../../Components/Footer/Footer'
import MainNavbar from '../../Components/MainNavbar/MainNavbar'

export default function MainLayout() {
   return (
      <>
         <MainNavbar />
         <Outlet />
         <Footer />
      </>
   )
}
