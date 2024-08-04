import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns'
import Swal from 'sweetalert2';

export default function MyOffers() {

   const id = jwtDecode(localStorage.getItem('token')).id
   const [url, setUrl] = useRecoilState(baseUrl)
   const [data, setData] = useState([])
   const [state, setState] = useState("False")
   const [decline, setDecline] = useState("False")
   const [finish, setFinish] = useState(null)
   const [loading, setLoading] = useState(true)
   const [btnLoader, setBtnLoader] = useState(false)

   async function getMyOffers() {
      setLoading(true)
      await axios.get(url + `api/useroffers/${id}?state=${state}&decline=${decline}`, {
         headers: {
            token: localStorage.getItem('token')
         }
      }).then(({ data }) => {
         if (finish) {
            setData(data.Offers.filter((item) => item.Request.Status == "Finish"))
         } else if (finish == false) {
            setData(data.Offers.filter((item) => item.Request.Status == "Ongoing"))
         } else {
            setData(data.Offers)
         }
      }).catch((error) => {
         console.log(error);
      }).finally(() => {
         setLoading(false)
      })
   }

   async function deleteOffer(offerID) {
      try {
         setBtnLoader(true)
         const { data } = await axios.delete(url + `api/deleteoffer/${offerID}/${id}`, {
            headers: {
               token: localStorage.getItem('token')
            }
         })
      } catch (error) {
         console.log(error);
      } finally {
         await Swal.fire({
            icon: "error",
            title: "Offer Deleted Successfully",
            showConfirmButton: false,
            timer: 1500
         })
         await getMyOffers()
         setBtnLoader(false)
      }
   }

   function handleFilter(e) {
      let tag = e.target.closest('button') ? e.target.closest('button').value : e.target.value
      switch (tag) {
         case "Accepted":
            setState("True")
            setDecline("False")
            setFinish(null)
            break
         case "Declined":
            setState("False")
            setDecline("True")
            setFinish(null)
            break
         case "WorkInProgress":
            setFinish(false)
            break
         case "Finished":
            setFinish(true)
            break
         default:
            setState("False")
            setDecline("False")
            setFinish(null)
      }
   }

   useEffect(() => {
      getMyOffers()
   }, [state, decline, finish])

   return (
      <section id='myOffers' className='nav-margin mb-4'>
         <div className="container">
            <h2 className='poppins-regular fw-medium'>My Offers</h2>
            <ul className="nav nav-tabs mt-4" id="myTab" role="tablist">
               <li className="nav-item" role="presentation">
                  <button onClick={handleFilter} className="nav-link text-dark active" id="active" data-bs-toggle="tab" data-bs-target="#active-pane" type="button" role="tab" aria-controls="active-pane" aria-selected="true"><i className="fa-regular fa-hourglass-half text-primary fa-fw"></i> Pending</button>
               </li>
               <li className="nav-item" role="presentation">
                  <button onClick={handleFilter} value="Accepted" className="nav-link text-dark" id="accepted" data-bs-toggle="tab" data-bs-target="#active-pane" type="button" role="tab" aria-controls="active-pane" aria-selected="false"><i className="fa-solid text-success fa-check fa-fw"></i> Accepted</button>
               </li>
               <li className="nav-item" role="presentation">
                  <button onClick={handleFilter} value="Declined" className="nav-link text-dark" id="declined" data-bs-toggle="tab" data-bs-target="#active-pane" type="button" role="tab" aria-controls="active-pane" aria-selected="false"><i className="fa-solid fa-xmark text-danger fa-fw"></i> Declined</button>
               </li>
            </ul>
            <div className="tab-content bg-white border border-top-0 rounded-2 rounded-top-0 p-3" id="myTabContent">
               <div className="tab-pane fade show active" id="active-pane" role="tabpanel" aria-labelledby="active" tabIndex="0">
                  {
                     state == "True"
                        ?
                        <div className="d-flex align-items-center justify-content-end mb-3">
                           <label htmlFor="offerSelect" className="me-3 rounded-circle bg-success d-inline-flex justify-content-center align-items-center" style={{ width: 30, height: 30 }}><i className="fa-solid fa-filter text-white"></i></label>
                           <div>
                              <select id='offerSelect' defaultValue="Accepted" className="form-select border-success" onChange={handleFilter}>
                                 <option value="Accepted">All</option>
                                 <option value="WorkInProgress">Work In Progress</option>
                                 <option value="Finished">Finished</option>
                              </select>
                           </div>
                        </div>
                        :
                        ""
                  }
                  {
                     loading
                        ?
                        <div className='main-text fs-1 text-center my-5'>
                           <i className='fa fa-spin fa-spinner'></i>
                        </div>
                        :
                        data.length
                           ?
                           data.map((item) => {
                              return (
                                 <div key={item.Offer.id} className="card mb-3">
                                    <div className="card-body">
                                       <Link to={`/request/${item.Request.id}`} className="card-title fs-5 d-flex align-items-center justify-content-between fw-medium">
                                          {item.Request.Topic}
                                          {
                                             item.Request.Status == "Finish"
                                                ?
                                                <span className="rounded-circle bg-success d-inline-flex justify-content-center align-items-center" style={{ width: 20, height: 20, fontSize: '0.8rem' }}><i className="fa-solid fa-check text-white"></i></span>
                                                :
                                                ""
                                          }
                                       </Link>
                                       <hr className='my-2' />
                                       <p className="card-text mb-2 text-muted"><strong className='text-dark'>Offer Details:</strong> {item.Offer.Offerdesc}</p>
                                       <p className="card-text"><strong>Offer Price:</strong> {item.Offer.Price} EGP</p>
                                       <div className='d-flex justify-content-between align-items-end'>
                                          <div>
                                             {
                                                item.Offer.State
                                                   ?
                                                   item.Request.Status == "Ongoing"
                                                      ?
                                                      <Link className="btn btn-success" to={`/chat/${item.Request.id}`}>
                                                         <i className="fa-solid fa-comments fa-fw"></i> Chat
                                                      </Link>
                                                      :
                                                      <Link className="btn btn-success" to={`/chat/${item.Request.id}`}>
                                                         <i className="fa-solid fa-clock-rotate-left"></i> Chat History
                                                      </Link>
                                                   :
                                                   item.Offer.Decline
                                                      ?
                                                      <p className='text-danger fw-bold mb-0'>This Offer Was Declined</p>
                                                      :
                                                      <button className="btn btn-danger" onClick={() => { deleteOffer(item.Offer.id) }} disabled={btnLoader}>
                                                         {
                                                            btnLoader
                                                               ?
                                                               <i className='fa fa-spin fa-spinner'></i>
                                                               :
                                                               "Delete Offer"
                                                         }
                                                      </button>
                                             }
                                          </div>
                                          <small className='text-muted'>
                                             {formatDistanceToNow(new Date(item.Offer.PostDate), { addSuffix: true }).replace(/^about/, '')}
                                          </small>
                                       </div>
                                    </div>
                                 </div>
                              )
                           })
                           :
                           decline == "True"
                              ?
                              <h3 className='text-center text-danger my-5'>You don't have any declined offers</h3>
                              :
                              state == "True"
                                 ?
                                 <h3 className='text-center text-success my-5'>You don't have any accepted requests</h3>
                                 :
                                 <h3 className='text-center text-primary my-5'>You don't have any pending offers</h3>
                  }
               </div>
            </div>
         </div>
      </section>
   );
}
