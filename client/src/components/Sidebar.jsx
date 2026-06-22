import { Protect, useClerk, useUser } from '@clerk/clerk-react'
import { Eraser, FileText, Hash, House, Image, LogOut, Scissors, SquarePen, Users } from 'lucide-react';
import React from 'react'
import { NavLink } from 'react-router-dom';

const navItems = [
  {label:'Dashboard',to:'/ai' ,Icon: House},
  {label:'Write Article',to:'/ai/write-article' ,Icon: SquarePen},
  {label:'Blog Titles',to:'/ai/blog-titles' ,Icon: Hash},
  {label:'Generate Images',to:'/ai/generate-images' ,Icon: Image},
  {label:'Remove Background',to:'/ai/remove-background' ,Icon: Eraser},
  {label:'Remove Object',to:'/ai/remove-object' ,Icon: Scissors},
  {label:'Review Resume',to:'/ai/review-resume' ,Icon: FileText},
  {label:'Community',to:'/ai/community' ,Icon: Users},
]

const Sidebar = ({sidebar,setSidebar}) => {

    const {user} = useUser();
    const {signOut, openUserProfile}= useClerk();
  return (
    <div className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 ${sidebar?'translate-x-0':'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
        <div className='my-7 w-full'>
            <img src={user.imageUrl} onClick={openUserProfile} alt='' className='w-13 rounded-full mx-auto'/>
            <h1 className='mt-1 text-center'>{user.fullName}</h1>
            <div className='px-6 mt-5 text-sm text-gray-600 font-medium'>
              {navItems.map((item,index)=>(
                <NavLink key={index} to={item.to} end={item.to === '/ai'} onClick={()=>setSidebar(false)} className={({isActive})=> `px-3.5 py-2.5 flex items-center gap-3 rounded ${isActive ? 'bg-gradient-to-r from-[#3c81f6] to-[#9234ea] text-white':''}`}>
                  {({isActive})=>(
                    <>
                    <item.Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`}/>
                    {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
        </div>
        <div className='w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between'>
          <div onClick={openUserProfile} className='flex gap-2 items-center cursor-pointer'>
              <img src={user.imageUrl} className='rounded-full w-8'/>
              <div>
                <h1 className='text-sm font-medium'>{user.fullName}</h1>
                <p className='text-xs text-gray-500'>
                  <Protect plan='premium' fallback='Free'>Premium </Protect>
                   Plan
                </p>
              </div>
          </div>
          <LogOut onClick={signOut} className='w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer'/>
        </div>
      
    </div>
  )
}

export default Sidebar
