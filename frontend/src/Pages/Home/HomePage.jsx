import React from "react";
import {Search} from "lucide-react";
import "./home.css"
import { images } from "../../assets/assets.js";
const HomePage = ({ user }) => {
  return (
    <>
      <div className="navbar">
        <header>
          <div className="badge">
            <a href="/home" className="badge">
              Happy Tails
            </a>
          </div>
          <div className="search-bar items-center">
           <Search className="h-8 w-8 pt-3" />
            <input
              type="text"
              placeholder="Search.."
              size="25"
              style={{ fontSize: "20px" }}
            />
          </div>

          <div className="menu">
            <a href="/pet_accessory">Pet Essentials</a>
            <a href="/Events">Events</a>
            {user ? (
              <a href="/profile">Profile</a>
            ) : (
              <a href="/my_login">Login/SignUp</a>
            )}
          </div>

          <div className="menu-icon" id="menuIcon">
            <img
              src="/icons/hamburger-svgrepo-com.svg"
              alt="Menu"
              height="25px"
            />
          </div>

          <div className="side-navbar" id="sideNavbar">
            <a href="#" className="close-btn" id="closeBtn">
              &times;
            </a>
            <a href="/pet_accessory">Essentials</a>
            <a href="/Events">Events</a>
            {user ? (
              <a href="/profile">Profile</a>
            ) : (
              <a href="/my_login">Login/SignUp</a>
            )}
          </div>
        </header>
      </div>

      <section className="image-card">
        <div className="content startAnimation">
          <div className="centered-text">
            <h1>
              For The Pet who has EveryThing...
              <br />
            </h1>
            <p>Still Deserves More!</p>
          </div>
        </div>
        <div className="main_images">
          <img
            src={images.img3}
            className="random-image image1"
            alt="Image 1"
          />
          <img
            src="/images/Cat1.jpg"
            className="random-image image2"
            alt="Image 2"
          />
          <img
            src="/images/pet dog playing with owner.jpg"
            className="random-image image3"
            alt="Image 3"
          />
          <img
            src="/images/orange-cat.jpg"
            className="random-image image4"
            alt="Image 4"
          />
        </div>
      </section>

      <section className="shop autoshow">
        <h1>Shop</h1>
        <div className="card-container">
          <div className="card">
            <div className="shop-image">
              <img
                src="/images/dog sleeping on a dog, to advertise the dog bed with a plane grey background.jpg"
                alt="Dog bed"
              />
            </div>
            <h2>Orthopedic Dog Bed</h2>
            <p>₹2,990</p>
          </div>

          <div className="card">
            <div className="shop-image">
              <img
                src="/images/cat in cat cave, to advertise the cat cave with a plane grey background, a little bigger.jpg"
                alt="cat cave"
              />
            </div>
            <h2>Cozy Cat Cave</h2>
            <p>₹1,490</p>
          </div>

          <div className="card">
            <div className="shop-image">
              <img
                src="/images/pet nail clippers in a grey background, make more cuter.jpg"
                alt="pet nail clippers"
              />
            </div>
            <h2>Pet Nail Clippers</h2>
            <p>₹490</p>
          </div>
        </div>
        <button onClick={() => (window.location.href = "/pet_accessory")}>
          Get Started
        </button>
      </section>

      <section className="about-us autoshow">
        <div className="about-us-imag">
          <img
            src={images.img1}
            alt="About Us"
          />
        </div>

        <div className="content">
          <h2>About Us</h2>
          <p>
            Welcome to Happy Tails — Where Every Wag Matters!
            <br />
            At Happy Tails, we believe that pets aren't just animals — they're
            family. That's why we've created a one-stop destination for pet
            lovers who want nothing but the best for their furry companions.
            <br />
            From thrilling dog races and exciting pet events to a carefully
            curated selection of pet essentials and stylish accessories, Happy
            Tails brings together community, care, and convenience — all under
            one digital roof. Our mission is to make pet parenting joyful and
            stress-free by connecting you with experiences and products that
            keep tails wagging and hearts full.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <h3>Happy Tails</h3>
            <ul>
              <li>
                <a href="/pet_accessory">Online Pet Accessories</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Partner</h3>
            <ul>
              <li>
                <a href="/store_signup">Pet Store Franchise</a>
              </li>
              <li>
                <a href="/event_manager_signup">Become an Event Manager</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Policy</h3>
            <ul>
              <li>
                <a href="/privacy-policy">Privacy Policy</a>
              </li>
              <li>
                <a href="/refund-policy">Refund Policy</a>
              </li>
              <li>
                <a href="/cancellation-policy">Cancellation Policy</a>
              </li>
              <li>
                <a href="/terms-and-conditions">Terms & Conditions</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
};
export default HomePage;
