import React, { useState } from 'react';
import { useFormik } from 'formik';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as yup from 'yup';

export default function FindAssistant() {

   const navigate = useNavigate();
   const id = jwtDecode(localStorage.getItem('token')).id

   const validationSchema = yup.object({
      Topic: yup.string().min(5, 'At least 5 characters').required('Title is required'),
      RequestDesc: yup.string().min(10, 'At least 10 characters').required('Description is required'),
      Type: yup.string().required('Type is required'),
      Category: yup.string().required('Category is required'),
      Budget: yup.number().min(40, 'The least budget is 40 EGP').typeError('Salary must be a number').required('Budget is required'),
      skills: yup.array().of(yup.string()).min(3, 'At least 3 skills are required').max(10, 'At most 10 skills are allowed').required('Skills are required')
   });

   const [Loading, setLoading] = useState(false);
   const [skills, setSkills] = useState([]);
   const [skillInput, setSkillInput] = useState('');
   const [skillErrorMessage, setSkillErrorMessage] = useState('');
   const [url, setUrl] = useRecoilState(baseUrl)

   async function SendDataToApi(values) {
      setLoading(true);
      try {
         await axios.post(url + 'api/addrequest', values, {
            headers: {
               token: localStorage.getItem('token')
            }
         });
         navigate('/myrequests');
      } catch ({ response }) {
         Swal.fire({
            icon: "error",
            html: `<h4>${response.data.MSG}</h4>`,
            showConfirmButton: false,
            timer: 2000
         })
      } finally {
         setLoading(false);
      }
   }

   const register = useFormik({
      initialValues: {
         Topic: '',
         RequestDesc: '',
         Type: '',
         Category: '',
         Budget: '',
         UserID: id,
         skills: [],
      },
      validationSchema,
      onSubmit: (values) => {
         SendDataToApi(values);
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
            register.setFieldValue('skills', updatedSkills);
            setSkillInput('');
         } else if (skills.includes(skillInput.trim())) {
            setSkillErrorMessage('Skill already added');
            setTimeout(() => setSkillErrorMessage(''), 1000);
         }
      }
   };

   const handleDeleteSkill = (index) => {
      const newSkills = skills.filter((_, i) => i !== index);
      setSkills(newSkills);
      register.setFieldValue('skills', newSkills);
   };

   return (
      <div className="container nav-margin mb-4">
         <div className='shadow bg-white p-4 py-md-5 px-3 px-md-5 rounded-4'>
            <h2 className="text-center poppins-regular fw-semibold">Find Assistant</h2>
            <form onSubmit={register.handleSubmit}>
               <div className="mb-3">
                  <label htmlFor="Title" className="form-label">
                     Title<span className='main-text'>*</span>
                  </label>
                  <input
                     type="text"
                     className="form-control"
                     id="Title"
                     name="Topic"
                     placeholder="Write a title for your project."
                     onChange={register.handleChange}
                     onBlur={register.handleBlur}
                     onKeyUp={register.handleBlur}
                  />
                  {register.touched.Topic && register.errors.Topic ? <div className="text-danger">{register.errors.Topic}</div> : null}
               </div>
               <div className="mb-3">
                  <label htmlFor="Description" className="form-label">
                     Description<span className='main-text'>*</span>
                  </label>
                  <textarea
                     className="form-control"
                     id="Description"
                     name="RequestDesc"
                     placeholder="Enter a detailed description of your project."
                     rows={3}
                     onChange={register.handleChange}
                     onBlur={register.handleBlur}
                     onKeyUp={register.handleBlur}
                  />
                  {register.touched.RequestDesc && register.errors.RequestDesc ? <div className="text-danger">{register.errors.RequestDesc}</div> : null}
               </div>
               <div className="row mb-3">
                  <div className="col-md-4 mb-3">
                     <label htmlFor="Type" className="form-label">
                        Type<span className='main-text'>*</span>
                     </label>
                     <select
                        id="Type"
                        name="Type"
                        className="form-select"
                        defaultValue={"default"}
                        onChange={register.handleChange}
                        onBlur={register.handleBlur}
                     >
                        <option hidden disabled value="default">
                           Choose your type
                        </option>
                        <option value="CareerGuidance">Career Guidance</option>
                        <option value="AcademicSupport">Academic Support</option>
                     </select>
                     {register.touched.Type && register.errors.Type ? <div className="text-danger">{register.errors.Type}</div> : null}
                  </div>
                  <div className="col-md-4 mb-3">
                     <label htmlFor="Category" className="form-label">
                        Category<span className='main-text'>*</span>
                     </label>
                     <select
                        id="Category"
                        name="Category"
                        defaultValue={"default"}
                        className="form-select"
                        onChange={register.handleChange}
                        onBlur={register.handleBlur}
                     >
                        <option hidden disabled value={"default"}>
                           Choose your category
                        </option>
                        <option value="ComputerScience">Computer Science</option>
                        <option value="Other">Other</option>
                     </select>
                     {register.touched.Category && register.errors.Category ? <div className="text-danger">{register.errors.Category}</div> : null}
                  </div>
                  <div className="col-md-4">
                     <label htmlFor="Salary" className="form-label">
                        Expected budget<span className='main-text'>*</span>
                     </label>
                     <div className="input-group">
                        <input
                           type="number"
                           className="form-control"
                           id="Salary"
                           name="Budget"
                           placeholder='Enter your expected budget'
                           onChange={register.handleChange}
                           onBlur={register.handleBlur}
                           onKeyUp={register.handleBlur}
                        />
                        <span className='input-group-text'>EGP</span>
                     </div>
                     {register.touched.Budget && register.errors.Budget ? <div className="text-danger">{register.errors.Budget}</div> : null}
                  </div>
               </div>
               <div className='mb-3'>
                  <label htmlFor="AddSkill" className='form-label'>
                     Add Skill<span className="main-text">*</span>
                  </label>
                  <input
                     type="text"
                     name="skills"
                     id="AddSkill"
                     className="form-control"
                     placeholder='Click Enter to add a skill'
                     value={skillInput}
                     onChange={handleSkillInputChange}
                     onKeyDown={handleSkillKeyPress}
                     disabled={skills.length >= 10}
                  />
               </div>
               {skillErrorMessage && <div className="alert alert-danger p-2 mt-3">{skillErrorMessage}</div>}
               {register.errors.skills && register.touched.skills ? <div className="alert alert-danger p-2 m-0">{register.errors.skills}</div> : null}
               {skills.length > 0 && (
                  <div>
                     <label htmlFor="Skills" className='form-label mb-0'>
                        Skills<span className="main-text">*</span>
                     </label>
                     <div className="d-flex flex-wrap">
                        {skills.map((skill, index) => (
                           <div className='alert alert-primary p-2 me-2 mt-2 mb-0' key={index}>
                              {skill}
                              <span
                                 className='fw-bold ms-2'
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
               <button className="btn btn-primary w-100 mt-4" id="btnAdd" type="submit" disabled={Loading}>
                  {
                     Loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Submit'
                  }
               </button>
            </form>
         </div>
      </div>
   );
}
