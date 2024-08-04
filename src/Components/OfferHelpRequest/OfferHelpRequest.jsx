import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function OfferHelpRequest({ item }) {
   return (
      <div className="p-4 mb-4 bg-white shadow rounded-4">
         <div className="mb-2">
            <h5>{item.request.Topic}</h5>
            <div className="d-flex gap-3 text-muted" style={{ fontSize: '0.9rem' }}>
               <p>
                  <i className="fa-solid fa-user fa-fw"></i> {item.UserName}
               </p>
               <p>
                  <i className="fa-regular fa-clock fa-fw"></i> {formatDistanceToNow(new Date(item.request.PostDate), { addSuffix: true }).replace(/^about/, '')}
               </p>
               <p>
                  <i className="fa-solid fa-ticket fa-fw"></i> {item.numberofOffers !== 1 ? `${item.numberofOffers} Offers` : `${item.numberofOffers} Offer`}
               </p>
            </div>
            <p>{item.request.RequestDesc.split(' ').slice(0, 30).join(' ')}.</p>
         </div>
         <div>
            <Link to={`/request/${item.request.id}`} className="btn btn-primary">Add Offer</Link>
         </div>
      </div>
   );
}
