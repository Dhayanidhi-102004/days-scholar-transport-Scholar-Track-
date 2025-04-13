import React, { useState } from 'react';
import { BsSearch, BsJustify, BsFillBellFill, BsFillEnvelopeFill, BsPersonCircle } from 'react-icons/bs';

function Header({ setSearchQuery }) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
    setSearchQuery(e.target.value); // Update parent state
  };

  return (
    <header className="header">
      <div className="menu-icon">
        <BsJustify className="icon" />
      </div>
      <div className="header-left">
        <div className="search-container">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearch}
            placeholder="Search..."
            className="search-input"
          />
          <BsSearch className="search-icon" />
        </div>
      </div>
      <div className="header-right">
        <BsFillBellFill className="icon" />
        <BsFillEnvelopeFill className="icon" />
        <BsPersonCircle className="icon" />
      </div>
    </header>
  );
}

export default Header;
