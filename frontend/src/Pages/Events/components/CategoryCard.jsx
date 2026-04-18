import React from 'react';

const CategoryCard = ({ emoji, title, isActive, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all ${
        isActive 
          ? "bg-white text-black" 
          : "bg-[#111] text-white/70 hover:bg-[#1a1a1a] hover:text-white"
      }`}
    >
      <span className="text-2xl mb-2">{emoji}</span>
      <span className="font-semibold text-[10px] text-center uppercase tracking-wider">{title}</span>
    </div>
  );
};

export default CategoryCard;