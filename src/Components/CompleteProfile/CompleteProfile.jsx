import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as yup from 'yup';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';

export default function CompleteProfile({ id }) {

   const navigate = useNavigate();

   const today = new Date();
   const minAge = new Date(
      today.getFullYear() - 17,
      today.getMonth(),
      today.getDate()
   );

   const validationSchema = yup.object({
      title: yup.string().min(3, 'At least 3 characters').required('Title is a required field'),
      profiledescription: yup.string().min(10, 'At least 10 characters').required('Profile Description is a required field'),
      HourSalary: yup.number().min(1, 'At least $1').max(1000, 'At most $1000').required('Hourly Salary is a required field'),
      age: yup.date().max(minAge, 'You must be at least 18 years old').required('Birthdate is required'),
      Faculty: yup.string().required('Faculty is required'),
      image: yup.mixed().required('Profile Image is a required field'),
      phone: yup.string().matches(/^\d{11}$/, 'Phone must be in the format of 11 numbers').required('Phone Number is a required field'),
      skills: yup.array().of(yup.string()).min(3, 'At least 3 skills are required').max(10, 'At most 10 skills are allowed').required('Skills are required')
   })

   const [errorMessage, setErrorMessage] = useState('');
   const [loading, setLoading] = useState(false);
   const [skills, setSkills] = useState([]);
   const [skillInput, setSkillInput] = useState('');
   const [skillErrorMessage, setskillErrorMessage] = useState('');
   const [photo, setPhoto] = useState('https://placehold.co/80x80')
   const [url, setUrl] = useRecoilState(baseUrl)

   async function sendDataToApi(values) {
      setLoading(true);
      try {
         const { data } = await axios.post(url + `api/completeProfile/${id}`, values);
         navigate('/login');
      } catch (error) {
         setErrorMessage(error?.response?.data.MSG || 'An error occurred');
         console.log(error);
         setLoading(false);
      }
   }

   const formik = useFormik({
      initialValues: {
         title: '',
         profiledescription: '',
         HourSalary: '',
         Faculty: '',
         age: null,
         image: null,
         phone: '',
         skills: [],
      },
      validationSchema,
      onSubmit: (values) => {
         const formData = new FormData();
         formData.append('title', values.title);
         formData.append('phone', values.phone);
         formData.append('profiledescription', values.profiledescription);
         formData.append('HourSalary', values.HourSalary);
         formData.append('Faculty', values.Faculty);
         formData.append('age', values.age);
         formData.append('image', values.image);
         formData.append('skills', skills);
         sendDataToApi(formData);
      },
   });

   const handleSkillInputChange = (e) => {
      setSkillInput(e.target.value);
   };

   const handleSkillKeyPress = (e) => {
      if (e.key === 'Enter') {
         e.preventDefault();
         if (skillInput.trim() && skills.length < 10 && !skills.includes(skillInput.trim())) {
            const updatedSkills = [...skills, skillInput.trim()];
            setSkills(updatedSkills);
            formik.setFieldValue('skills', updatedSkills);
            setSkillInput('');
         } else if (skills.includes(skillInput.trim())) {
            setskillErrorMessage('Skill already added');
            setTimeout(() => setskillErrorMessage(''), 2000);
         }
      }
   };

   const handleDeleteSkill = (index) => {
      const newSkills = skills.filter((_, i) => i !== index);
      setSkills(newSkills);
      formik.setFieldValue('skills', newSkills);
   };

   return (
      <section id="completeProfile">
         <h3 className="text-center">Complete Profile</h3>
         <p className="small text-secondary text-center mb-4">Welcome! Please complete your profile to access your account and begin</p>
         <form onSubmit={formik.handleSubmit}>
            <div className="row">
               <div className="col-md-12">
                  <label htmlFor="title" className="fw-bold mb-2">Title:</label>
                  <input
                     onBlur={formik.handleBlur}
                     onKeyUp={formik.handleBlur}
                     onChange={formik.handleChange}
                     value={formik.values.title}
                     type="text"
                     className="form-control"
                     id="title"
                     name="title"
                  />
                  {formik.errors.title && formik.touched.title ? <div className="alert alert-danger p-2 m-0 mt-3">{formik.errors.title}</div> : null}
               </div>
               <div className="col-md-12">
                  <hr className='mt-3 mb-0' />
               </div>
               <div className="col-md-6">
                  <label htmlFor="profiledescription" className="fw-bold mb-2 mt-3">Profile Description:</label>
                  <textarea
                     onBlur={formik.handleBlur}
                     onKeyUp={formik.handleBlur}
                     onChange={formik.handleChange}
                     value={formik.values.profiledescription}
                     type="text"
                     className="form-control"
                     id="profiledescription"
                     name="profiledescription"
                     rows={5}
                     style={{ resize: 'none' }}
                  />
                  {formik.errors.profiledescription && formik.touched.profiledescription ? <div className="alert alert-danger p-2 m-0 mt-3">{formik.errors.profiledescription}</div> : null}
               </div>
               <div className="col-md-6">
                  <label className="mb-2 mt-3 fw-bold">Profile Image:</label>
                  <div className='d-flex align-items-center'>
                     <div>
                        <img src={photo} width="80" height="80" className="rounded-circle me-4" />
                     </div>
                     <div>
                        <label htmlFor="image" className='d-block btn btn-outline-primary text-nowrap' style={{ cursor: 'pointer' }}>
                           <i className="fa-solid fa-upload"></i> Upload Image
                        </label>
                        <input
                           onBlur={formik.handleBlur}
                           onChange={(event) => {
                              let file = event.target.files[0]
                              if (file) {
                                 formik.setFieldValue('image', file);
                                 setPhoto(URL.createObjectURL(file));
                              }
                           }}
                           type="file"
                           id="image"
                           name="image"
                        />
                     </div>
                  </div>
                  {formik.errors.image && formik.touched.image ? <div className="alert alert-danger p-2 m-0 mt-3">{formik.errors.image}</div> : null}
               </div>
               <div className="col-md-12">
                  <hr className='mt-3 mb-0' />
               </div>
               <div className="col-md-6">
                  <label htmlFor="phone" className="mb-2 mt-3 fw-bold">Phone:</label>
                  <input
                     onBlur={formik.handleBlur}
                     onKeyUp={formik.handleBlur}
                     onChange={formik.handleChange}
                     value={formik.values.phone}
                     type="text"
                     className="form-control"
                     id="phone"
                     name="phone"
                  />
                  {formik.errors.phone && formik.touched.phone ? <div className="alert alert-danger p-2 m-0 mt-3">{formik.errors.phone}</div> : null}
               </div>
               <div className="col-md-6">
                  <label htmlFor="age" className="mb-2 mt-3 fw-bold">Birth Date:</label>
                  <input
                     onBlur={formik.handleBlur}
                     onChange={formik.handleChange}
                     type="date"
                     className="form-control"
                     id="age"
                     name="age"
                  />
                  {formik.errors.age && formik.touched.age ? <div className="alert alert-danger p-2 m-0 mt-3">{formik.errors.age}</div> : null}
               </div>
               <div className='col-md-6'>
                  <label htmlFor="HourSalary" className="mb-2 mt-3 fw-bold">Hourly Salary:</label>
                  <div className='input-group'>
                     <input
                        onBlur={formik.handleBlur}
                        onKeyUp={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.HourSalary}
                        type="number"
                        className="form-control"
                        id="HourSalary"
                        name="HourSalary"
                     />
                     <span className="input-group-text">EGP</span>
                  </div>
                  {formik.errors.HourSalary && formik.touched.HourSalary ? <div className="alert alert-danger p-2 m-0 mt-3">{formik.errors.HourSalary}</div> : null}
               </div>
               <div className="col-md-6">
                  <label htmlFor="Faculty" className="form-label mb-2 mt-3 fw-bold">
                     Faculty:
                  </label>
                  <select
                     id="Faculty"
                     name="Faculty"
                     defaultValue="default"
                     className="form-select"
                     onChange={formik.handleChange}
                     onBlur={formik.handleBlur}
                  >
                     <option hidden disabled value="default">
                        Choose your faculty
                     </option>
                     <optgroup label='Cairo University'>
                        <option value="Faculty of Computers and Artificial Intelligence, Cairo University">Faculty of Computers and Artificial Intelligence</option>
                     </optgroup>
                  </select>
                  {formik.touched.Faculty && formik.errors.Faculty ? <div className="alert alert-danger p-2 m-0 mt-3">{formik.errors.Faculty}</div> : null}
               </div>
               <div className="col-md-12">
                  <hr className='mt-3 mb-0' />
               </div>
               <div className="col-md-12">
                  <label htmlFor="AddSkill" className="form-label mt-3 mb-2 fw-bold">
                     Add Skill:
                  </label>
                  <input
                     type="text"
                     name="AddSkill"
                     id="AddSkill"
                     className="form-control"
                     value={skillInput}
                     onKeyUp={formik.handleBlur}
                     onChange={handleSkillInputChange}
                     onKeyDown={handleSkillKeyPress}
                     placeholder='Press enter to add skill'
                     disabled={skills.length >= 10}
                  />
                  {formik.errors.skills && formik.touched.skills ? <div className="alert alert-danger p-2 mt-3 mb-0">{formik.errors.skills}</div> : null}
               </div>
               <div className="col-md-12">
                  {skillErrorMessage && <div className="alert alert-danger p-2 mt-3 mb-0">{skillErrorMessage}</div>}
                  {skills.length > 0 && (
                     <div>
                        <label htmlFor="Skills" className="mb-2 mt-3 mb-2 fw-bold">
                           Skills<span className="main-text">*</span>
                        </label>
                        <div className="d-flex flex-wrap">
                           {skills.map((skill, index) => (
                              <div className="alert alert-primary p-2 me-2" key={index}>
                                 {skill}
                                 <span
                                    className="fw-bold ms-2"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleDeleteSkill(index)}
                                 >
                                    <i className="fa-solid fa-xmark"></i>
                                 </span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
            <div className="text-center my-3">
               <button type="submit" className="btn btn-lg btn-primary w-75 text-nowrap" disabled={loading}>
                  {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Complete Profile'}
               </button>
            </div>
         </form>
         {errorMessage && <div className="alert alert-danger mt-3 p-2 text-center">{errorMessage}</div>}
      </section>
   );
}