import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const MobileMenu = ({ onClose }) => {
  const { isAuthenticated, signout } = useAuth();

  const handleLogout = () => {
    signout();
    onClose();
  };

  return (
    <div className="md:hidden bg-[#effe8b] border-b-2 border-black fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-between items-center p-4 border-b border-black">
        <span className="text-xl font-bold text-[#1a1a1a]">Menu</span>
        <button onClick={onClose}>
          <X className="w-6 h-6 text-[#1a1a1a]" />
        </button>
      </div>
      <nav className="flex flex-col space-y-4 p-4">
        <Link
          to="/events"
          className="text-[#1a1a1a] font-semibold text-lg"
          onClick={onClose}
        >
          Pet Events
        </Link>
        <Link
          to="/pet_accessory"
          className="text-[#1a1a1a] font-semibold text-lg"
          onClick={onClose}
        >
          Pet Shop
        </Link>
        <div className="relative mt-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-3 border-2 border-black text-[#1a1a1a] rounded-full text-sm bg-white"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-black" />
        </div>
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="text-[#1a1a1a] font-semibold text-center py-2 border-2 border-[#1a1a1a] rounded-full mt-4"
          >
            Logout
          </button>
        ) : (
          <div className="flex flex-col space-y-3 mt-4">
            <Link
              to="/login"
              className="text-[#1a1a1a] font-semibold text-center py-2 border-2 border-[#1a1a1a] rounded-full"
              onClick={onClose}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-white font-semibold text-center py-2 bg-[#1a1a1a] rounded-full border border-black"
              onClick={onClose}
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default MobileMenu;
