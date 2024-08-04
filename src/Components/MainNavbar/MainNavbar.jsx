import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useRecoilState } from 'recoil';
import { baseUrl } from '../Atoms/BaseUrl'
import axios from 'axios';
import logo from '../../Assets/Images/logo.png'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavProfile from '../NavProfile/NavProfile';
import Spinner from '../Spinner/Spinner';

export default function MainNavbar() {

   const navigate = useNavigate();
   const myDetails = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')) : ''

   const [nav, setNav] = useState('py-2')
   const [logout, setLogout] = useState(false)
   const [url, setUrl] = useRecoilState(baseUrl)

   function navScroll() {
      if (window.scrollY >= 100) {
         setNav('py-0');
      } else {
         setNav('py-2');
      }
   }

   async function Logout() {
      setLogout(true)
      await axios.delete(url + `api/logout/${myDetails.id}`, {
         headers: {
            token: localStorage.getItem('token'),
         }
      }).then(({ data }) => {
         localStorage.clear();
         navigate('/')
      }).catch(({ response }) => {
         console.log(response.data.MSG);
      }).finally(() => {
         setLogout(false)
      })
   }

   useEffect(() => {
      window.addEventListener('scroll', navScroll);
      return () => {
         window.removeEventListener('scroll', navScroll);
      };
   }, []);

   if (logout) return <Spinner />

   return (
      <Navbar collapseOnSelect className={`shadow main-bg ${nav}`} expand="lg" fixed="top">
         <Container>
            <Navbar.Brand as={NavLink}>
               <img src={logo} alt="Site Logo" width={40} height={40} className='rounded-circle' />
            </Navbar.Brand>
            <div className="d-lg-none d-flex align-items-center gap-4">
               {
                  myDetails
                  &&
                  <NavProfile myDetails={myDetails} Logout={Logout} />
               }
               <Navbar.Toggle />
            </div>
            <Navbar.Collapse>
               {
                  myDetails
                     ?
                     <>
                        <Nav className='me-auto'>
                           <Nav.Link eventKey="FindAssistant" as={NavLink} to={'/findassistant'}>
                              <i className="fa-solid fa-comment fa-fw"></i> Find Assistant
                           </Nav.Link>
                           <Nav.Link eventKey="OfferHelp" as={NavLink} to={'/offerhelp'}>
                              <i className="fa-solid fa-handshake-angle fa-fw"></i> Offer Help
                           </Nav.Link>
                           <Nav.Link eventKey="MyRequests" as={NavLink} to={'/myrequests'}>
                              <i className="fa-solid fa-clipboard-check fa-fw"></i> My Requests
                           </Nav.Link>
                           <Nav.Link eventKey="MyOffers" as={NavLink} to={'/myoffers'}>
                              <i className="fa-solid fa-ticket fa-fw"></i> My Offers
                           </Nav.Link>
                        </Nav>
                        <Nav className='ms-auto d-none d-lg-flex'>
                           <NavProfile myDetails={myDetails} Logout={Logout} />
                        </Nav>
                     </>
                     :
                     <Nav className='ms-auto'>
                        <Nav.Link as={NavLink} to={'/offerhelp'}>
                           <i className="fa-solid fa-handshake-angle fa-fw"></i> Offer Help
                        </Nav.Link>
                        <Nav.Link as={NavLink} to={'/login'}>
                           <i className="fa-solid fa-right-to-bracket fa-fw"></i> Login
                        </Nav.Link>
                     </Nav>
               }
            </Navbar.Collapse>
         </Container>
      </Navbar>
   )
}
