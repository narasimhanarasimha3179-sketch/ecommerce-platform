import { useState } from "react";

function SearchBar({ onSearch }) {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto my-8 flex"
    >
      <input
        type="text"
        placeholder="Search for products, brands and more..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 outline-none"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-8 rounded-r-lg hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;