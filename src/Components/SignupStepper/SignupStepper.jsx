import React, { useRef, useState } from "react";
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import Signup from "../SignUp/Signup";
import CompleteProfile from "../CompleteProfile/CompleteProfile";

export default function SignupStepper() {

    const [id, setId] = useState(0);
    const stepperRef = useRef(null);

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-8 col-12">
                    <div className="card shadow px-md-4">
                        <Stepper ref={stepperRef} linear>
                            <StepperPanel>
                                <div className="flex flex-column">
                                    <Signup next={() => { stepperRef.current.nextCallback() }} setId={setId} />
                                </div>
                            </StepperPanel>
                            <StepperPanel>
                                <div className="flex flex-column">
                                    <CompleteProfile id={id} />
                                </div>
                            </StepperPanel>
                        </Stepper>
                    </div>
                </div>
            </div>
        </div>
    )
}
