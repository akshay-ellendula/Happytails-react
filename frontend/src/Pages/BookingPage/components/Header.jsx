import {Search} from "lucide-react";
const Header = () => {
  return (
    <header className="bg-[#effe8b] border-b-2 border-black sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-14">
            <div className="flex items-center space-x-10">
              <div className="text-3xl font-bold text-[#1a1a1a]">🐾 HappyTails</div>
            </div>
            <nav className="hidden md:flex space-x-28 text-m font-semibold">
              <a href="#" className="text-[#1a1a1a] hover:transition">Pet Events</a>
              <a href="#" className="text-[#1a1a1a] hover:transition">Pet Shop</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search pet events, activities..." 
                className="w-72 pl-10 pr-4 py-2.5 border-2 border-black text-[#1a1a1a] rounded-full text-sm" 
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-black"/>
            </div>
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-[#1a1a1a] font-bold">P</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;