import { useState } from "react";
import SearchBar from "../../components/Main/SearchBar";
import { Link } from "react-router-dom";

const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-4 h-32">{children}</div>
);

const SectionTitle = ({ title }) => (
  <h2 className="text-3xl font-bold mb-4 pl-8 text-start justify-start">
    {title}
  </h2>
);

const MainPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <div className="relative">
        <div className="bg-gradient-to-r from-cusPink to-cusLightBlue h-56" />

        {/* Search UI */}
        <SearchBar placeholder="Search..." />

        {/* Content */}
        <div className="container mx-auto p-14">
          {/* Battle Section */}
          <section className="flex flex-col mb-12">
            <div className="flex justify-between items-center">
              <SectionTitle title="Battle" />
              <Link
                to="/battle-list"
                className="text-cusBlue text-xl font-medium justify-end mr-5"
              >
                + More
              </Link>
            </div>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <Card key={`battle-${index}`} />
                ))}
              </div>
            </div>
          </section>

          {/* Vote Section */}
          <section className="flex flex-col mb-12">
            <div className="flex justify-between items-center">
              <SectionTitle title="Vote" />
              <Link
                className="text-cusBlue text-xl font-medium justify-end mr-5"
              >
                + More
              </Link>
            </div>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <Card key={`battle-${index}`} />
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default MainPage;
