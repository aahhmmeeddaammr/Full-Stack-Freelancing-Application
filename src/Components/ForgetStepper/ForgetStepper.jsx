import React, { useRef, useState } from "react";
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import ForgetPassword from "../ForgetPassword/ForgetPassword";
import ChangePassword from "../ChangePassword/ChangePassword";
import OTP from "../OTP/OTP";

export default function ForgetStepper() {

    const stepperRef = useRef(null);
    const [email, setEmail] = useState('');

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-7 col-12">
                    <div className="card shadow px-md-4">
                        <Stepper ref={stepperRef} linear>
                            <StepperPanel>
                                <div className="flex flex-column">
                                    <ForgetPassword next={() => { stepperRef.current.nextCallback() }} setEmail={setEmail} />
                                </div>
                            </StepperPanel>
                            <StepperPanel>
                                <div className="flex flex-column">
                                    <OTP next={() => { stepperRef.current.nextCallback() }} email={email} />
                                </div>
                            </StepperPanel>
                            <StepperPanel>
                                <div className="flex flex-column">
                                    <ChangePassword email={email} />
                                </div>
                            </StepperPanel>
                        </Stepper>
                    </div>
                </div>
            </div>
        </div>
    )
}
