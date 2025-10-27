// components/Shop.jsx
import React from 'react';
import { Link } from 'react-router';
import { images } from '../../../assets/assets';

const Shop = () => {
  const products = [
    {
      id: 1,
      name: "Orthopedic Dog Bed",
      price: "₹2,990",
      image: images.img5,
      description: "Comfortable bed for your furry friend"
    },
    {
      id: 2,
      name: "Cozy Cat Cave",
      price: "₹1,490",
      image: images.img5,
      description: "Perfect hiding spot for your cat"
    },
    {
      id: 3,
      name: "Pet Nail Clippers",
      price: "₹490",
      image: images.img5,
      description: "Safe and easy to use nail clippers"
    }
  ];

  return (
    <section className="slide-up mx-5 lg:mx-[75px] my-12 text-center bg-[#effe8b]">
      <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-[#1a1a1a]">Shop</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {products.map((product) => (
          <article key={product.id} className="border-2 border-black rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow bg-white">
            <div className="relative h-[300px] lg:h-[450px] overflow-hidden">
              <img 
                src={product.image} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt={product.name} 
              />
              <div className="absolute inset-x-0 bottom-0 h-[75px] bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center text-xl cursor-pointer font-semibold text-[#1a1a1a] border-t-2 border-black">
                Quick View
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#1a1a1a] mt-4">{product.name}</h3>
            <p className="mb-4 text-lg text-[#1a1a1a]">{product.price}</p>
          </article>
        ))}
      </div>
      <Link 
        to="/pet_accessory"
        className="mt-10 px-8 py-3 text-xl text-white bg-[#1a1a1a] border border-[#1a1a1a] rounded-full transition-all duration-300 hover:bg-transparent hover:text-[#1a1a1a] font-semibold inline-block"
      >
        Get Started
      </Link>
    </section>
  );
};

export default Shop;