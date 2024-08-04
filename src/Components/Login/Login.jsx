import axios from 'axios';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useRecoilState } from 'recoil';
import { navName, navPhoto } from '../Atoms/NavAtom';
import { baseUrl } from '../Atoms/BaseUrl';

export default function Login() {

  let navigate = useNavigate();

  const validationSchema = yup.object({
    email: yup.string().email('Enter a Valid Email').required('Email is a required field'),
    password: yup.string().required('Password is a required field')
  });

  const [ErrorMessage, setErrorMessage] = useState('');
  const [Loading, setLoading] = useState(false);
  const [photo, setPhoto] = useRecoilState(navPhoto)
  const [name, setName] = useRecoilState(navName)
  const [url, setUrl] = useRecoilState(baseUrl)

  async function SendDataToApi(values) {
    setLoading(true);
    try {
      const { data } = await axios.post(url + 'api/login', values);
      localStorage.setItem('token', data.token);
      setName(data.User.Fname + ' ' + data.User.Lname)
      localStorage.setItem('navName', data.User.Fname + ' ' + data.User.Lname)
      setPhoto(url + data.User.profileImage)
      localStorage.setItem('navPhoto', url + data.User.profileImage)
      navigate('/');
    } catch (error) {
      console.log(error);
      setErrorMessage(error?.response?.data.MSG || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const Login = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: (values) => {
      SendDataToApi(values);
    },
  });

  return (
    <>
      <section className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-lg-8">
            <div className="bg-white shadow rounded border p-4 p-md-5">
              <h3 className="text-center">Login</h3>
              <p className="small text-secondary text-center">Welcome back! Please log in to access your account.</p>
              <form onSubmit={Login.handleSubmit}>
                <label htmlFor="email" className="my-3 fw-bold">Email</label>
                <input
                  onBlur={Login.handleBlur}
                  onKeyUp={Login.handleBlur}
                  onChange={Login.handleChange}
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Email"
                />
                {Login.errors.email && Login.touched.email ? <div className='alert alert-danger mt-3 mb-0 p-2 text-center'>{Login.errors.email}</div> : ''}
                <label htmlFor="password" className="my-3 fw-bold">Password</label>
                <input
                  onBlur={Login.handleBlur}
                  onKeyUp={Login.handleBlur}
                  onChange={Login.handleChange}
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Password"
                />
                {Login.errors.password && Login.touched.password ? <div className='alert alert-danger mt-3 mb-0 p-2 text-center'>{Login.errors.password}</div> : ''}
                <Link to={'/forgetpassword'} className="d-inline-block my-3 fw-semibold">Forget Password?</Link>
                {ErrorMessage && <div className="alert alert-danger p-2">{ErrorMessage}</div>}
                <div className="text-center my-3">
                  <button type="submit" className="btn btn-lg btn-primary w-75" disabled={Loading}>
                    {Loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Login'}
                  </button>
                </div>
              </form>
              <h6 className='text-center'>Don't have an account? <Link to="/signup" className="fw-semibold"> Sign Up</Link></h6>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

