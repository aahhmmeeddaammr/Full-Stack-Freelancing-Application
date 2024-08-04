import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import Spinner from '../Spinner/Spinner';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';
import { formatDistanceToNow } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import NotFound from '../NotFound/NotFound';
import Swal from 'sweetalert2';

export default function RequestDetail() {

   const [loading, setLoading] = useState(true);
   const [btnLoader, setBtnLoader] = useState(false);
   const [offer, setOffer] = useState([]);
   const [reducedPrice, setReducedPrice] = useState(0);
   const [notFound, setNotFound] = useState(false)
   const [url, setUrl] = useRecoilState(baseUrl)
   const myDetails = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')) : ''
   let { id } = useParams();

   const validationSchema = yup.object({
      Price: yup.number().min(1, 'At least 1 EGP').required('Offer Price is Required'),
      Offerdesc: yup.string().min(10, 'At least 10 characters').required('Offer Details is Required'),
   })

   const formik = useFormik({
      initialValues: {
         Price: offer.MyOffer?.length ? offer.MyOffer[0].Price : '',
         Offerdesc: offer.MyOffer?.length ? offer.MyOffer[0].Offerdesc : '',
         UserID: myDetails.id,
         RequestID: id,
      },
      validationSchema,
      enableReinitialize: true,
      onSubmit: (values) => {
         if (offer.CanAddOffer) {
            addOffer(values)
         } else {
            deleteOffer()
         }
      },
   })

   async function GetRequestDetails() {
      try {
         const { data } = await axios.get(url + `api/requests/${id}`, {
            headers: {
               UserID: myDetails.id
            }
         })
         setOffer(data)
      } catch ({ response }) {
         if (response.data.MSG == 'Invalid request') {
            setNotFound(true)
         }
      } finally {
         setLoading(false)
      }

   }

   async function addOffer(values) {
      try {
         setBtnLoader(true)
         const { data } = await axios.post(url + 'api/addoffer', values, {
            headers: {
               token: localStorage.getItem('token')
            }
         });
      } catch (error) {
         console.log(error);
      } finally {
         GetRequestDetails()
         setBtnLoader(false)
      }
   }

   async function deleteOffer() {
      try {
         setBtnLoader(true)
         await axios.delete(url + `api/deleteoffer/${offer.MyOffer[0].id}/${myDetails.id}`, {
            headers: {
               token: localStorage.getItem('token')
            }
         })
      } catch (error) {
         Swal.fire({
            title: error.response.data.MSG,
            icon: "error",
            timer: 1500,
            showConfirmButton: false,
         })
      } finally {
         setReducedPrice(0)
         GetRequestDetails()
         setBtnLoader(false)
      }
   }

   const handlePriceChange = (e) => {
      formik.handleChange(e);
      const value = e.target.value;
      if (!isNaN(value) && value !== '') {
         setReducedPrice(value * 0.8);
      } else {
         setReducedPrice(0);
      }
   }

   useEffect(() => {
      GetRequestDetails()
   }, [])

   if (loading) return <Spinner />

   if (notFound) return <NotFound />

   return (
      <>
         {
            offer.request.Decline || !offer.request.Approve
               ?
               offer.request.UserID == myDetails.id || myDetails.Role == "Admin"
                  ?
                  <div className='container nav-margin mb-5'>
                     <div className='row g-4'>
                        <div className="col-lg-8">
                           <div id="ProjectDescription" className='p-4 rounded-4 shadow'>
                              <h3>{offer.request.Topic}</h3>
                              <hr className='my-2' />
                              <p className='mb-0'>{offer.request.RequestDesc}</p>
                           </div>
                           <div id="ReqSkills" className='shadow p-4 my-4 rounded-4'>
                              <h4>Required Skills</h4>
                              <hr className='my-2' />
                              <div className='d-flex flex-wrap'>
                                 {offer.Skills.map((skill) => (
                                    <p className='alert alert-primary p-2 m-2 ms-0 mb-0 rounded-3' key={skill.id}><i className='fa fa-fw fa-tag'></i> {skill.skill}</p>
                                 ))}
                              </div>
                           </div>
                        </div>
                        <div className="col-lg-4">
                           <div id="ProjectCard" className='shadow p-4 rounded-4 d-none d-lg-block mb-4'>
                              <h4>Project Card</h4>
                              <hr className='my-2' />
                              <div className='d-flex align-items-center'>
                                 <p className='w-50 fw-bold'>Project State</p>
                                 <div>
                                    {
                                       offer.request.Decline
                                          ?
                                          <p className='bg-danger text-white rounded-3 p-1'>Declined</p>
                                          :
                                          <p className='bg-warning rounded-3 p-1'>Waiting</p>
                                    }
                                 </div>
                              </div>
                              <div className='d-flex'>
                                 <p className='w-50 fw-bold'>Posted</p>
                                 <div className='w-50'><p>{formatDistanceToNow(new Date(offer.request.PostDate), { addSuffix: true }).replace(/^about/, '')}</p></div>
                              </div>
                              <div className='d-flex'>
                                 <p className='w-50 fw-bold'>Budget</p>
                                 <div className='w-50'>{offer.request.Budget} EGP</div>
                              </div>
                              <div className='d-flex'>
                                 <p className='w-50 fw-bold'>Average Offers</p>
                                 <div className='w-50'>{offer.AVGOffers} EGP</div>
                              </div>
                              <div className='d-flex'>
                                 <p className='w-50 fw-bold mb-2 text-break'>Number of Offers</p>
                                 <div className='w-50'>{offer.numberofOffers}</div>
                              </div>
                              <hr className='my-2 mb-3' />
                              <div>
                                 <Link to={`/profile/${offer.OwnerProfile.id}`} className='d-flex align-items-center text-dark'>
                                    <img src={url + offer.OwnerProfile.profileImage} height={60} width={60} className='rounded-circle ' alt="" />
                                    <div className='ms-2'>
                                       <p className='fw-semibold poppins-regular my-1'>{offer.OwnerProfile.Fname + ' ' + offer.OwnerProfile.Lname}</p>
                                       <p className='mb-1 text-secondary'><i className="fa fa-fw fa-briefcase"></i> {offer.OwnerProfile.Title}</p>
                                    </div>
                                 </Link>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  :
                  <NotFound />
               :
               <div className='container nav-margin mb-5'>
                  <div className='row g-4'>
                     <div className="col-lg-8">
                        <div id="ProjectDescription" className='p-4 rounded-4 shadow'>
                           <h3>{offer.request.Topic}</h3>
                           <hr className='my-2' />
                           <p className='mb-0'>{offer.request.RequestDesc}</p>
                        </div>
                        <div id="ReqSkills" className='shadow p-4 my-4 rounded-4'>
                           <h4>Required Skills</h4>
                           <hr className='my-2' />
                           <div className='d-flex flex-wrap'>
                              {offer.Skills.map((skill) => (
                                 <p className='alert alert-primary p-2 m-2 ms-0 mb-0 rounded-3' key={skill.id}><i className='fa fa-fw fa-tag'></i> {skill.skill}</p>
                              ))}
                           </div>
                        </div>
                        <div id="RespCard" className='shadow p-4 rounded-4 d-lg-none'>
                           <h4>Project Card</h4>
                           <hr className='my-2' />
                           <div className='d-flex align-items-center'>
                              <p className='w-50 fw-bold'>Project State</p>
                              <div>
                                 {
                                    offer.request.Status == 'Open'
                                       ?
                                       <p className='bg-success text-white rounded-3 p-1'>Open</p>
                                       :
                                       <p className='bg-danger text-white rounded-3 p-1'>Closed</p>
                                 }
                              </div>
                           </div>
                           <div className='d-flex'>
                              <p className='w-50 fw-bold'>Posted</p>
                              <div className='w-50'><p>{formatDistanceToNow(new Date(offer.request.PostDate), { addSuffix: true }).replace(/^about/, '')}</p></div>
                           </div>
                           <div className='d-flex'>
                              <p className='w-50 fw-bold'>Budget</p>
                              <div className='w-50'>{offer.request.Budget} EGP</div>
                           </div>
                           <div className='d-flex'>
                              <p className='w-50 fw-bold'>Average Offers</p>
                              <div className='w-50'>{offer.AVGOffers} EGP</div>
                           </div>
                           <div className='d-flex'>
                              <p className='w-50 fw-bold mb-2 text-break'>Number of Offers</p>
                              <div className='w-50'>{offer.numberofOffers}</div>
                           </div>
                           <hr className='my-2 mb-3' />
                           <div className='d-inline-block'>
                              <Link to={`/profile/${offer.OwnerProfile.id}`} className='d-flex align-items-center text-dark'>
                                 <img src={url + offer.OwnerProfile.profileImage} height={60} width={60} className='rounded-circle ' alt="" />
                                 <div className='ms-2'>
                                    <p className='fw-semibold poppins-regular my-1'>{offer.OwnerProfile.Fname + ' ' + offer.OwnerProfile.Lname}</p>
                                    <p className='mb-1 text-secondary'><i className="fa fa-fw fa-briefcase"></i> {offer.OwnerProfile.Title}</p>
                                 </div>
                              </Link>
                           </div>
                        </div>
                        {
                           myDetails != '' && offer.request.UserID != myDetails.id && offer.request.Status == 'Open'
                              ?
                              <div id="AddOffer" className='shadow p-4 mt-4 rounded-4'>
                                 <h4>{offer.MyOffer[0]?.Decline ? <>Unfortunately, your offer has been <span className='text-danger'>declined</span></> : offer.CanAddOffer ? 'Add your offer now' : "You've added your offer"}</h4>
                                 <hr className='my-2' />
                                 <form onSubmit={formik.handleSubmit}>
                                    <div className='d-flex gap-3 mt-3'>
                                       <div className='w-50'>
                                          <label htmlFor="Price" className="form-label fw-bold">
                                             Value Purpose<span className='main-text'>*</span>
                                          </label>
                                          <div className="input-group">
                                             <input
                                                type="number"
                                                className="form-control"
                                                name="Price"
                                                id='Price'
                                                placeholder="Enter Offer Price..."
                                                defaultValue={offer.MyOffer.length ? offer.MyOffer[0]?.Price : ''}
                                                key={offer.MyOffer.length ? offer.MyOffer[0]?.Price : ''}
                                                onChange={handlePriceChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!offer.CanAddOffer}
                                             />
                                             <span className="input-group-text">EGP</span>
                                          </div>
                                          {formik.errors.Price && formik.touched.Price ? <div className="alert alert-danger p-2 mt-2 mb-0">{formik.errors.Price}</div> : null}
                                       </div>
                                       <div className='w-50'>
                                          <label className="form-label fw-bold">
                                             His Dues<span className='main-text'>*</span>
                                          </label>
                                          <div className="input-group">
                                             <input
                                                disabled={true}
                                                defaultValue={offer.MyOffer.length ? offer.MyOffer[0]?.Price * 0.8 : reducedPrice}
                                                key={offer.MyOffer.length ? offer.MyOffer[0]?.Price * 0.8 : reducedPrice}
                                                type="text"
                                                className="form-control"
                                             />
                                             <span className="input-group-text">EGP</span>
                                          </div>
                                       </div>
                                    </div>
                                    <div className='mt-3'>
                                       <label htmlFor="Offerdesc" className="form-label fw-bold">
                                          Offer Details<span className='main-text'>*</span>
                                       </label>
                                       <textarea
                                          className="form-control"
                                          name='Offerdesc'
                                          id="Offerdesc"
                                          onChange={formik.handleChange}
                                          onBlur={formik.handleBlur}
                                          defaultValue={offer.MyOffer.length ? offer.MyOffer[0]?.Offerdesc : ''}
                                          key={offer.MyOffer.length ? offer.MyOffer[0]?.Offerdesc : ''}
                                          placeholder="Enter a detailed description of your offer"
                                          rows="5"
                                          disabled={!offer.CanAddOffer}
                                       />
                                       {formik.errors.Offerdesc && formik.touched.Offerdesc ? <div className="alert alert-danger p-2 mt-2 mb-0">{formik.errors.Offerdesc}</div> : null}
                                    </div>
                                    {
                                       offer.MyOffer[0]?.Decline
                                          ?
                                          ""
                                          :
                                          offer.CanAddOffer
                                             ?
                                             <button type="submit" className="btn btn-primary mt-3" disabled={btnLoader}>
                                                {
                                                   btnLoader
                                                      ?
                                                      <i className='fa fa-spinner fa-spin'></i>
                                                      :
                                                      'Add Offer'
                                                }
                                             </button>
                                             :
                                             <button type="submit" className="btn btn-danger mt-3" disabled={btnLoader}>
                                                {
                                                   btnLoader
                                                      ?
                                                      <i className='fa fa-spinner fa-spin'></i>
                                                      :
                                                      'Delete Offer'
                                                }
                                             </button>
                                    }
                                 </form>
                              </div>
                              :
                              ''
                        }
                     </div>
                     <div className="col-lg-4">
                        <div id="ProjectCard" className='shadow p-4 rounded-4 d-none d-lg-block mb-4'>
                           <h4>Project Card</h4>
                           <hr className='my-2' />
                           <div className='d-flex align-items-center'>
                              <p className='w-50 fw-bold'>Project State</p>
                              <div>
                                 {
                                    offer.request.Status == 'Open'
                                       ?
                                       <p className='bg-success text-white rounded-3 p-1'>Open</p>
                                       :
                                       <p className='bg-danger text-white rounded-3 p-1'>Closed</p>
                                 }
                              </div>
                           </div>
                           <div className='d-flex'>
                              <p className='w-50 fw-bold'>Posted</p>
                              <div className='w-50'><p>{formatDistanceToNow(new Date(offer.request.PostDate), { addSuffix: true }).replace(/^about/, '')}</p></div>
                           </div>
                           <div className='d-flex'>
                              <p className='w-50 fw-bold'>Budget</p>
                              <div className='w-50'>{offer.request.Budget} EGP</div>
                           </div>
                           <div className='d-flex'>
                              <p className='w-50 fw-bold'>Average Offers</p>
                              <div className='w-50'>{offer.AVGOffers} EGP</div>
                           </div>
                           <div className='d-flex'>
                              <p className='w-50 fw-bold mb-2 text-break'>Number of Offers</p>
                              <div className='w-50'>{offer.numberofOffers}</div>
                           </div>
                           <hr className='my-2 mb-3' />
                           <div>
                              <Link to={`/profile/${offer.OwnerProfile.id}`} className='d-flex align-items-center text-dark'>
                                 <img src={url + offer.OwnerProfile.profileImage} height={60} width={60} className='rounded-circle ' alt="" />
                                 <div className='ms-2'>
                                    <p className='fw-semibold poppins-regular my-1'>{offer.OwnerProfile.Fname + ' ' + offer.OwnerProfile.Lname}</p>
                                    <p className='mb-1 text-secondary'><i className="fa fa-fw fa-briefcase"></i> {offer.OwnerProfile.Title}</p>
                                 </div>
                              </Link>
                           </div>
                        </div>
                        <div id="CopyLink" className='shadow p-4 rounded-4'>
                           <h4>Share the project</h4>
                           <hr className='my-2 mb-3' />
                           <div className="input-group">
                              <input
                                 disabled={true}
                                 type="text"
                                 className="form-control"
                                 value={window.location.href}
                              />
                              <button className='btn btn-primary' onClick={() => {
                                 navigator.clipboard.writeText(window.location.href);
                              }}><i className="fa-solid fa-copy"></i></button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
         }
      </>
   )
}