import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';
import Spinner from '../Spinner/Spinner';

export default function AdminComplaints() {

    const myDetails = jwtDecode(localStorage.getItem('token'))
    const input = useRef('')

    const [url, setUrl] = useRecoilState(baseUrl)
    const [complaints, setComplaints] = useState([])
    const [show, setShow] = useState(false)
    const [currentComplaint, setCurrentComplaint] = useState(null)
    const [loading, setLoading] = useState(true)
    const [btnLoader, setBtnLoader] = useState(false)

    const handleClose = () => setShow(false);
    const handleShow = (complaint) => {
        setCurrentComplaint(complaint);
        setShow(true);
    };

    async function getComplaints() {
        try {
            setLoading(true)
            const { data } = await axios.get(url + `/api/getcomplaint/${myDetails.id}`, {
                headers: {
                    token: localStorage.getItem('token'),
                }
            })
            console.log(data);
            setComplaints(data.complaints)
            setLoading(false)
        } catch (error) {
            console.log(error);
        }
    }

    async function respond(id) {
        try {
            await axios.post(url + `api/replycomlaint/${myDetails.id}/${id}`, { response: input.current.value }, {
                headers: {
                    token: localStorage.getItem('token')
                }
            })
            handleClose()
            getComplaints()
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getComplaints()
    }, [])

    if (loading) return <Spinner />

    return (
        <div className="container nav-margin mb-4">
            <h2 className="text-center">Complaints</h2>
            <hr className='my-2 mb-4' />
            <div className="row g-4">
                {
                    complaints.length
                        ?
                        complaints.map((complaint) => (
                            <div key={complaint.id} className="col-md-6">
                                <div className="card">
                                    <div className="card-body">
                                        <p className="card-text"><strong>Email:</strong> {complaint.email}</p>
                                        <p className="card-text"><strong>Phone:</strong> {complaint.phone}</p>
                                        <p className="card-text"><strong>Problem:</strong> {complaint.message}</p>
                                        <div className='d-flex align-items-end justify-content-between'>
                                            <button className='btn btn-primary' onClick={() => handleShow(complaint)}>
                                                Respond
                                            </button>
                                            <small className='text-muted'>{new Date(complaint.PostDate).toLocaleString()}</small>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))
                        :
                        <h3 className='main-text text-center my-5'>There are no filed complaints</h3>
                }
            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Respond to Complaint</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentComplaint && (
                        <>
                            <p><strong>Email:</strong> {currentComplaint.email}</p>
                            <p><strong>Phone:</strong> {currentComplaint.phone}</p>
                            <p><strong>Problem:</strong> {currentComplaint.message}</p>
                            <p><strong>Post Time:</strong> {new Date(currentComplaint.PostDate).toLocaleString()}</p>
                        </>
                    )}
                    <textarea ref={input} className="form-control mt-3" rows="5" placeholder="Write your response here..."></textarea>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => { respond(currentComplaint.id) }} disabled={btnLoader}>
                        {
                            btnLoader
                                ?
                                <i className='fa fa-spin fa-spinner'></i>
                                :
                                'Submit'
                        }
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
