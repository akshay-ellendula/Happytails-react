import { Search, Menu, LogOut } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../../../context/AuthContext';

const Header = ({ onMenuToggle }) => {
  const { isAuthenticated, signout } = useAuth();

  const handleLogout = () => {
    signout();
  };

  return (
    <header className="bg-[#effe8b] border-b-2 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4 sm:space-x-14">
            <div className="flex items-center space-x-4 sm:space-x-10">
              <Link to="/" className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">🐾 HappyTails</Link>
              <span className="hidden sm:inline text-xs bg-white text-[#1a1a1a] font-semibold px-4 py-2 sm:py-5 rounded-full border border-black">HYDERABAD</span>
            </div>
            <nav className="hidden md:flex space-x-8 lg:space-x-28 text-sm lg:text-base font-semibold">
              <Link to="/events" className="text-[#1a1a1a] hover:text-[#1a1a1a]/70 transition">Pet Events</Link>
              <Link to="/pet_accessory" className="text-[#1a1a1a] hover:text-[#1a1a1a]/70 transition">Pet Shop</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block">
              <input 
                type="text" 
                placeholder="Search pet events, activities..." 
                className="w-72 pl-10 pr-4 py-2.5 border-2 border-black text-[#1a1a1a] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] bg-white" 
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-black" />
            </div>
            <button className="md:hidden p-2" onClick={onMenuToggle}>
              <Menu className="w-6 h-6 text-[#1a1a1a]" />
            </button>
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full items-center justify-center text-[#1a1a1a] font-bold border border-black flex">
                    U
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-[#1a1a1a] hover:text-[#1a1a1a]/70 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:block">Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex space-x-4">
                <Link to="/login" className="px-4 py-2 text-[#1a1a1a] font-semibold hover:text-[#1a1a1a]/70 transition">Login</Link>
                <Link to="/signup" className="px-4 py-2 bg-[#1a1a1a] text-white rounded-full font-semibold hover:bg-[#1a1a1a]/80 transition border border-black">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;