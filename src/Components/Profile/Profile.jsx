import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Spinner from '../Spinner/Spinner'
import { useFormik } from 'formik'
import { useRecoilState } from 'recoil'
import { baseUrl } from '../Atoms/BaseUrl'
import { navName, navPhoto } from '../Atoms/NavAtom'
import { jwtDecode } from 'jwt-decode'
import { useParams } from 'react-router-dom'
import { Rating } from 'primereact/rating'
import ProfileCompletedProjects from './ProfileCompletedProjects/ProfileCompletedProjects'

export default function Profile() {

   const myId = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')).id : ''
   const { id } = useParams()

   const [profile, setProfile] = useState([])
   const [loading, setLoading] = useState(true)
   const [edit, setEdit] = useState(false)
   const [skills, setSkills] = useState([])
   const [addedSkills, setAddedSkills] = useState([])
   const [deletedSkills, setDeletedSkills] = useState([])
   const [photo, setPhoto] = useState('')
   const [navImage, setNavImage] = useRecoilState(navPhoto)
   const [name, setName] = useRecoilState(navName)
   const [url, setUrl] = useRecoilState(baseUrl)

   useEffect(() => {
      getUserData()
   }, [id])

   const calculateAge = (birthDate) => {
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDifference = today.getMonth() - birthDateObj.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
         age--;
      }
      return age
   };

   async function getUserData() {
      try {
         setLoading(true)
         const { data } = await axios.get(url + `api/getprofile/${id}`)
         setProfile(data)
         setSkills(data.Skills)
         setPhoto(url + data.profile.profileImage)
         if (myId == id)
            updateProfileState(data)
         setLoading(false)
         console.log(data);
      } catch (error) {
         console.log("An Error Occurred", error);
      }

   }

   const updateProfileState = (data) => {
      setNavImage(url + data.profile.profileImage)
      localStorage.setItem('navPhoto', url + data.profile.profileImage)
      setName(data.profile.Fname + ' ' + data.profile.Lname)
      localStorage.setItem('navName', data.profile.Fname + ' ' + data.profile.Lname)
   }

   const submitProfile = () => {
      formik.handleSubmit()
      setEdit(false)
   }

   const handleFileChange = (e) => {
      const file = e.target.files[0]
      formik.setFieldValue('image', file)
      if (file) {
         setPhoto(URL.createObjectURL(file))
      }
   }

   const handleSkillAddition = (e) => {
      if (e.key == 'Enter' && e.target.value) {
         addedSkills.push(e.target.value)
         skills.push({ skill: e.target.value })
         setSkills([...skills])
         e.target.value = ''
      }
   }

   const handleSkillDeletion = (index) => {
      console.log(skills, index);
      deletedSkills.push(skills[index].skill)
      skills.splice(index, 1)
      setSkills([...skills])
   }

   const createFormData = (values) => {
      const formdata = new FormData()
      formdata.append("Fname", values.Fname.split(' ')[0])
      formdata.append("Lname", values.Fname.split(' ')[1])
      formdata.append("title", values.Title)
      formdata.append("phone", values.phone)
      formdata.append("profiledescription", values.profiledescription)
      formdata.append("HourSalary", values.HourSalary)
      formdata.append("newskills", addedSkills)
      formdata.append("deleteskills", deletedSkills)
      formdata.append("image", values.image)
      return formdata;
   }

   const updateUserData = async (formdata) => {
      return await axios.put(url + `api/editprofile/${id}`, formdata, {
         headers: {
            token: localStorage.getItem('token')
         }
      })
   }

   const formik = useFormik({
      initialValues: {
         Fname: profile?.profile?.Fname + ' ' + profile?.profile?.Lname,
         Title: profile?.profile?.Title,
         profiledescription: profile?.profile?.profiledescription,
         phone: profile?.profile?.phone,
         HourSalary: profile?.profile?.HourSalary,
         BirthDate: profile?.profile?.BirthDate,
         newskills: addedSkills,
         deleteskills: deletedSkills,
         image: null,
      },
      enableReinitialize: true,
      onSubmit: async (values) => {
         const formdata = createFormData(values)
         try {
            await updateUserData(formdata)
            await getUserData()
         } catch (error) {
            console.log("An Error Occurred", error)
         }
      }
   })

   if (loading) return <Spinner />

   return (
      <section id="profile" className="container nav-margin mb-5">
         <div className="row">
            <div className="col-lg-4">
               <div className="shadow bg-white rounded-4 mb-4">
                  <div className="text-center p-3">
                     <div className='position-relative'>
                        <img src={photo} alt="User Profile Picture" className="rounded-circle" width={128} height={128} />
                        {
                           edit ?
                              <>
                                 <label htmlFor="editphoto" className='position-absolute' style={{ cursor: 'pointer' }} >
                                    <i className="fa-solid fa-pencil main-bg text-white p-2 rounded-circle"></i>
                                 </label>
                                 <input
                                    type="file"
                                    name='profileImage'
                                    id="editphoto"
                                    onChange={handleFileChange}
                                 />
                              </>
                              : ""
                        }
                     </div>
                     <div className="mt-3">
                        <input
                           type="text"
                           name='Fname'
                           readOnly={!edit}
                           key={`${profile.profile.Fname} ${profile.profile.Lname}`}
                           defaultValue={`${profile.profile.Fname} ${profile.profile.Lname}`}
                           onChange={formik.handleChange}
                           className={`form-control${edit ? '' : '-plaintext'} text-center fs-4 fw-semibold p-0`}
                        />
                        <input
                           type="text"
                           name='Title'
                           key={profile.profile.Title}
                           defaultValue={profile.profile.Title}
                           onChange={formik.handleChange}
                           className={`form-control${edit ? ' my-2' : '-plaintext'} text-muted text-center`}
                           readOnly={!edit}
                        />
                        <textarea
                           name='profiledescription'
                           readOnly={!edit}
                           rows={4}
                           key={profile.profile.profiledescription}
                           defaultValue={profile.profile.profiledescription}
                           onChange={formik.handleChange}
                           className={`form-control${edit ? '' : '-plaintext'} px-2 editTextArea`}
                        />
                     </div>
                     {
                        myId == id
                           ?
                           edit ?
                              <div className='d-flex gap-2'>
                                 <button className='btn btn-primary w-100 mt-3' onClick={submitProfile} type='submit'>
                                    Submit
                                 </button>
                                 <button className='btn btn-secondary w-100 mt-3' type='reset' onClick={() => {
                                    getUserData()
                                    setEdit(false);
                                 }}>
                                    Cancel
                                 </button>
                              </div>
                              :
                              <button className='btn btn-primary w-100 mt-3' onClick={() => setEdit(true)}>
                                 Edit Profile
                              </button>
                           : ''
                     }
                  </div>
               </div>
            </div>
            <div className="col-lg-8">
               <div className="row">
                  <div className="col-md-6">
                     <div className="shadow bg-white rounded-4 mb-4">
                        <ul className="list-group list-group-flush rounded-4">
                           <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                              <label className="form-label mb-0 fw-bold" htmlFor="email">Email: </label>
                              <input
                                 type="text"
                                 className={`form-control-plaintext w-75`}
                                 id="email"
                                 name='email'
                                 key={profile.profile.email}
                                 defaultValue={profile.profile.email}
                                 readOnly />
                           </li>
                           <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                              <label className="form-label mb-0 fw-bold" htmlFor="phone">Phone: </label>
                              <input
                                 type="tel"
                                 name='phone'
                                 id="phone"
                                 readOnly={!edit}
                                 key={profile.profile.phone}
                                 defaultValue={profile.profile.phone}
                                 onChange={formik.handleChange}
                                 className={`form-control${edit ? '' : '-plaintext'} w-75`}
                              />
                           </li>
                           <li className="list-group-item d-flex justify-content-between align-items-center">
                              <label className="form-label mb-0 fw-bold" htmlFor="BirthDate">Age: </label>
                              <input
                                 type="number"
                                 name="BirthDate"
                                 id="BirthDate"
                                 defaultValue={calculateAge(profile.profile.BirthDate)}
                                 onChange={formik.handleChange}
                                 className={`form-control-plaintext w-75`}
                                 readOnly
                              />
                           </li>
                        </ul>
                     </div>
                  </div>
                  <div className="col-md-6">
                     <div className="shadow bg-white rounded-4 mb-4">
                        <ul className="list-group list-group-flush rounded-4">
                           <li className="list-group-item d-flex align-items-center flex-wrap">
                              <label className="form-label mb-0 fw-bold" htmlFor="rating">Rating: </label>
                              <div className='ms-4' style={{ margin: '7.5px 0' }}>
                                 <Rating value={profile.Rating} cancel={false} disabled readOnly />
                              </div>
                           </li>
                           <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                              <label className="form-label mb-0 fw-bold" htmlFor="project">Projects: </label>
                              <input
                                 type="number"
                                 id="project"
                                 className={`form-control-plaintext w-50`}
                                 readOnly
                                 key={profile.NoOfCompletedProjects}
                                 defaultValue={profile.NoOfCompletedProjects}
                                 name='NoOfCompletedProjects'
                              />
                           </li>
                           <li className="list-group-item d-flex justify-content-between align-items-center">
                              <label className="form-label mb-0 fw-bold" htmlFor="hoursalary">Hourly Salary: </label>
                              <input
                                 type="number"
                                 id="hoursalary"
                                 name='HourSalary'
                                 readOnly={!edit}
                                 onChange={formik.handleChange}
                                 key={profile.profile.HourSalary}
                                 defaultValue={profile.profile.HourSalary}
                                 className={`form-control${edit ? '' : '-plaintext'} w-50`}
                              />
                           </li>
                        </ul>
                     </div>
                  </div>
                  <div className="col-md-12">
                     <div className="shadow bg-white p-4 rounded-4">
                        <div>
                           <div className='d-flex justify-content-between align-items-center flex-wrap mb-3'>
                              <h3 className='mb-0 ms-1'>{edit ? 'Edit' : 'My'} Skills</h3>
                              <input
                                 type="text"
                                 className={`form-control${edit ? '' : '-plaintext'}`}
                                 style={{ width: '65%' }}
                                 placeholder={`${edit ? 'Add Skills Here...' : ''}`}
                                 readOnly={!edit}
                                 onKeyDown={handleSkillAddition}
                              />
                           </div>
                           <div>
                              {
                                 skills.map((skill, index) => (
                                    <div className='alert alert-primary d-inline-block p-2 mx-1 mb-2' key={index}>
                                       {
                                          !edit
                                             ? <><i className="fa-solid fa-tag"></i> {skill.skill}</>
                                             :
                                             <>{skill.skill}
                                                <span className='fw-bold ms-2' style={{ cursor: 'pointer' }}
                                                   onClick={() => { handleSkillDeletion(index) }}
                                                >
                                                   <i className="fa-solid fa-xmark"></i>
                                                </span>
                                             </>
                                       }
                                    </div>
                                 ))
                              }
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="col-md-12">
                     <ProfileCompletedProjects Projects={profile.CompletedProjects} />
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}