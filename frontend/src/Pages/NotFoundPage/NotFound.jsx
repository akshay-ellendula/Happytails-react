import React from 'react'
import { Link } from 'react-router';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#effe8b] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-bold text-[#1a1a1a]">404</h1>
      <p className="text-2xl text-gray-800 mt-4">Page Not Found</p>
      <p className="text-gray-600 mt-2">The page you are looking for doesn't exist or you don't have permission to access it.</p>
      <Link to="/" className="mt-8 px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-bold hover:opacity-90 transition">
        Go Home
      </Link>
    </div>
  )
}

export default NotFound