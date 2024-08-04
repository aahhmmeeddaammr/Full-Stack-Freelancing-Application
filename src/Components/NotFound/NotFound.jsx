import React from 'react'
import error from '../../Assets/Images/404-error.png'
export default function NotFound() {
    return (
        <>
            <div className='d-flex align-items-center justify-content-center pb-5 vh-100 '>
                <img src={error} alt="" />
            </div>
        </>
    )
}
