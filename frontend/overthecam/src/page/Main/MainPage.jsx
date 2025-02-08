import { useState } from "react";
import SearchBar from "../../components/Main/SearchBar";


const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-4 h-32">{children}</div>
);

const SectionTitle = ({ title }) => (
  <h2 className="text-3xl font-bold mb-4 pl-8 text-start">{title}</h2>
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
          <section className="mb-12">
            <SectionTitle title="Battle" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <Card key={`battle-${index}`} />
              ))}
            </div>
          </section>

          {/* Vote Section */}
          <section className="mb-12">
            <SectionTitle title="Vote" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, index) => (
                <Card key={`vote-${index}`} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
