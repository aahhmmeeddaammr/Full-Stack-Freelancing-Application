import React, { useState } from 'react'
import { InputOtp } from 'primereact/inputotp';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';

export default function OTP({ next, email }) {

    const [otp, setOTP] = useState();
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(false)
    const [url, setUrl] = useRecoilState(baseUrl)

    const handleOTP = async () => {
        if (otp?.length == 4) {
            try {
                setLoading(true)
                await axios.post(url + 'api/verifyotp', { email, OTP: otp }, {
                    headers: {
                        "X-hX-P--d--d--d--dx-xx--o": "__cssAschrcm_r_r__erwx$$d2A_$mr__I_@br_a_hi__m_Xp_p"
                    }
                })
                next()
            } catch ({ response }) {
                setErrorMsg(response.data.MSG)
            } finally {
                setLoading(false)
            }
        } else {
            setErrorMsg('OTP is required')
        }

    }

    return (
        <section>
            <h3 className="text-center">Forget Password</h3>
            <p className="small text-secondary text-center">An OTP has been sent to your registered email address, Please enter the code below to reset your password</p>
            <div className='d-flex justify-content-center flex-column align-items-center gap-4'>
                <InputOtp value={otp} onChange={(e) => setOTP(e.value)} integerOnly />
                {errorMsg && <div className='alert alert-danger p-2 m-0'>{errorMsg}</div>}
                <button className='btn btn-primary px-5 py-2' onClick={handleOTP} disabled={loading}>
                    {
                        loading
                            ?
                            <i className='fa fa-spin fa-spinner'></i>
                            :
                            'Continue'
                    }
                </button>
            </div>
        </section>
    )
}
