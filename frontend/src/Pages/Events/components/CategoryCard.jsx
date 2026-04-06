import React from 'react';

const CategoryCard = ({ emoji, title, isActive, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
        isActive 
          ? "bg-[#1a1a1a] text-[#f2c737] translate-y-1 shadow-none" 
          : "bg-white text-[#1a1a1a] hover:-translate-y-1 hover:bg-[#effe8b]"
      }`}
    >
      <span className="text-3xl mb-2">{emoji}</span>
      <span className="font-bold text-xs text-center uppercase tracking-wide">{title}</span>
    </div>
  );
};

export default CategoryCard;