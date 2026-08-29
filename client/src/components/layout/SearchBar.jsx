import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="hidden md:flex flex-1 max-w-xl mx-8 relative items-center"
    >
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search products, brands and categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-12 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-gray-900 transition-all outline-none"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Search size={20} />
        </button>
      </div>
    </form>
  );
};
