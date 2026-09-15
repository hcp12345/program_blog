import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchApi } from '../services/api';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (keyword) {
      fetchResults();
    }
  }, [keyword, page]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await searchApi.search({ keyword, page, pageSize });
      setResults(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">搜索结果</h1>
        <p className="text-gray-600">
          关键词: <span className="font-semibold">"{keyword}"</span>
          {total > 0 && ` (找到 ${total} 篇文章)`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">没有找到相关文章</p>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            返回首页
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {results.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
              >
                <Link to={`/articles/${article.slug || article.id}`}>
                  <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 mb-2">
                    {article.title}
                  </h2>
                </Link>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                  <span>{article.viewCount} 次浏览</span>
                  {article.category && (
                    <Link
                      to={`/categories/${article.category.slug}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {article.category.name}
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-gray-600">
                第 {page} / {totalPages} 页
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchPage;
