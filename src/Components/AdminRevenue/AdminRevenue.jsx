import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { baseUrl } from '../Atoms/BaseUrl'
import { jwtDecode } from 'jwt-decode'
import { Link } from 'react-router-dom'
import Spinner from '../Spinner/Spinner'

export default function AdminRevenue() {

    const myDetails = jwtDecode(localStorage.getItem('token'))
    const [url, getUrl] = useRecoilState(baseUrl)
    const [revenue, setRevenue] = useState([])
    const [pending, setPending] = useState([])
    const [loading, setLoading] = useState(true)

    async function getAdminTransactions() {
        try {
            setLoading(true)
            const { data } = await axios.get(url + `api/revenueforadmin/${myDetails.id}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            })
            setRevenue(data.RevenueTransactions)
            setPending(data.PendingTransactions)
            setLoading(false)
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    async function approveTranscation(id) {
        try {
            const { data } = await axios.post(url + `api/accepttransaction/${id}/${myDetails.id}`, {}, {
                headers: {
                    token: localStorage.getItem('token')
                }
            })
            console.log(data)
            getAdminTransactions()
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getAdminTransactions()
    }, [])

    if (loading) return <Spinner />

    return (
        <section id='adminRevenue' className='nav-margin mb-4'>
            <div className="container">
                <h2 className='poppins-regular fw-medium'>Admin Revenue & Pending</h2>
                <ul className="nav nav-tabs mt-4" id="adminTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button className="nav-link text-dark active" id="revenue-tab" data-bs-toggle="tab" data-bs-target="#revenue-pane" type="button" role="tab" aria-controls="revenue-pane" aria-selected="true">Revenue</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link text-dark" id="pending-tab" data-bs-toggle="tab" data-bs-target="#pending-pane" type="button" role="tab" aria-controls="pending-pane" aria-selected="false">Pending</button>
                    </li>
                </ul>
                <div className="tab-content border border-top-0 rounded-2 rounded-top-0 p-3" id="adminTabContent">
                    <div className="tab-pane fade show active" id="revenue-pane" role="tabpanel" aria-labelledby="revenue-tab" tabIndex="0">
                        <div className="table-responsive">
                            <table className="table table-bordered text-center align-middle">
                                <thead>
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Profit</th>
                                        <th scope="col">Description</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">Request</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        revenue.map((item) => {
                                            return (
                                                <tr key={item.Transactions.id}>
                                                    <td>{item.Transactions.id}</td>
                                                    <td className='main-text fs-5 fw-medium text-nowrap'>{item.Transactions.amount * 0.2} EGP</td>
                                                    <td>{item.Transactions.Title}</td>
                                                    <td className='text-nowrap'>{new Date(item.Transactions.Date).toLocaleString()}</td>
                                                    <td>
                                                        <Link to={`/chat/${item.Transactions.RequestID}`} className='btn btn-primary text-nowrap'>
                                                            See Request
                                                        </Link>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="pending-pane" role="tabpanel" aria-labelledby="pending-tab" tabIndex="0">
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle text-center">
                                <thead>
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Amount</th>
                                        <th scope="col">Description</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">Request</th>
                                        <th scope="col">Approve</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        pending.AllPendingTransactions.map((item) => {
                                            return (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td className='main-text fs-5 fw-medium text-nowrap'>{item.amount} EGP</td>
                                                    <td>{item.Title}</td>
                                                    <td className='text-nowrap'>{new Date(item.Date).toLocaleString()}</td>
                                                    <td>
                                                        <Link to={`/chat/${item.RequestID}`} className='btn btn-primary text-nowrap'>
                                                            See Request
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-success text-nowrap" onClick={() => { approveTranscation(item.id) }}>
                                                            <i className='fa-solid fa-check fa-fw'></i> Approve
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    )
}