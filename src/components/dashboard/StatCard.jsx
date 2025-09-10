import React from "react";

const StatCard = ({ title, value, icon: Icon, color, bgColor, description }) => (
  <div className={`${bgColor} rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`bg-gradient-to-r ${color} p-3 rounded-xl shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);

export default StatCard;