import { useEffect, useState } from "react";

function StudyMaterial({ topic }: { topic: string }) {
  const [articles, setArticles] = useState<Array<{ url: string; title: string }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setArticles(null);
    setError(null);
    
    fetch(`http://localhost:8000/recommend?topic=${encodeURIComponent(topic)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data.articles || data.articles.length === 0) {
          setError("No articles found for this topic");
        } else {
          setArticles(data.articles);
        }
      })
      .catch((err) => {
        console.error("Error fetching articles:", err);
        setError("Failed to load study materials");
      });
  }, [topic]);

  if (error) return <p className="text-red-500 mt-4">{error}</p>;
  if (!articles) return <p className="text-gray-500 mt-4">Loading study material...</p>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Recommended Study Material</h3>
      {articles.length > 0 ? (
        <ul className="space-y-2">
          {articles.map((article, i) => (
            <li key={i}>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                {article.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No articles found for this topic.</p>
      )}
    </div>
  );
}

export default StudyMaterial;