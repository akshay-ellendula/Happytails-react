import React from 'react'

const CategoryCard = ({ emoji, title }) => {
  return (
    <div className="bg-white  rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center cursor-pointer hover:scale-105 transition transform group">
      <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 sm:mb-3">{emoji}</div>
      <p className="text-[#1a1a1a]  font-bold text-xs sm:text-sm">
        {title}
      </p>
    </div>
  );
};

export default CategoryCard