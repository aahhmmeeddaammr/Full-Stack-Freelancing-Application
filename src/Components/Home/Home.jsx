import React, { useState } from 'react'
import secondary from '../../Assets/Images/sec1.png'
import { Link } from 'react-router-dom'
import * as yup from 'yup';
import { useFormik } from 'formik';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';
import Swal from 'sweetalert2';

export default function Home() {

   const [url, setUrl] = useRecoilState(baseUrl)
   const [loading, setLoading] = useState(false)

   const validationSchema = yup.object({
      email: yup.string().email('Enter a Valid Email').required('Email is required'),
      phone: yup.string().matches(/^\d{11}$/, 'Phone number must be 11 digits').required('Phone number is required'),
      message: yup.string().min(10).max(1000).required('Problem is required')
   });

   async function sendSupport(values) {
      setLoading(true)
      await axios.post(url + `api/sendcomplaint`, values).
         then(() => {
            Swal.fire({
               icon: "success",
               title: "Complaint Filed Successfully",
               timer: 2000,
               showConfirmButton: false,
            })
            support.resetForm();
            console.log(support);
         }).catch((error) => {
            console.log(error);
         }).finally(() => {
            setLoading(false)
         })
   }

   const support = useFormik({
      initialValues: {
         email: '',
         phone: '',
         message: '',
      },
      validationSchema,
      enableReinitialize: true,
      onSubmit: async (values) => {
         await sendSupport(values)
      },
   });

   return (
      <section id='homepage' className='poppins-regular'>
         <div className='hero'>
            <div className="container text-center">
               <div className="bg-white p-3 px-5 rounded-4 d-inline-block">
                  <h1 className='fw-bold m-0'>
                     <i className="fa-solid fa-bolt" /> Find the best <span className='main-text'>instructors</span>
                  </h1>
               </div>
               <p className="text-white fs-3 my-4">for the best learning experience.</p>
               <Link className="main-bg d-inline-block rounded-2 py-2 px-3 text-white fs-4 fw-medium" to={'/findassistant'}>Find Assistant</Link>
            </div>
         </div>
         <div className='bg-light text-center py-5'>
            <div className="container">
               <div className='py-5 shadow-lg rounded-4'>
                  <div className="row">
                     <h2 className='fw-semibold fs-1 mb-3 mb-md-0'>Find Help in...</h2>
                     <div className="col-md-4 py-3 py-md-5">
                        <div className='home-icon'>
                           <i className="fa-solid fa-briefcase"></i>
                        </div>
                        <h4 className='fw-normal'>Career Guidance</h4>
                     </div>
                     <div className="col-md-4 py-3 py-md-5">
                        <div className='home-icon'>
                           <i className="fa-solid fa-graduation-cap"></i>
                        </div>
                        <h4 className='fw-normal text-nowrap'>Academic Support</h4>
                     </div>
                     <div className="col-md-4 pt-3 pt-md-5">
                        <div className='home-icon'>
                           <i className="fa-solid fa-trophy"></i>
                        </div>
                        <h4 className='fw-normal'>Mentorship</h4>
                     </div>
                  </div>
               </div>

            </div>
         </div>
         <div className='main-bg text-white py-5'>
            <div className="container">
               <div className="row align-items-center">
                  <div className="col-md-6 my-3 my-md-0">
                     <h2 className='mb-4'>Offer help and make money</h2>
                     <p>You can assist students with their academic studies and projects, as well as provide guidance in choosing the appropriate field for them, thereby generating additional income for yourself.</p>
                     <p className='mt-4'>What are you waiting for ??</p>
                     <Link className='py-2 px-5 bg-white main-text fs-4 rounded-2 fw-semibold' to={'/offerhelp'}>Offer Help</Link>
                  </div>
                  <div className="col-md-6 my-3 my-md-0">
                     <img src={secondary} style={{ width: "100%" }} alt="" />
                  </div>
               </div>
            </div>
         </div>
         <div className="support-section bg-light py-5">
            <div className="container">
               <div className='shadow p-md-5 p-4 rounded-4 bg-white'>
                  <h2 className='text-center fs-1 fw-semibold mb-3'>Support</h2>
                  <form onSubmit={support.handleSubmit}>
                     <label className='form-label' htmlFor="supportEmail">Email</label>
                     <input
                        type="email"
                        id="supportEmail"
                        name='email'
                        onChange={support.handleChange}
                        onBlur={support.handleBlur}
                        onKeyUp={support.handleBlur}
                        className='form-control mb-2'
                     />
                     {support.errors.email && support.touched.email ? <div className="alert alert-danger p-2">{support.errors.email}</div> : ""}
                     <label className='form-label' htmlFor="supportPhone">Phone</label>
                     <input
                        type="tel"
                        id="supportPhone"
                        name='phone'
                        onChange={support.handleChange}
                        onBlur={support.handleBlur}
                        onKeyUp={support.handleBlur}
                        className='form-control mb-2'
                     />
                     {support.errors.phone && support.touched.phone ? <div className="alert alert-danger p-2">{support.errors.phone}</div> : ""}
                     <label className='form-label' htmlFor="supportMessage">Message</label>
                     <textarea
                        id="supportMessage"
                        name='message'
                        rows="4"
                        onChange={support.handleChange}
                        onBlur={support.handleBlur}
                        onKeyUp={support.handleBlur}
                        className='form-control mb-2'
                     />
                     {support.errors.message && support.touched.message ? <div className="alert alert-danger p-2 mb-0">{support.errors.message}</div> : ""}
                     <button className='btn btn-primary w-100 mt-2' type="submit" disabled={loading}>
                        {
                           loading
                              ?
                              <i className='fa fa-spin fa-spinner'></i>
                              :
                              "Submit"
                        }
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </section>
   )
}