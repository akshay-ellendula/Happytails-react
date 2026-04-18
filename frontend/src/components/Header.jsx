import { Search, Menu, LogOut, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../context/CartContext";

const Header = ({ onMenuToggle }) => {
  const { isAuthenticated, signout, user } = useAuth();
  const { openCart } = useCart();

  const handleLogout = () => {
    signout();
  };

  return (
    <header className="bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 font-outfit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          <div className="flex items-center space-x-4 sm:space-x-14">
            <Link
              to="/"
              className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2"
            >
              🐾 HappyTails
            </Link>

            <nav className="hidden md:flex space-x-8 lg:space-x-16 text-sm lg:text-base font-medium">
              <Link
                to="/events"
                className="text-white/70 hover:text-white transition-colors"
              >
                Pet Events
              </Link>
              <Link
                to="/pet_accessory"
                className="text-white/70 hover:text-white transition-colors"
              >
                Pet Shop
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button className="md:hidden p-2 text-white/80" onClick={onMenuToggle}>
              <Menu className="w-6 h-6 border-b-2" />
            </button>

            <button
              onClick={openCart}
              className="hidden sm:flex p-2 text-white/80 hover:text-white transition-colors"
              title="View Cart"
            >
              <ShoppingCart className="w-6 h-6" />
            </button>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-4 ml-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2"
                  title="View Profile"
                >
                  {user && user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#f2c737] rounded-full items-center justify-center text-black font-semibold flex">
                      {user?.userName
                        ? user.userName.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:block">Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-4 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-white/80 font-medium hover:text-white transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 bg-[#f2c737] text-black rounded-lg font-semibold text-sm hover:bg-white hover:text-black transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;