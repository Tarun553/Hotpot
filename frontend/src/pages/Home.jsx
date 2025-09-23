import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DiliveryBoy from '../components/DiliveryBoy'
import Layout from '../components/Layout'

const Home = () => {
    const {userData} = useSelector((state)=> state.user)
    
return (
    <Layout>
        <div className='w-full min-h-screen bg-orange-50'>
                {userData?.role === 'user' && <UserDashboard userData={userData}/>}
                {userData?.role === 'owner' && <OwnerDashboard userData={userData}/>}
                {userData?.role === 'deliveryBoy' && <DiliveryBoy userData={userData}/>}
        </div>
    </Layout>
)
}

export default Home