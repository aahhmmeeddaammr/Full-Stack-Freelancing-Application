import React from 'react'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { RecoilRoot } from 'recoil';
import { ToastContainer } from 'react-toastify';
import MainLayout from './Layouts/MainLayout/MainLayout';
import AuthLayout from './Layouts/Auth/Authlayout';
import ProtectedRoutes from './ProtectedRoutes/ProtectedRoutes';
import Login from './Components/Login/Login';
import Home from './Components/Home/Home'
import Profile from './Components/Profile/Profile';
import NotFound from './Components/NotFound/NotFound';
import FindAssistant from './Components/FindAssistant/FindAssistant';
import OfferHelp from './Components/OfferHelp/OfferHelp';
import MyRequests from './Components/MyRequests/MyRequests';
import MyOffers from './Components/MyOffers/MyOffers';
import Chat from './Components/Chat/Chat';
import RequestDetail from './Components/RequestDetail/RequestDetail';
import AdminHome from './Components/AdminHome/AdminHome';
import AdminRequests from './Components/AdminRequests/AdminRequests';
import AdminComplaints from './Components/AdminComplaints/AdminComplaints';
import AdminRoutes from './ProtectedRoutes/AdminRoutes';
import SignupStepper from './Components/SignupStepper/SignupStepper';
import Balance from './Components/Balance/Balance';
import ForgetStepper from './Components/ForgetStepper/ForgetStepper';
import AdminRevenue from './Components/AdminRevenue/AdminRevenue';

let routes = createBrowserRouter([{
    path: '/', element: <MainLayout />, children: [
        { index: true, element: <Home /> },
        { path: 'home', element: <Home /> },
        { path: 'profile/:id', element: <Profile /> },
        { path: 'offerhelp', element: <OfferHelp /> },
        { path: 'request/:id', element: <RequestDetail /> },
        { path: 'findassistant', element: <ProtectedRoutes><FindAssistant /></ProtectedRoutes> },
        { path: 'myrequests', element: <ProtectedRoutes><MyRequests /></ProtectedRoutes> },
        { path: 'myoffers', element: <ProtectedRoutes><MyOffers /></ProtectedRoutes> },
        { path: 'chat/:id', element: <ProtectedRoutes><Chat /></ProtectedRoutes> },
        { path: 'balance', element: <ProtectedRoutes><Balance /></ProtectedRoutes> },
        {
            path: 'admin', element: <AdminRoutes><Outlet /></AdminRoutes>, children: [
                { index: true, element: <AdminRoutes><AdminHome /></AdminRoutes> },
                { path: 'requests', element: <AdminRoutes><AdminRequests /></AdminRoutes> },
                { path: 'complaints', element: <AdminRoutes><AdminComplaints /></AdminRoutes> },
                { path: 'revenue', element: <AdminRoutes><AdminRevenue /></AdminRoutes> },
            ]
        },
        { path: '*', element: <NotFound /> },
    ]
},
{
    path: '/', element: <AuthLayout />, children: [
        { path: 'signup', element: <SignupStepper /> },
        { path: 'login', element: <Login /> },
        { path: 'forgetpassword', element: <ForgetStepper /> }
    ]
},
])
export default function App() {
    return (
        <>
            <RecoilRoot>
                <PrimeReactProvider>
                    <RouterProvider router={routes} />
                </PrimeReactProvider>
            </RecoilRoot>
        </>
    )
}
