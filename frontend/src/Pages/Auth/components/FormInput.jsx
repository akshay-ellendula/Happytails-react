import React from 'react';
import { Mail, Lock, User, Sparkles, Hand } from 'lucide-react';

const FormInput = ({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  icon: Icon,
}) => {
  return (
    <div className="w-full">
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </span>
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-5 py-4 my-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#effe8b] focus:ring-2 focus:ring-[#effe8b] focus:ring-opacity-50 transition-all placeholder-gray-400 ${
            Icon ? 'pl-12' : ''
          }`}
        />
      </div>
    </div>
  );
};

export default FormInput;