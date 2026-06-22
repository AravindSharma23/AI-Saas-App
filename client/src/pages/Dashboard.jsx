import React, { useEffect, useState } from 'react'
import { Gem, Sparkles } from 'lucide-react';
import CreationItem from '../components/CreationItem';
import { Protect, useAuth } from '@clerk/clerk-react';
import axios from 'axios'
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {

  const [creations,setCreations] = useState([]);
  const [loading,setLoading] = useState(true)
  const {getToken} =useAuth();

  const getDashboardData = async () => {
    try {
      const {data} = await axios.get("/api/user/get-user-creations",{
        headers:{
          Authorization: `Bearer ${await getToken()}`
        }
      })

      if(data.success){
        setCreations(data.creations);
        console.log(data.creations);
        
      } else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }
    
  useEffect(()=>{
    getDashboardData();
  },[]);

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <div className='flex justify-start gap-4 flex-wrap'>

        <div>
          <p className='text-red-600 text-sm sm:text-base'>You have a maximum of 10 credits to explore premium features such as image generation, background removal, and object removal. These limitations are in place because the demo relies on free-tier APIs.</p>
        </div>

        {/* Total creation card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total creations</p>
            <h2 className='text-lg font-semibold'>{creations.length}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588f2] to-[#0bb0d7] text-white flex justify-center items-center'>
            <Sparkles className='w-5 text-white'/>
          </div>
        </div>
        {/* active plan card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-lg font-semibold'>
              <Protect plan='premium' fallback='Free'>Premium</Protect>
            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff61c5] to-[#9e53ee] text-white flex justify-center items-center'>
            <Gem className='w-5 text-white'/>
          </div>
        </div>
      </div>

      {
        loading ? (
        <div className='flex items-center justify-center h-3/4'>
          <span className='w-10 h-10 border-3 border-t-transparent my-1 rounded-full border-primary animate-spin'></span>
        </div>
      ) :
        (
        <div className='space-y-3'>
          <p className='mt-6 mb-4'>Recent Creations</p>
          {creations.map((item)=>(
            <CreationItem key={item._id} item={item}/>
          ))}
        </div>
        )
      }
    </div>
  )
}

export default Dashboard
