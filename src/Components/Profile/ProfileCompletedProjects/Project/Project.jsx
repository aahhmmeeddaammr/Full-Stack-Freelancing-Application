import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'
import { Rating } from 'primereact/rating'
import Swal from 'sweetalert2';

const Project = ({ project, rating }) => {

   function handleFeedback() {
      Swal.fire({
         title: `${rating.feedback}`,
      })
   }

   return (
      <div id='Project' className="p-3 rounded d-flex justify-content-between align-items-center border my-3" style={{ background: "" }}>
         <div className="d-flex justify-content-between  flex-wrap">
            <Link to={`/request/${project.id}`} className='fs-5 fw-semibold text-primary'>{project.Topic} <i className="fa-solid fa-arrow-up-right-from-square fs-6"></i></Link>
            <p className='w-100 mt-2'>{project.RequestDesc.split(" ").splice(0, 30).join(' ')}.</p>
            <div className="w-100">
               <div className='' style={{ margin: '6.8px 0' }}>
                  <Rating value={rating.rating} cancel={false} disabled readOnly />
               </div>
            </div>
         </div>
         <div className="">
            <button className='btn btn-primary text-nowrap' onClick={handleFeedback}>Feedback</button>
         </div>
      </div>
   );
}

export default Project;