import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Rating } from 'primereact/rating';
import axios from 'axios';
import 'primereact/resources/themes/saga-orange/theme.css'
import Swal from 'sweetalert2';

const RequestRate = forwardRef((props, ref) => {

   const [value, setValue] = useState(1);

   useImperativeHandle(
      ref,
      () => ({
         async finishRequest(item, id, url, feedback) {
            try {
               await axios.post(url + `api/finishrequest/${item.request.id}/${id}`, {
                  InsID: item.AcceptedOffer,
                  rating: value,
                  feedback: feedback,
               }, {
                  headers: {
                     token: localStorage.getItem('token')
                  }
               })
               await Swal.fire({
                  icon: "success",
                  title: "Request Finalized Successfully",
                  showConfirmButton: false,
                  timer: 1500
               })
            } catch (error) {
               await Swal.fire({
                  icon: "error",
                  title: error?.response?.data?.MSG,
                  showConfirmButton: false,
                  timer: 1500
               })
            }
         }
      }),
   )

   return (
      <div id='requestStar' className='d-flex justify-content-center'>
         <Rating value={value} onChange={(e) => { setValue(e.value) }} cancel={false} />
      </div>
   )
})

export default RequestRate
