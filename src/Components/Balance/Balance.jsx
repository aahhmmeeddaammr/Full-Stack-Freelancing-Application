import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl'
import { jwtDecode } from 'jwt-decode';
import Spinner from '../Spinner/Spinner';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

export default function Balance() {

   const myDetails = jwtDecode(localStorage.getItem('token'))
   const [url, setUrl] = useRecoilState(baseUrl)
   const [data, setData] = useState([])
   const [transactions, setTransactions] = useState([])
   const [loading, setLoading] = useState(true);
   const [btnLoader, setBtnLoader] = useState(false)
   const [idCopy, setIdCopy] = useState(false);
   const [filterType, setFilterType] = useState('')
   const [filterDate, setFilterDate] = useState(null)

   let charge = useRef(0);
   let withdraw = useRef(0);

   async function getAccountBalance() {
      try {
         const { data } = await axios.get(url + `api/balanceandtransactions/${myDetails.id}`, {
            headers: {
               token: localStorage.getItem('token')
            }
         })
         setData(data)
         setTransactions(data.Transactions)
         setLoading(false)
      } catch (error) {
         console.log(error);
      }
   }

   async function chargeBalance(money) {
      try {
         setBtnLoader(true)
         const { data } = await axios.post(url + `api/payment/${myDetails.id}`, { amount: money }, {
            headers: {
               token: localStorage.getItem('token'),
            }
         })
         window.location.href = data.url
      } catch ({ response }) {
         Swal.fire({
            icon: "error",
            html: `<h4>${response.data.MSG}</h4>`,
            showConfirmButton: false,
            timer: 2000
         })
      } finally {
         setBtnLoader(false)
      }
   }

   async function withdrawBalance(money) {
      try {
         setBtnLoader(true)
         await axios.post(url + `api/withdraw/${myDetails.id}`, { amount: money }, {
            headers: {
               token: localStorage.getItem('token'),
            }
         })
         Swal.fire({
            title: "Amount Withdrawn Successfully",
            icon: "success",
            showConfirmButton: false,
            timer: 2000
         })
         withdraw.current.value = ''
         getAccountBalance()
      } catch ({ response }) {
         Swal.fire({
            icon: "error",
            html: `<h4>${response.data.MSG}</h4>`,
            showConfirmButton: false,
            timer: 2000
         })
      } finally {
         setBtnLoader(false)
      }
   }

   function handleFilter() {
      if (filterType == '') {
         setTransactions(data.Transactions.filter((item) => (new Date(item.Transaction.Date)).getDate() >= (new Date(filterDate ? filterDate : new Date().getDate())).getDate()))
      } else if (filterType == 'Request') {
         setTransactions(data.Transactions.filter((item) => !item.Transaction.Type && (new Date(item.Transaction.Date)).getDate() >= (new Date(filterDate ? filterDate : new Date().getDate())).getDate()))
      } else {
         setTransactions(data.Transactions.filter((item) => item.Transaction.Type == filterType && (new Date(item.Transaction.Date)).getDate() >= (new Date(filterDate ? filterDate : new Date().getDate())).getDate()))
      }
   }

   useEffect(() => {
      getAccountBalance()
   }, [])

   if (loading) return <Spinner />

   return (
      <>
         <div className='nav-margin container mb-4'>
            <h2 className='text-center mb-4 mt-2'>My Account Balance</h2>
            <div className='row g-4'>
               <div className="col-md-4">
                  <div className="bg-white p-3 border rounded">
                     <div className="d-flex justify-content-between mb-3">
                        <div>
                           <span className="d-block fw-medium mb-3">Profit</span>
                           <div className="fw-medium fs-3">{data.Balance.profit} <span>EGP</span> </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-center bg-success rounded" style={{ width: '2.5rem', height: '2.5rem' }}>
                           <i className="fa-solid fa-money-bill-trend-up text-white  "></i>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="bg-white p-3 border rounded ">
                     <div className="d-flex justify-content-between mb-3">
                        <div>
                           <span className="d-block fw-medium mb-3">Pending Balance</span>
                           <div className="fw-medium fs-3">{data.Balance.pendingbalance} <span>EGP</span> </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-center border bg-warning rounded" style={{ width: '2.5rem', height: '2.5rem' }}>
                           <i className="fa-solid fa-money-bill-transfer text-white"></i>
                        </div>
                     </div>
                  </div>

               </div>
               <div className="col-md-4">
                  <div className="bg-white p-3 border rounded">
                     <div className="d-flex justify-content-between mb-3 ">
                        <div>
                           <span className="d-block fw-medium mb-3">Available Balance</span>
                           <div className="fw-medium fs-3">{data.Balance.balance} <span>EGP</span> </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-center bg-primary rounded" style={{ width: '2.5rem', height: '2.5rem' }}>
                           <i className="fa-brands fa-cc-visa text-white"></i>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
            <hr className='my-4' />
            <div className='row g-4'>
               <div className="col-md-6">
                  <h4>Withdraw :</h4>
                  <div className="input-group mt-3">
                     <div className="form-floating z-1">
                        <input ref={withdraw} type="number" className="form-control" id="withdrawLabel" placeholder="Withdraw" />
                        <label htmlFor="withdrawLabel">Amount to Withdraw</label>
                     </div>
                     <span className="input-group-text">EGP</span>
                  </div>
                  <button type="submit" className="btn btn-primary mt-3" disabled={btnLoader} onClick={() => { withdrawBalance(withdraw.current.value) }}>
                     {btnLoader ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Withdraw'}
                  </button>
               </div>
               <div className="col-md-6">
                  <h4>Charge :</h4>
                  <div className="input-group mt-3">
                     <div className="form-floating z-1">
                        <input ref={charge} type="number" className="form-control " id="chargeLabel" placeholder="Charge" />
                        <label htmlFor="chargeLabel">Amount to Charge (Minimum 50 EGP)</label>
                     </div>
                     <span className="input-group-text rounded-end">EGP</span>
                  </div>
                  <button type="submit" className="btn btn-primary mt-3" disabled={btnLoader} onClick={() => { chargeBalance(charge.current.value) }}>
                     {btnLoader ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Charge'}
                  </button>
               </div>
            </div>
            <hr className='my-4' />
            <form onSubmit={(e) => { e.preventDefault() }}>
               <h4 className='mb-3'>Financial Transactions :</h4>
               <div className="row g-4">
                  <div className="col-md-6">
                     <label className='mb-2' htmlFor='filterTransaction'>Filter by Transaction Type:</label>
                     <select id='filterTransaction' defaultValue={''} className="form-select" onChange={(e) => { setFilterType(e.target.value) }}>
                        <option hidden disabled value={filterType}>Choose Filter Type</option>
                        <option value="Charge">Charge</option>
                        <option value="Withdraw">Withdraw</option>
                        <option value="Request">Request</option>
                     </select>
                  </div>
                  <div className="col-md-6">
                     <label htmlFor='fromDate' className='mb-2'>From:</label>
                     <input type="date" className="form-control" id="fromDate" placeholder="date" onChange={(e) => { setFilterDate(e.target.value) }} />
                  </div>
               </div>
               <div className='mt-3'>
                  <button className="btn btn-primary" onClick={handleFilter}>
                     <i className='fa-solid fa-filter fa-fw'></i> Filter
                  </button>
                  <button className='btn btn-secondary ms-2' type='reset' onClick={() => { setTransactions(data.Transactions) }}>
                     Reset
                  </button>
               </div>
            </form>
            <hr className='my-4' />
            <div>
               <h4 className='mb-3'>My Transactions :</h4>
               <div className="table-responsive" style={{ height: '500px' }}>
                  <table className="table table-bordered table-striped text-center align-middle">
                     <thead className='table-primary'>
                        <tr>
                           <th scope="col">ID</th>
                           <th scope="col">Amount</th>
                           <th scope="col">Description</th>
                           <th scope="col">Type</th>
                           <th scope="col">Date</th>
                        </tr>
                     </thead>
                     <tbody className='table-group-divider'>
                        {
                           transactions.map((item) => {
                              return (
                                 <tr key={item.Transaction.id}>
                                    <td>
                                       <button className='btn btn-outline-primary' onClick={() => {
                                          navigator.clipboard.writeText(item.Transaction.id);
                                          setIdCopy(true);
                                          setTimeout(() => setIdCopy(false), 1000);
                                       }}>
                                          {
                                             idCopy
                                                ?
                                                <i className='fa-solid fa-check'></i>
                                                :
                                                <i className='fa-regular fa-copy'></i>
                                          }
                                       </button>
                                    </td>
                                    <td className='text-nowrap'>{item.Transaction.amount} EGP</td>
                                    <td className='text-nowrap'>
                                       {
                                          item.Transaction.Approve == true
                                             ?
                                             <span className='d-flex align-items-center justify-content-center gap-2'>
                                                {item.Transaction.Title}
                                                <span className="rounded-circle bg-success d-inline-flex justify-content-center align-items-center" style={{ width: 15, height: 15, fontSize: '0.5rem' }}><i className="fa-solid fa-check text-white"></i></span>
                                             </span>
                                             :
                                             item.Transaction.OfferID != null
                                                ?
                                                <span className='d-flex align-items-center justify-content-center gap-2'>
                                                   {item.Transaction.Title}
                                                   <span className="rounded-circle bg-warning d-inline-flex justify-content-center align-items-center" style={{ width: 15, height: 15, fontSize: '0.5rem' }}><i className="fa-solid fa-hourglass-half text-white"></i></span>
                                                </span>
                                                :
                                                `${item.Transaction.Title}`
                                       }
                                    </td>
                                    <td className='text-nowrap'>
                                       {
                                          item.Transaction.Type
                                             ? item.Transaction.Type
                                             : <Link to={`/request/${item.Transaction.RequestID}`}>Request <i className="fa-solid fa-arrow-up-right-from-square fa-fw"></i></Link>
                                       }
                                    </td>
                                    <td className='text-nowrap'>{new Date(item.Transaction.Date).toLocaleString()}</td>
                                 </tr>
                              )
                           })
                        }
                     </tbody>
                  </table>
               </div>
            </div>
         </div >
      </>
   )
}
