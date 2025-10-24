import React from "react";
import styles from "../home.module.css";

const ShopSection = () => {
  const products = [
    {
      src: "/images/dog sleeping on a dog, to advertise the dog bed with a plane grey background.jpg",
      name: "Orthopedic Dog Bed",
      price: "₹2,990",
    },
    {
      src: "/images/cat in cat cave, to advertise the cat cave with a plane grey background, a little bigger.jpg",
      name: "Cozy Cat Cave",
      price: "₹1,490",
    },
    {
      src: "/images/pet nail clippers in a grey background, make more cuter.jpg",
      name: "Pet Nail Clippers",
      price: "₹490",
    },
  ];

  return (
    <section className={`${styles.shop} ${styles.autoshow}`}>
      <h1>Shop</h1>
      <div className={styles['card-container']}>
        {products.map((product, index) => (
          <div className={styles.card} key={index}>
            <div className={styles['shop-image']}>
              <img src={product.src} alt={product.name} />
            </div>
            <h2>{product.name}</h2>
            <p>{product.price}</p>
          </div>
        ))}
      </div>
      <button onClick={() => (window.location.href = "/pet_accessory")}>
        Get Started
      </button>
    </section>
  );
};

export default ShopSection;