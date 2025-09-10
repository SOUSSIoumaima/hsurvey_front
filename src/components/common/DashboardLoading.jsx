import React from 'react';

const DashboardLoading = ({ message = "Loading your dashboard..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-md w-full mx-4 transform transition-all duration-300 hover:scale-105">
        <div className="flex flex-col items-center justify-center">
          {/* 4 dots animation with gradient */}
          <div className="flex space-x-3 mb-8">
            <div 
              className="w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full animate-bounce shadow-lg" 
              style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
            ></div>
            <div 
              className="w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full animate-bounce shadow-lg" 
              style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
            ></div>
            <div 
              className="w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full animate-bounce shadow-lg" 
              style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
            ></div>
            <div 
              className="w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full animate-bounce shadow-lg" 
              style={{ animationDelay: '600ms', animationDuration: '1.4s' }}
            ></div>
          </div>
          
       
          <p className="text-gray-800 font-semibold text-center text-xl mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {message}
          </p>
          
  
          <p className="text-gray-500 text-sm text-center">
            Please wait while we prepare your data...
          </p>
          
      
          <div className="w-full bg-gray-200 rounded-full h-1 mt-6 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoading; 