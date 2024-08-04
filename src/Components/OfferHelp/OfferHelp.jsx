import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl';
import { Paginator } from 'primereact/paginator';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import OfferHelpSearch from '../OfferHelpSearch/OfferHelpSearch';
import OfferHelpModal from '../OfferHelpModal/OfferHelpModal';
import OfferHelpRequest from '../OfferHelpRequest/OfferHelpRequest';

export default function OfferHelp() {

   const id = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')).id : '';
   const inputRef = useRef('');

   const [url] = useRecoilState(baseUrl);
   const [filters, setFilters] = useState({ price: '', type: '', category: '' });
   const [data, setData] = useState([]);
   const [count, setCount] = useState(0);
   const [first, setFirst] = useState(0);
   const [page, setPage] = useState(0);
   const [loading, setLoading] = useState(true);
   const [show, setShow] = useState(false);

   const handleClose = () => setShow(false);
   const handleShow = () => setShow(true);

   const handleSearch = (e) => {
      if (e.type === 'click' || e.key === 'Enter' || (e.key === 'Backspace' && !inputRef.current.value)) {
         getAllRequests();
      }
      if (show) {
         handleClose();
      }
   };

   const handleReset = () => setFilters({ price: '', type: '', category: '' });

   const onPageChange = (event) => {
      setFirst(event.first);
      setPage(event.page);
   };

   const getAllRequests = async () => {
      setLoading(true);
      try {
         const { data } = await axios.get(`${url}api/requests`, {
            params: {
               search: inputRef.current.value,
               price: filters.price,
               type: filters.type,
               category: filters.category,
               page: page + 1
            }
         });
         setData(data.results.filter((item) => item.request.UserID !== id));
         setCount(data.count);
      } catch (error) {
         console.log(error);
      }
      setLoading(false);
   };

   useEffect(() => {
      getAllRequests();
   }, [page]);

   return (
      <section id="OfferHelp" className="container nav-margin mb-4">
         <OfferHelpModal
            show={show}
            handleClose={handleClose}
            handleSearch={handleSearch}
            handleReset={handleReset}
            filters={filters}
            setFilters={setFilters}
         />
         <div className="row justify-content-center">
            <div className="col-lg-8">
               <OfferHelpSearch inputRef={inputRef} handleSearch={handleSearch} handleShow={handleShow} />
            </div>
            <div className="col-lg-8">
               {
                  loading
                     ?
                     <i className="d-block fa fa-spin fa-spinner main-text my-5 text-center fs-1"></i>
                     :
                     data.length ?
                        <>
                           {
                              data.map((item) => (
                                 <OfferHelpRequest key={item.request.id} item={item} />
                              ))
                           }
                           <Paginator first={first} rows={15} totalRecords={count} onPageChange={onPageChange} />
                        </>
                        :
                        <h2 className="text-center main-text my-5">No requests available at this time</h2>

               }
            </div>
         </div>
      </section>
   );
}
