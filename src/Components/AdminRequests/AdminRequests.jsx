import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import Spinner from '../Spinner/Spinner';
import Swal from 'sweetalert2';

export default function AdminRequests() {

    const myDetails = jwtDecode(localStorage.getItem('token'))

    const [url, setUrl] = useRecoilState(baseUrl)
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [btnLoader, setBtnLoader] = useState(false)

    const handleModal = (reqId) => {
        Swal.fire({
            title: "Decline Reason",
            input: "text",
            showCancelButton: true,
            confirmButtonText: "Submit",
            showLoaderOnConfirm: true,
            confirmButtonColor: '#dc3545',
            preConfirm: async (reason) => {
                await declineRequest(reqId, reason)
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    }

    async function getPendingRequests() {
        try {
            setLoading(true)
            const { data } = await axios.get(url + `api/getpendingrequests/${myDetails.id}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            })
            setRequests(data.requests)
            setLoading(false)
        } catch (error) {
            console.log(error);
        }
    }

    async function declineRequest(id, declineReason) {
        try {
            await axios.post(url + `api/declinerequest/${id}/${myDetails.id}`, { reason: declineReason }, {
                headers: {
                    token: localStorage.getItem('token')
                }
            })
            Swal.fire({
                icon: "error",
                title: "Request Declined Successfully",
                showConfirmButton: false,
                timer: 2000
            })
            getPendingRequests()
        } catch (error) {
            console.log(error);
        }
    }

    async function acceptRequest(id) {
        try {
            const { data } = await axios.post(url + `api/acceptrequest/${id}/${myDetails.id}`, {}, {
                headers: {
                    token: localStorage.getItem('token')
                }
            })
            Swal.fire({
                icon: "success",
                title: "Request Accepted Successfully",
                showConfirmButton: false,
                timer: 2000
            })
            getPendingRequests()
        } catch (error) {
            console.log(error);
        } finally {
            setBtnLoader(false)
        }
    }

    useEffect(() => {
        getPendingRequests()
    }, [])

    if (loading) return <Spinner />

    return (
        <div className="container nav-margin mb-4">
            <h2 className="text-center">Pending Requests</h2>
            <hr className='my-2 mb-4' />
            <div className="row g-4">
                {
                    requests.length
                        ?
                        requests.map((request) => (
                            <div key={request.request.id} className="col-md-6">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <Link to={`/profile/${request.Owner.id}`}>
                                                <img src={url + request.Owner.profileImage} alt="User" className="rounded-circle me-3" style={{ width: '50px', height: '50px' }} />
                                            </Link>
                                            <div>
                                                <Link to={`/request/${request.request.id}`} className="card-title mb-1 fs-5 d-block fw-medium">{request.request.Topic}</Link>
                                                <span>
                                                    <i className='fa-solid fa-user'></i> <small className="text-muted">{`${request.Owner.Fname} ${request.Owner.Lname}`}</small>
                                                </span>
                                            </div>
                                        </div>
                                        <p className="card-text">{request.request.RequestDesc}</p>
                                        <div className="d-flex justify-content-between align-items-end">
                                            <div>
                                                <button className="btn btn-success me-2" onClick={() => { setBtnLoader(true); acceptRequest(request.request.id); }} disabled={btnLoader}>
                                                    {
                                                        btnLoader
                                                            ?
                                                            <i className='fa fa-spin fa-spinner'></i>
                                                            :
                                                            <i className='fa fa-check'></i>
                                                    }
                                                </button>
                                                <button className="btn btn-danger" onClick={() => { handleModal(request.request.id) }} ><i className='fa fa-x'></i></button>
                                            </div>
                                            <small className="text-muted">{new Date(request.request.PostDate).toLocaleString()}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                        :
                        <h3 className='main-text text-center my-5'>There are no pending requests</h3>
                }
            </div>
        </div>
    );
}
