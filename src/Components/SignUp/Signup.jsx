import React, { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';
import * as yup from 'yup';

function Signup({ next, setId }) {

   const validationSchema = yup.object({
      Fname: yup.string().min(3, 'At least 3 characters').max(15, 'At most 15 characters').required('Enter your first name'),
      Lname: yup.string().min(3, 'At least 3 characters').max(15, 'At most 15 characters').required('Enter your last name'),
      email: yup.string().email('Enter a valid email').required('Email is a required field'),
      password: yup.string().matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least 8 characters, one letter, and one number').required('Password is a required field'),
      rePassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm Password is a required field '),
   });

   const [errorMessage, setErrorMessage] = useState('')
   const [Loading, setLoading] = useState(false);
   const [url, setUrl] = useRecoilState(baseUrl)

   async function SendDataToApi(values) {
      setLoading(true);
      const { rePassword, ...dataToSend } = values;
      try {
         const { data } = await axios.post(url + 'api/signup', dataToSend);
         setId(data.User.id)
         next()
      } catch ({ response }) {
         setErrorMessage(response?.data?.MSG || 'An error occurred');
         setLoading(false);
      }
   }

   const register = useFormik({
      initialValues: {
         Fname: '',
         Lname: '',
         email: '',
         password: '',
         rePassword: '',
      },
      validationSchema,
      onSubmit: (values) => {
         SendDataToApi(values);
      },
   });

   return (
      <section>
         <h3 className="text-center">Sign Up</h3>
         <p className="small text-secondary text-center">Welcome! Please sign up to access your account.</p>
         <form onSubmit={register.handleSubmit}>
            <label htmlFor="Fname" className="fw-bold mb-2">Name</label>
            <div className="input-group">
               <input
                  type="text"
                  className="form-control"
                  onBlur={register.handleBlur}
                  onKeyUp={register.handleBlur}
                  onChange={register.handleChange}
                  id="Fname"
                  name="Fname"
                  placeholder='First Name'
               />
               <input
                  type="text"
                  className="form-control"
                  onBlur={register.handleBlur}
                  onKeyUp={register.handleBlur}
                  onChange={register.handleChange}
                  id="Lname"
                  name="Lname"
                  placeholder='Last Name'
               />
            </div>
            <div className={`input-group ${(register.errors.Fname && register.touched.Fname) || (register.errors.Lname && register.touched.Lname) ? 'mt-3' : 'm-0'}`}>
               {register.errors.Fname && register.touched.Fname ? <div className="alert alert-danger p-2 w-50 m-0">{register.errors.Fname}</div> : <div className='w-50 m-0'></div>}
               {register.errors.Lname && register.touched.Lname ? <div className="alert alert-danger p-2 w-50 m-0">{register.errors.Lname}</div> : ''}
            </div>
            <label htmlFor="email" className="mb-2 mt-3 fw-bold">Email</label>
            <input
               onBlur={register.handleBlur}
               onKeyUp={register.handleBlur}
               onChange={register.handleChange}
               type="email"
               className="form-control"
               id="email"
               name="email"
               placeholder="Email"
            />
            {register.errors.email && register.touched.email ? <div className="alert alert-danger p-2 mt-3 mb-0">{register.errors.email}</div> : null}
            <label htmlFor="password" className="mb-2 mt-3 fw-bold">Password</label>
            <input
               onBlur={register.handleBlur}
               onKeyUp={register.handleBlur}
               onChange={register.handleChange}
               type="password"
               className="form-control"
               id="password"
               name="password"
               placeholder="Password"
            />
            {register.errors.password && register.touched.password ? <div className="alert alert-danger p-2 mt-3 mb-0">{register.errors.password}</div> : null}
            <label htmlFor="rePassword" className="mb-2 mt-3 fw-bold">Confirm Password</label>
            <input
               onBlur={register.handleBlur}
               onKeyUp={register.handleBlur}
               onChange={register.handleChange}
               type="password"
               className="form-control"
               id="rePassword"
               name="rePassword"
               placeholder="Confirm Password"
            />
            {register.errors.rePassword && register.touched.rePassword ? <div className="alert alert-danger p-2 mt-3 mb-0">{register.errors.rePassword}</div> : null}
            {errorMessage ? <div className="alert alert-danger p-2 mt-3 mb-0">{errorMessage}</div> : null}
            <div className="text-center my-3 mt-4">
               <button type="submit" className="btn btn-lg btn-primary w-50 text-nowrap" disabled={Loading}>
                  {Loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Sign Up'}
               </button>
            </div>
         </form>
         <h6 className='text-center'>Have an account? <Link to="/login">Login</Link></h6>
      </section>
   );
}

export default Signup;

