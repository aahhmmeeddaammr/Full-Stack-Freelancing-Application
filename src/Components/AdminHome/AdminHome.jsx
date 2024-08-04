import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useRecoilState } from 'recoil'
import { baseUrl } from '../Atoms/BaseUrl'
import { jwtDecode } from 'jwt-decode'
import Spinner from '../Spinner/Spinner'
import { formatDistanceToNow } from 'date-fns'

export default function AdminHome() {

   const myDetails = jwtDecode(localStorage.getItem('token'))
   const [url, setUrl] = useRecoilState(baseUrl)
   const [data, setData] = useState([])
   const [loading, setLoading] = useState(true)

   const getAdminData = async () => {
      try {
         const { data } = await axios.get(url + `api/adminhome/${myDetails.id}`, {
            headers: {
               token: localStorage.getItem('token')
            }
         })
         setData(data)
         setLoading(false)
      } catch (error) {
         console.log(error);
      }
   }

   useEffect(() => {
      getAdminData()
   }, [])

   if (loading) return <Spinner />

   return (
      <section className="container nav-margin mb-5">
         <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
               <div className="shadow p-3 border rounded">
                  <div className="d-flex justify-content-between mb-3">
                     <div>
                        <span className="d-block fw-medium mb-3">Requests</span>
                        <div className="fw-medium fs-3">{data.NumberOfAllRequest}</div>
                     </div>
                     <div className="d-flex align-items-center justify-content-center bg-primary rounded" style={{ width: '2.5rem', height: '2.5rem' }}>
                        <i className="fa-solid fa-envelope-open-text text-white"></i>
                     </div>
                  </div>
                  <div className='d-flex align-items-center justify-content-between'>
                     <div>
                        <span className="text-success fw-medium">{data.NumberOfAllPendingRequests} new </span>
                        <span className="">since last visit</span>
                     </div>
                     <div>
                        <Link to={'/admin/requests'}>
                           <i className="fa-solid fa-arrow-right-long fs-5"></i>
                        </Link>
                     </div>
                  </div>
               </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
               <div className="shadow p-3 border rounded">
                  <div className="d-flex justify-content-between mb-3">
                     <div>
                        <span className="d-block fw-medium mb-3">Revenue</span>
                        <div className="fw-medium fs-3">{data.Revenu.total_amount} EGP</div>
                     </div>
                     <div className="d-flex align-items-center justify-content-center bg-success rounded" style={{ width: '2.5rem', height: '2.5rem' }}>
                        <i className="fa-solid fa-dollar text-white"></i>
                     </div>
                  </div>
                  <div className='d-flex align-items-center justify-content-between'>
                     <div>
                        <span className="text-success fw-medium">{data.NumberOfAllPendingTransactions} </span>
                        <span className="">since last week</span>
                     </div>
                     <div>
                        <Link to={'/admin/revenue'}>
                           <i className="fa-solid fa-arrow-right-long text-success fs-5"></i>
                        </Link>
                     </div>
                  </div>
               </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
               <div className="shadow p-3 border rounded">
                  <div className="d-flex justify-content-between mb-3">
                     <div>
                        <span className="d-block fw-medium mb-3">Users</span>
                        <div className="fw-medium fs-3">{data.NumberOfAllUsers}</div>
                     </div>
                     <div className="d-flex align-items-center justify-content-center bg-warning rounded" style={{ width: '2.5rem', height: '2.5rem' }}>
                        <i className="fa-solid fa-users text-white"></i>
                     </div>
                  </div>
                  <span className="text-success fw-medium">{data.NumberOflatestregisters} </span>
                  <span className="">newly registered</span>
               </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
               <div className="shadow p-3 border rounded">
                  <div className="d-flex justify-content-between mb-3">
                     <div>
                        <span className="d-block fw-medium mb-3">Complaints</span>
                        <div className="fw-medium fs-3">{data.NumberOfAllPendingComplaints} Unread</div>
                     </div>
                     <div className="d-flex align-items-center justify-content-center bg-danger rounded" style={{ width: '2.5rem', height: '2.5rem' }}>
                        <i className="fa-solid fa-comment text-white"></i>
                     </div>
                  </div>
                  <div className='d-flex align-items-center justify-content-between'>
                     <div>
                        <span className="text-success fw-medium">{data.NumberOfAllComplaints - data.NumberOfAllPendingComplaints} </span>
                        <span className="">responded</span>
                     </div>
                     <div>
                        <Link to={'/admin/complaints'}>
                           <i className="fa-solid fa-arrow-right-long text-danger fs-5"></i>
                        </Link>
                     </div>
                  </div>
               </div>
            </div>
            <div className='col-lg-6'>
               <div className="shadow p-4 border rounded">
                  <h5>Latest Requests</h5>
                  <hr className='my-2' />
                  <div className='mt-4'>
                     {
                        data.AllPendingRequests.length
                           ?
                           data.AllPendingRequests.map((item) => {
                              return (
                                 <div key={item.id}>
                                    <div >
                                       <h6>{item.Topic}</h6>
                                       <div className='d-flex justify-content-between align-item-end mt-3'>
                                          <p className='text-muted mb-0'>{item.RequestDesc.split(' ').splice(0, 30).join(' ')}</p>
                                          <small className='text-muted'>{formatDistanceToNow(new Date(item.PostDate), { addSuffix: true }).replace(/^about/, '')}</small>
                                       </div>
                                    </div>
                                    <hr className='my-2 mb-3' />
                                 </div>
                              )
                           })
                           :
                           <h3 className='text-center main-text my-5'>There are no pending requests</h3>
                     }
                  </div>
                  <Link to={'/admin/requests'} className='btn btn-outline-primary mt-1 w-100'>See All Requests</Link>
               </div>
            </div>
            <div className='col-lg-6'>
               <div className="shadow p-4 border rounded">
                  <h5>Admins</h5>
                  <hr className='my-2' />
                  <div className='mt-4'>
                     {
                        data.AllAdmins.map((item) => {
                           return (
                              <div key={item.id} className='d-flex align-items-center my-4'>
                                 <img src={url + item.profileImage} width="45" height="45" className='rounded-circle me-3' alt="" />
                                 <div>
                                    <p className='fw-medium m-0'>{`${item.Fname} ${item.Lname}`}</p>
                                    <span style={{ color: '#757575' }} className='d-block m-0'>{item.Title}</span>
                                 </div>
                              </div>
                           )
                        })
                     }
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}
