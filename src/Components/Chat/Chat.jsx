import React, { useRef } from 'react';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import Spinner from '../Spinner/Spinner';
import { jwtDecode } from 'jwt-decode';

export default function Chat() {

   const { id } = useParams()
   const myID = jwtDecode(localStorage.getItem('token')).id
   const [url, setUrl] = useRecoilState(baseUrl)
   let input = useRef()

   const { data, isLoading, refetch } = useQuery("GetMessages", () => getMessages(), {
      refetchInterval: 10000
   })

   function getMessages() {
      return axios.get(url + `api/getchat/${id}/${myID}`, {
         headers: {
            token: localStorage.getItem('token')
         }
      })
   }

   async function sendMessage(msg) {
      await axios.post(url + `api/sendmessage/${myID}/${id}`, msg, {
         headers: {
            token: localStorage.getItem('token')
         }
      }).
         then(async ({ data }) => {
            console.log(data);
            await refetch()
         }).catch((error) => {
            console.log(error);
         })
   }

   function handleSend(e) {
      if (e.type === 'click' || (e.key === 'Enter' && input.current.value)) {
         const msg = {
            content: input.current.value,
         }
         input.current.value = '';
         sendMessage(msg);
      }
   }

   if (isLoading) return <Spinner />

   return (
      <div className="container nav-margin mb-4">
         <div className="row g-4">
            <div className="col-lg-8">
               <div className="card">
                  <Link to={`/request/${data.data.request.id}`} className={`card-header ${data.data.request.Status == 'Finish' ? 'bg-success' : 'main-bg'} text-white`}>{data.data.request.Topic}'s Chat</Link>
                  <div className="card-body overflow-y-scroll d-flex flex-column-reverse" style={{ height: '450px' }}>
                     {
                        data?.data?.messages?.map((item) => {
                           return (
                              <div key={item.message.id} className={`d-flex justify-content-${item.sender.id === myID ? 'end' : 'start'} mb-2`}>
                                 <div className="p-2 bg-light rounded" style={{ maxWidth: '65%' }}>
                                    <div className="d-flex align-items-center">
                                       {
                                          item.sender.id === myID
                                             ? ""
                                             : <img src={url + item.sender.profileImage} height="40" width="40" className='rounded-circle me-2' alt="Profile" />
                                       }
                                       <div>
                                          <p className='mb-1 text-break'>{item.message.Content}</p>
                                          <small className="text-end" style={{ fontSize: '0.8rem', color: "#757575" }}>{new Date(item.message.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</small>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )
                        })
                     }
                  </div>
                  {
                     data.data.request.Status != "Finish"
                     &&
                     <div className="card-footer">
                        <div className="d-flex gap-3">
                           <input
                              type="text"
                              className="form-control"
                              placeholder="Type a message..."
                              ref={input}
                              onKeyUp={handleSend}
                           />
                           <button className="btn btn-primary d-flex align-items-center justify-content-between" onClick={handleSend}>
                              <i className="fa-solid fa-paper-plane fa-fw me-1"></i> Send
                           </button>
                        </div>
                     </div>
                  }
               </div>
            </div>
            <div className="col-lg-4">
               <div className="card">
                  <div className={`card-header ${data.data.request.Status == 'Finish' ? 'bg-success' : 'main-bg'} text-white`}>Contact Info</div>
                  <div className="card-body">
                     <Link to={`/profile/${data.data.ContactProfile.id}`} className='d-inline-flex align-items-center'>
                        <img src={url + data.data.ContactProfile.profileImage} height="70" width="70" className='rounded-circle me-3' />
                        <div>
                           <h5 className='mb-1 text-black'>{`${data.data.ContactProfile.Fname} ${data.data.ContactProfile.Lname}`}</h5>
                           <small className='text-muted'>{data.data.ContactProfile.Title}</small>
                        </div>
                     </Link>
                     <hr className='my-2' />
                     {
                        data.data.RoleInchat == "RequestOwner"
                           ?
                           <>
                              <strong>Offer Details: </strong>
                              <p className='mb-2'>{data.data.Offer.Offerdesc.split(' ').splice(0, 30).join(' ')}</p>
                              <strong>Offer Price: <span className='fw-normal'>{data.data.Offer.Price} EGP</span></strong>
                           </>
                           :
                           <>
                              <strong>Request Description: </strong>
                              <p className='mb-2'>{data.data.request.RequestDesc.split(' ').splice(0, 30).join(' ')}</p>
                              <strong>Request Budget: <span className='fw-normal'>{data.data.request.Budget} EGP</span></strong>
                              <strong className='d-block my-3 mb-0'>My Offer Price: <span className='fw-normal'>{data.data.Offer.Price} EGP</span></strong>
                           </>
                     }
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
