import React from 'react'
import { NavDropdown } from 'react-bootstrap'
import { NavLink } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { navName, navPhoto } from '../Atoms/NavAtom'

export default function NavProfile({ myDetails, Logout }) {

   const [photo, setPhoto] = useRecoilState(navPhoto)
   const [name, setName] = useRecoilState(navName)

   return (
      <NavDropdown title={<img className='rounded-circle' src={photo} width={32} height={32} />}>
         <NavDropdown.Item as={NavLink} to={`/profile/${myDetails.id}`}>
            <i className="fa-solid fa-user fa-fw"></i> {name}
         </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to={'/balance'}>
            <i className="fa-solid fa-dollar-sign fa-fw"></i> Balance
         </NavDropdown.Item>
         {
            myDetails.Role === "Admin"
            &&
            <>
               <NavDropdown.Divider />
               <NavDropdown.Item as={NavLink} to={'/admin'}>
                  <i className="fa-solid fa-table-columns fa-fw"></i> Dashboard
               </NavDropdown.Item>
            </>
         }
         <NavDropdown.Divider />
         <NavDropdown.Item onClick={Logout}>
            <i className="fa-solid fa-arrow-right-from-bracket fa-fw"></i> Logout
         </NavDropdown.Item>
      </NavDropdown>
   )
}
