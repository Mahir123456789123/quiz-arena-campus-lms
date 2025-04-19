
import { useEffect, useState } from "react";

function StudyMaterial({ topic }: { topic: string }) {
  const [articles, setArticles] = useState<Array<{ url: string; title: string }> | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/recommend?topic=${encodeURIComponent(topic)}`)
      .then((res) => res.json())
      .then((data) => setArticles(data.articles))
      .catch(console.error);
  }, [topic]);

  if (!articles) return <p>Loading study material...</p>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Recommended Study Material</h3>
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
    </div>
  );
}

export default StudyMaterial;
