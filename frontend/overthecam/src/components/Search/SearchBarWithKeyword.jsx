import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SearchBarWithKeyword = ({ onSearch, initialValue = "" }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (newValue === '') {
      onSearch('');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="relative -mt-6 flex">
        <div className="flex w-full rounded-lg overflow-hidden">
          <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleChange}
                placeholder=""
                className="w-full h-16 px-4 py-2 rounded-2xl shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-8 -translate-y-1/2 p-1 hover:bg-transparent transition-colors w-8 h-8 bg-transparent"
              >
                <MagnifyingGlassIcon className="w-5 h-5 text-cusRed hover:text-cusBlue" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SearchBarWithKeyword; 