import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function SearchBar({ value, onChange, onSearch }) {
    const [isFocused, setIsFocused] = useState(false);
  
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        onSearch(value);
      }
    };

    const handleSearchClick = () => {
      onSearch(value);
    };

    return (
      <div className="flex-grow max-w-3xl mx-auto flex items-center gap-2">
        <div 
          className={`flex flex-1 items-center bg-white rounded-full h-[46px]
            border border-gray-200 px-3 transition-all duration-200
            ${isFocused ? 'border-gray-300 shadow-sm' : ''}`}
        >
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            className="border-0 bg-transparent flex-1 focus:outline-none text-gray-700 h-full text-sm mb-0"
            placeholder="관심사나 배틀룸 검색"
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>
        <button 
          onClick={handleSearchClick}
          className="h-[46px] w-[100px] px-3 btn text-sm hover:bg-btnLightBlue hover:text-btnLightBlue-hover rounded-full bg-btnLightBlue-hover text-btnLightBlue text-center whitespace-nowrap"
        >
          검색
        </button>
      </div>
    );
  }

  export default SearchBar;