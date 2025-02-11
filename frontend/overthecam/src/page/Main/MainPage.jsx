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
  const [searchResults, setSearchResults] = useState({
    battles: [],
    votes: [],
    users: []
  });

  const handleSearch = async (query) => {
    console.log("MainPage - 검색 시작:", query);
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults({
        battles: [],
        votes: [],
        users: []
      });
      return;
    }

    try {
      // API 명세 받으면 여기만 수정하면 됩니다
      const response = await fetch(`${API_URL}/search?query=${query}`);
      const data = await response.json();
      
      setSearchResults({
        battles: data.battles || [],
        votes: data.votes || [],
        users: data.users || []
      });

      console.log("검색 완료:", data);
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      setSearchResults({
        battles: [],
        votes: [],
        users: []
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        {/* 그라데이션 배경 */}
        <div className="bg-gradient-to-r from-cusPink to-cusLightBlue h-56" />
        
        {/* 이미지 섹션 */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-20 mb-8">
            {/* 이미지 컴포넌트들 */}
          </div>

          {/* 검색창 */}
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchQuery ? (
                  searchResults.battles.length > 0 ? (
                    searchResults.battles.map((battle) => (
                      <div key={`battle-${battle.id}`} className="p-4 bg-white rounded-lg shadow h-32">
                        {battle.title}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-4">
                      <p className="text-gray-500">Battle 검색 결과가 없습니다</p>
                    </div>
                  )
                ) : (
                  [...Array(6)].map((_, index) => (
                    <Card key={`battle-${index}`} />
                  ))
                )}
              </div>
            </section>

            {/* Vote Section */}
            <section className="flex flex-col mb-12">
              <div className="flex justify-between items-center">
                <SectionTitle title="Vote" />
                <Link
                  to="/vote-inprogress"
                  className="text-cusBlue text-xl font-medium justify-end mr-5"
                >
                  + More
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchQuery ? (
                  searchResults.votes.length > 0 ? (
                    searchResults.votes.map((vote) => (
                      <div key={`vote-${vote.id}`} className="p-4 bg-white rounded-lg shadow h-32">
                        {vote.title}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-4">
                      <p className="text-gray-500">Vote 검색 결과가 없습니다</p>
                    </div>
                  )
                ) : (
                  [...Array(6)].map((_, index) => (
                    <Card key={`vote-${index}`} />
                  ))
                )}
              </div>
            </section>

            {/* User Section - 검색할 때만 표시 */}
            {searchQuery && (
              <section className="flex flex-col mb-12">
                <div className="flex justify-between items-center">
                  <SectionTitle title="User" />
                  <Link
                    to="/users"
                    className="text-cusBlue text-xl font-medium justify-end mr-5"
                  >
                    + More
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.users.length > 0 ? (
                    searchResults.users.map((user) => (
                      <div 
                        key={`user-${user.id}`} 
                        className="p-4 bg-white rounded-lg shadow flex items-center gap-4 h-32"
                      >
                        <img 
                          src={user.profileImage} 
                          alt={user.nickname} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.nickname}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-4">
                      <p className="text-gray-500">User 검색 결과가 없습니다</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
