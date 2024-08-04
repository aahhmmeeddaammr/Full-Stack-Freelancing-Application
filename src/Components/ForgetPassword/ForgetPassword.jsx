import axios from 'axios';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import * as yup from 'yup';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';

export default function ForgetPassword({ next, setEmail }) {

    const validationSchema = yup.object({
        email: yup.string().email('Enter a Valid Email').required('Email is a required field'),
    });

    const [ErrorMessage, setErrorMessage] = useState('');
    const [Loading, setLoading] = useState(false);
    const [url, setUrl] = useRecoilState(baseUrl)

    async function forgetPassword(values) {
        setLoading(true);
        try {
            const { data } = await axios.post(url + `api/getotp`, values)
            setEmail(data.email)
            next()
        } catch (error) {
            console.log(error);
            setErrorMessage(error?.response?.data.MSG || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }

    const forget = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema,
        onSubmit: (values) => {
            forgetPassword(values);
        },
    });

    return (
        <>
            <section>
                <h3 className="text-center">Forget Password</h3>
                <p className="small text-secondary text-center">Please follow the instructions below to reset your password securely</p>
                <form onSubmit={forget.handleSubmit}>
                    <label htmlFor="email" className="mb-2 fw-bold">Email</label>
                    <input
                        onBlur={forget.handleBlur}
                        onKeyUp={forget.handleBlur}
                        onChange={forget.handleChange}
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        placeholder="Email"
                    />
                    {forget.errors.email && forget.touched.email ? <div className='alert alert-danger mt-3 mb-0 p-2 text-center'>{forget.errors.email}</div> : ''}
                    {ErrorMessage && <div className="alert alert-danger p-2 mt-3 mb-0">{ErrorMessage}</div>}
                    <div className="text-center my-3">
                        <button type="submit" className="btn btn-primary px-5 py-2" disabled={Loading}>
                            {Loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Continue'}
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}
