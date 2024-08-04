import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'
import RequestRate from './RequestRate';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

export default function MyRequests() {

   const id = jwtDecode(localStorage.getItem('token')).id

   const [url, setUrl] = useRecoilState(baseUrl)
   const [data, setData] = useState([])
   const [offers, setOffers] = useState([])
   const [status, setStatus] = useState("NF")
   const [decline, setDecline] = useState("False")
   const [approve, setApprove] = useState("")
   const [loading, setLoading] = useState(true)
   const [deny, setDeny] = useState(false)

   async function getMyRequests() {
      setLoading(true)
      await axios.get(url + `api/userrequests/${id}?status=${status}&decline=${decline}&Approve=${approve}`, {
         headers: {
            token: localStorage.getItem('token')
         }
      }).then(({ data }) => {
         setData(data.requests)
      }).catch((error) => {
         console.log(error);
      }).finally(() => {
         setLoading(false);
      })
   }

   async function acceptOffer(requestID, offerID) {
      await axios.post(url + `api/acceptoffer/${offerID}/${id}`, { RequestID: requestID }, {
         headers: {
            token: localStorage.getItem('token')
         }
      }).then(async (data) => {
         await Swal.fire({
            icon: "success",
            title: "Offer Accepted Successfully",
            showConfirmButton: false,
            timer: 1500
         })
         await getMyRequests()
      }).catch(({ response }) => {
         Swal.fire({
            title: response.data.MSG,
            timer: 2000,
            icon: "error",
            showConfirmButton: false,
         })
      })
   }

   async function declineOffer(offerID) {
      setDeny(true)
      await axios.delete(url + `api/declineoffer/${offerID}/${id}`, {
         headers: {
            token: localStorage.getItem('token')
         }
      }).then(async (data) => {
         await Swal.fire({
            icon: "error",
            title: "Offer Declined Successfully",
            showConfirmButton: false,
            timer: 1500
         })
         setOffers(offers.filter((item) => item.offer.details.id != offerID))
      }).catch((error) => {
         console.log(error);
      }).finally(() => {
         setDeny(false)
      })
   }

   function handleFilter(e) {
      let tag = e.target.closest('button') ? e.target.closest('button').value : e.target.value
      switch (tag) {
         case "WorkInProgress":
            setApprove("True")
            setDecline("False")
            setStatus("Ongoing")
            break;
         case "Approved":
            setApprove("True")
            setDecline("False")
            setStatus("NF")
            break;
         case "WaitingForApproval":
            setApprove("False")
            setDecline("False")
            setStatus("NF")
            break;
         case "Finished":
            setApprove("True")
            setDecline("False")
            setStatus("Finish")
            break;
         case "Declined":
            setApprove("False")
            setDecline("True")
            setStatus("Open")
            break;
         default:
            setApprove("")
            setDecline("False")
            setStatus("NF")
      }
   }

   const requestRate = useRef();

   function handleAlert(item) {
      const ratingAlert = withReactContent(Swal)
      ratingAlert.fire({
         icon: "info",
         title: "Provide Your Feedback",
         showDenyButton: true,
         confirmButtonColor: "#198754",
         denyButtonText: "Cancel",
         showLoaderOnConfirm: true,
         input: "text",
         html: <RequestRate ref={requestRate} />,
         allowOutsideClick: () => !ratingAlert.isLoading(),
         preConfirm: async (feedback) => {
            await requestRate.current.finishRequest(item, id, url, feedback)
            await getMyRequests()
         },
         confirmButtonText: `<i class="fa-solid fa-check"></i> Confirm`,
      })
   }

   function handleDeclineModal(reason) {
      Swal.fire({
         title: reason,
         showCloseButton: true,
         confirmButtonColor: '#dc3545',
      })
   }

   useEffect(() => {
      getMyRequests()
   }, [status, approve, decline])

   return (
      <section id='myRequests' className='nav-margin mb-4'>
         <div className="container">
            <h2 className='poppins-regular fw-medium'>My Requests</h2>
            <ul className="nav nav-tabs mt-4" id="myTab" role="tablist">
               <li className="nav-item" role="presentation">
                  <button onClick={handleFilter} className="nav-link text-dark active" id="active" data-bs-toggle="tab" data-bs-target="#active-pane" type="button" role="tab" aria-controls="active-pane" aria-selected="true"><i className="fa-regular fa-hourglass-half text-primary fa-fw"></i> Active</button>
               </li>
               <li className="nav-item" role="presentation">
                  <button onClick={handleFilter} value="Finished" className="nav-link text-dark" id="finished" data-bs-toggle="tab" data-bs-target="#active-pane" type="button" role="tab" aria-controls="#active-pane" aria-selected="false"><i className="fa-solid text-success fa-check fa-fw"></i> Finished</button>
               </li>
               <li className="nav-item" role="presentation">
                  <button onClick={handleFilter} value="Declined" className="nav-link text-dark" id="declined" data-bs-toggle="tab" data-bs-target="#active-pane" type="button" role="tab" aria-controls="#active-pane" aria-selected="false"><i className="fa-solid fa-xmark text-danger fa-fw"></i> Declined</button>
               </li>
            </ul>
            <div className="tab-content bg-white border border-top-0 rounded-2 rounded-top-0 p-3" id="myTabContent">
               <div className="tab-pane fade show active" id="active-pane" role="tabpanel" aria-labelledby="active" tabIndex="0">
                  {
                     status == "Finish" || decline == "True"
                        ?
                        ""
                        :
                        <div className="d-flex align-items-center justify-content-end mb-3">
                           <label htmlFor="select" className="me-3 rounded-circle main-bg d-inline-flex justify-content-center align-items-center" style={{ width: 30, height: 30 }}><i className="fa-solid fa-filter text-white"></i></label>
                           <div>
                              <select id='select' defaultValue="All" className="form-select border-primary" onChange={handleFilter}>
                                 <option value="All">All</option>
                                 <option value="WorkInProgress">Work In Progress</option>
                                 <option value="Approved">Approved</option>
                                 <option value="WaitingForApproval">Waiting for Approval</option>
                              </select>
                           </div>
                        </div>
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
                                 <div className="card mb-3" key={item.request.id}>
                                    <div className="card-body">
                                       <Link to={`/request/${item.request.id}`} className="card-title fs-5 fw-medium">{item.request.Topic}</Link>
                                       <p className="card-text my-4 mt-3 text-muted">{item.request.RequestDesc}</p>
                                       <div className='d-flex align-items-end justify-content-between'>
                                          {
                                             item.request.Approve
                                                ?
                                                item.request.Status == "Open"
                                                   ?
                                                   <button onClick={() => { setOffers(item.Offers) }} className="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target="#offerModal">Show Offers</button>
                                                   :
                                                   item.request.Status == "Ongoing"
                                                      ?
                                                      <div className='d-flex gap-2'>
                                                         <Link className="btn btn-primary" to={`/chat/${item.request.id}`}>
                                                            <i className="fa-solid fa-comments fa-fw"></i> Chat
                                                         </Link>
                                                         <button className='btn btn-success' onClick={() => { handleAlert(item) }}>
                                                            <i className="fa-solid fa-flag-checkered fa-fw"></i> Finalize
                                                         </button>
                                                      </div>
                                                      :
                                                      <Link className="btn btn-success" to={`/chat/${item.request.id}`}>
                                                         <i className="fa-solid fa-clock-rotate-left"></i> Chat History
                                                      </Link>
                                                :
                                                item.request.Decline
                                                   ?
                                                   <button className="btn btn-danger" onClick={() => { handleDeclineModal(item.request.DeclineReason) }}>Decline Reason</button>
                                                   :
                                                   <p className='text-danger fw-bold mb-0'>Waiting for Admin Approval...</p>
                                          }
                                          {
                                             <small className='text-muted'>{formatDistanceToNow(new Date(item.request.PostDate), { addSuffix: true }).replace(/^about/, '')}</small>
                                          }
                                       </div>
                                    </div>
                                 </div>
                              )
                           })
                           :
                           status == "Finish"
                              ?
                              <h3 className='text-center text-success my-5'>You haven't finalized any requests yet</h3>
                              :
                              decline == "True"
                                 ?
                                 <h3 className='text-center text-danger my-5'>You don't have any declined requests</h3>
                                 :
                                 <h3 className='text-center main-text my-5'>You haven't submitted any requests yet</h3>
                  }
               </div>
            </div>
            {/* Offer Modal */}
            <div className="modal fade" id="offerModal" tabIndex={-1} aria-hidden="true">
               <div className="modal-dialog modal-dialog-scrollable">
                  <div className="modal-content">
                     <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">Offers</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                     </div>
                     <div className="modal-body">
                        {
                           offers.length
                              ?
                              offers.map((item) => {
                                 return (
                                    <div key={item.offer.details.id} className="offer-card p-3 mb-3  border rounded-3 shadow-sm d-flex align-items-start">
                                       <img src={url + item.offer.user.profileImage} className="rounded-circle me-3" width={60} height={60} />
                                       <div>
                                          <Link to={`/profile/${item.offer.user.id}`}>
                                             <h5 className="offer-name mb-2 text-dark" data-bs-dismiss="modal">{item.offer.user.Fname + ' ' + item.offer.user.Lname}</h5>
                                          </Link>
                                          <p className="offer-budget mb-2 fw-semibold">{item.offer.details.Price} EGP</p>
                                          <p className="offer-description mb-3">{item.offer.details.Offerdesc}</p>
                                          <div className="d-flex justify-content-start">
                                             <button onClick={() => { acceptOffer(item.offer.details.RequestID, item.offer.details.id) }} type="button" className="btn btn-success me-2" data-bs-dismiss="modal" aria-label="Close">Accept</button>
                                             <button onClick={() => { declineOffer(item.offer.details.id) }} type="button" className="btn btn-danger" disabled={deny}>
                                                {
                                                   deny
                                                      ?
                                                      <i className='fa fa-spin fa-spinner'></i>
                                                      :
                                                      'Decline'
                                                }
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 )
                              })
                              :
                              <h5 className='main-text text-center'>This request doesn't have any offers yet</h5>
                        }
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}