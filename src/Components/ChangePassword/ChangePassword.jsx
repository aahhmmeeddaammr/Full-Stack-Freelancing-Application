import React, { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';
import * as yup from 'yup';

export default function ChangePassword({ email }) {

    const nav = useNavigate()

    const validationSchema = yup.object({
        newpassword: yup.string().matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least 8 characters, one letter, and one number').required('Password is a required field'),
        rePassword: yup.string().oneOf([yup.ref('newpassword'), null], 'Passwords must match').required('Confirm Password is a required field '),
    });

    const [errorMessage, setErrorMessage] = useState('')
    const [Loading, setLoading] = useState(false);
    const [url, setUrl] = useRecoilState(baseUrl)

    async function resetPassword(values) {
        setLoading(true);
        const { rePassword, newpassword } = values;
        try {
            const { data } = await axios.post(url + 'api/resetpassword', { newpassword, email }, {
                headers: {
                    "X-XXXXX-X-X-XXX-xxx-x": "AhmedAAAAhhmedA",
                }
            });
            nav('/login')
        } catch ({ response }) {
            setErrorMessage(response?.data?.MSG || 'An error occurred');
            setLoading(false);
        }
    }

    const resetPass = useFormik({
        initialValues: {
            newpassword: '',
            rePassword: '',
        },
        validationSchema,
        onSubmit: (values) => {
            resetPassword(values);
        },
    });

    return (
        <section>
            <h3 className="text-center">Forget Password</h3>
            <p className="small text-secondary text-center">Enter your new password below, ensuring it meets the security requirements</p>
            <form onSubmit={resetPass.handleSubmit}>
                <label htmlFor="password" className="mb-2 fw-bold">Password</label>
                <input
                    onBlur={resetPass.handleBlur}
                    onKeyUp={resetPass.handleBlur}
                    onChange={resetPass.handleChange}
                    type="password"
                    className="form-control"
                    id="password"
                    name="newpassword"
                    placeholder="Password"
                />
                {resetPass.errors.newpassword && resetPass.touched.newpassword ? <div className="alert alert-danger p-2 mt-3 mb-0">{resetPass.errors.newpassword}</div> : null}
                <label htmlFor="rePassword" className="mb-2 mt-3 fw-bold">Confirm Password</label>
                <input
                    onBlur={resetPass.handleBlur}
                    onKeyUp={resetPass.handleBlur}
                    onChange={resetPass.handleChange}
                    type="password"
                    className="form-control"
                    id="rePassword"
                    name="rePassword"
                    placeholder="Confirm Password"
                />
                {resetPass.errors.rePassword && resetPass.touched.rePassword ? <div className="alert alert-danger p-2 mt-3 mb-0">{resetPass.errors.rePassword}</div> : null}
                {errorMessage ? <div className="alert alert-danger p-2 mt-3 mb-0">{errorMessage}</div> : null}
                <div className="text-center my-3 mt-4">
                    <button type="submit" className="btn btn-primary px-5 py-2 text-nowrap" disabled={Loading}>
                        {Loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Reset Password'}
                    </button>
                </div>
            </form>
        </section>
    );
}
