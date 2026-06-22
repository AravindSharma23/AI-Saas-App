import React from 'react'
import { Routes,Route } from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage'
import Home from './pages/Home'
import WriteArticle from './pages/WriteArticle'
import GenerateImage from './pages/GenerateImage'
import RemoveBackgroud from './pages/RemoveBackgroud'
import ReviewResume from './pages/ReviewResume'
import RemoveObject from './pages/RemoveObject'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import Community from './pages/Community'
import BlogTitles from './pages/BlogTitles'
import {Toaster} from 'react-hot-toast'

const App = () => {

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path='/' element={<Home/>}/>

        <Route path='/ai' element={<Layout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path='/ai/write-article' element={<WriteArticle/>}/>
          <Route path='/ai/blog-titles' element={<BlogTitles/>}/>
          <Route path='/ai/generate-images' element={<GenerateImage/>}/>
          <Route path='/ai/remove-background' element={<RemoveBackgroud/>}/>
          <Route path='/ai/remove-object' element={<RemoveObject/>}/>
          <Route path='/ai/review-resume' element={<ReviewResume/>}/>
          <Route path='/ai/community' element={<Community/>}/>
        </Route>

        <Route path='*' element={<NotFoundPage/>}/>

      </Routes>
    </div>
  )
}

export default App

