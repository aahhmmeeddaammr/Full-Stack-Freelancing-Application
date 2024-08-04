import React from 'react';

export default function OfferHelpSearch({ inputRef, handleSearch, handleShow }) {
   return (
      <div className="input-group mb-4">
         <button className="btn btn-primary btn-lg rounded-start-pill px-3 px-md-4" onClick={handleShow}>
            <i className="fa-solid fa-sliders"></i>
         </button>
         <input
            type="text"
            ref={inputRef}
            onKeyUp={handleSearch}
            className="form-control form-control-lg"
            placeholder="Search here"
         />
         <button className="btn btn-primary btn-lg rounded-end-pill px-3 px-md-4" onClick={handleSearch}>
            <i className="fa fa-search"></i>
         </button>
      </div>
   );
}
