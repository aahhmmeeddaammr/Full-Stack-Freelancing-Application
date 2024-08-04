import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function OfferHelpModal({ show, handleClose, handleSearch, handleReset, filters, setFilters }) {

   const { price, type, category } = filters;

   return (
      <Modal show={show} onHide={handleClose}>
         <Modal.Header closeButton>
            <Modal.Title>Search Filter</Modal.Title>
         </Modal.Header>
         <Modal.Body>
            <div>
               <h5>Category</h5>
               <hr className="my-2" />
               <div className="form-check">
                  <input
                     className="form-check-input"
                     type="radio"
                     id="allCategory"
                     name="category"
                     value=""
                     onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                     checked={!category}
                  />
                  <label className="form-check-label" htmlFor="allCategory">
                     All Categories
                  </label>
               </div>
               <div className="form-check">
                  <input
                     className="form-check-input"
                     type="radio"
                     id="cs"
                     name="category"
                     value="ComputerScience"
                     onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                     checked={category === "ComputerScience"}
                  />
                  <label className="form-check-label" htmlFor="cs">
                     Computer Science
                  </label>
               </div>
               <div className="form-check">
                  <input
                     className="form-check-input"
                     type="radio"
                     id="other"
                     name="category"
                     value="Other"
                     onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                     checked={category === "Other"}
                  />
                  <label className="form-check-label" htmlFor="other">
                     Other
                  </label>
               </div>
            </div>
            <div className="mb-3 mt-4">
               <h5>Type</h5>
               <hr className="my-2" />
               <div className="form-check">
                  <input
                     className="form-check-input"
                     type="radio"
                     id="allType"
                     name="type"
                     value=""
                     onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                     checked={!type}
                  />
                  <label className="form-check-label" htmlFor="allType">
                     All Types
                  </label>
               </div>
               <div className="form-check">
                  <input
                     className="form-check-input"
                     type="radio"
                     id="academicSupport"
                     name="type"
                     value="AcademicSupport"
                     onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                     checked={type === "AcademicSupport"}
                  />
                  <label className="form-check-label" htmlFor="academicSupport">
                     Academic Support
                  </label>
               </div>
               <div className="form-check">
                  <input
                     className="form-check-input"
                     type="radio"
                     id="careerGuidance"
                     name="type"
                     value="CareerGuidance"
                     onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                     checked={type === "CareerGuidance"}
                  />
                  <label className="form-check-label" htmlFor="careerGuidance">
                     Career Guidance
                  </label>
               </div>
            </div>
            <div className="mt-4">
               <div className="d-flex justify-content-between align-items-center mb-2">
                  <label htmlFor="price" className="fs-5 d-block fw-medium">Price</label>
                  <span className="text-muted">{price ? price : 40} EGP</span>
               </div>
               <input
                  type="range"
                  className="form-range"
                  id="price"
                  value={price || 40}
                  min={40}
                  max={2000}
                  step={5}
                  onChange={(e) => setFilters({ ...filters, price: e.target.value == 40 ? '' : e.target.value })}
               />
            </div>
         </Modal.Body>
         <Modal.Footer className="d-flex justify-content-center">
            <Button variant="secondary" onClick={handleReset}>Reset</Button>
            <Button variant="primary" onClick={handleSearch}>Apply</Button>
         </Modal.Footer>
      </Modal>
   );
}
