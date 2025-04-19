
import { useSearchParams } from "react-router-dom";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>
      <p className="text-muted-foreground mb-4">
        Showing results for: {query}
      </p>
      <div className="space-y-4">
        {/* Add search results content */}
        <p className="text-muted-foreground">No results found</p>
      </div>
    </div>
  );
};

export default SearchResults;
