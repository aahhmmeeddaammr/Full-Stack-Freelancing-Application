import React from 'react'
import logo from '../../Assets/Images/logo.png'

export default function Footer() {
    return (
        <footer className='py-2 bg-white border-top border-bottom border-primary'>
            <div className="container d-flex align-items-center justify-content-around flex-wrap">
                <img src={logo} width={60} alt="" className='rounded-circle' />
                <p className='m-0'>© 2024 <span className='main-text fs-5'>Xperienced</span>. All rights reserved.</p>
                <div className='main-text fa-2x'>
                    <i className="fa-brands fa-twitter mx-2"></i>
                    <i className="fa-brands fa-instagram mx-2"></i>
                    <i className="fa-brands fa-facebook mx-2"></i>
                </div>
            </div>
        </footer>
    )
}
