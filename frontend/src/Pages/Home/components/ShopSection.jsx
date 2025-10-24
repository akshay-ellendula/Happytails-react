import React from "react";
import styles from "../home.module.css";

const ShopSection = () => {
  // Hardcoded products for display - data should ideally come from props or state
  const products = [
    {
      src: "/images/dog sleeping on a dog, to advertise the dog bed with a plane grey background.jpg", // Ensure path is relative to public folder
      name: "Orthopedic Dog Bed",
      price: "₹2,990",
    },
    {
      src: "/images/cat in cat cave, to advertise the cat cave with a plane grey background, a little bigger.jpg", // Ensure path is relative to public folder
      name: "Cozy Cat Cave",
      price: "₹1,490",
    },
    {
      src: "/images/pet nail clippers in a grey background, make more cuter.jpg", // Ensure path is relative to public folder
      name: "Pet Nail Clippers",
      price: "₹490",
    },
  ];

  return (
    // Changed section tag to use styles.shop
    <section className={`${styles.shop} ${styles.autoshow}`}>
      {/* Changed h1 tag to use styles.h1 */}
      <h1 className={styles.h1}>Shop Our Essentials</h1>
      <div className={styles['card-container']}>
        {products.map((product, index) => (
          // Card div seems fine, uses styles.card
          <div className={styles.card} key={index}>
            {/* shop-image div seems fine */}
            <div className={styles['shop-image']}>
              <img src={product.src} alt={product.name} />
              {/* Added Quick View overlay example */}
              <div className={styles['quick-view']}>Quick View</div>
            </div>
             {/* Added details container */}
             <div className={styles['shop-card-details']}>
                {/* Changed h2 tag to use styles.h2 */}
                <h2 className={styles.h2}>{product.name}</h2>
                {/* Changed p tag to use styles.p */}
                <p className={styles.p}>{product.price}</p>
             </div>
          </div>
        ))}
      </div>
      {/* Changed button tag to use styles.button */}
      <button className={styles.button} onClick={() => (window.location.href = "/pet_accessory")}> 
        Explore More
      </button>
    </section>
  );
};

export default ShopSection;