import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleApi, searchApi } from '../services/api';

function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotArticles, setHotArticles] = useState([]);

  useEffect(() => {
    fetchArticles();
    fetchHotArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await articleApi.getList({ page: 1, pageSize: 10, status: 'published' });
      setArticles(res.data.list || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotArticles = async () => {
    try {
      const res = await searchApi.getHot();
      setHotArticles(res.data || []);
    } catch (error) {
      console.error('Failed to fetch hot articles:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 animate-fade-in">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute top-0 left-0 h-16 w-16 flex items-center justify-center">
            <span className="text-primary-600 text-xl">M</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Hero 欢迎区域 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-soft mb-10 p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">欢迎来到 MD Blog</h1>
          <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
            探索技术、分享见解、记录成长。一个现代化的 Markdown 博客系统。
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/articles"
              className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              浏览文章
            </Link>
            <Link
              to="/admin/articles/new"
              className="px-6 py-3 bg-white/20 backdrop-blur text-white rounded-lg font-semibold hover:bg-white/30 transform hover:scale-105 transition-all duration-300"
            >
              开始写作
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主内容区 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full mr-3"></span>
              最新文章
            </h2>
            <Link
              to="/articles"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center group"
            >
              查看全部
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-soft p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">暂无文章，快去创作吧！</p>
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article, index) => (
                <article
                  key={article.id}
                  className="bg-white rounded-xl shadow-soft hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {article.coverImage && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <Link to={`/articles/${article.slug || article.id}`}>
                      <h2 className="text-2xl font-bold text-gray-900 hover:text-primary-600 mb-3 transition-colors duration-200 line-clamp-2">
                        {article.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {article.viewCount || 0}
                      </span>
                      {article.category && (
                        <Link
                          to={`/categories/${article.category.slug}`}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          {article.category.name}
                        </Link>
                      )}
                    </div>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <Link
                            key={tag.id}
                            to={`/tags/${tag.slug}`}
                            className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-secondary-50 to-secondary-100 text-secondary-700 hover:from-secondary-100 hover:to-secondary-200 transition-all duration-200 font-medium"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <aside className="space-y-6">
          {/* 热门文章 */}
          <div className="bg-white rounded-xl shadow-soft p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-bold text-gray-900">热门文章</h3>
            </div>
            {hotArticles.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔥</div>
                <p className="text-gray-500 text-sm">暂无热门文章</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {hotArticles.map((article, index) => (
                  <li key={article.id} className="group">
                    <Link
                      to={`/articles/${article.slug || article.id}`}
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-primary-50 transition-colors duration-200"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 group-hover:text-primary-600 text-sm font-medium transition-colors duration-200 line-clamp-2">
                          {article.title}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {article.viewCount || 0}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 快速链接卡片 */}
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-soft p-6 text-white animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              快速开始
            </h3>
            <div className="space-y-3">
              <Link
                to="/search"
                className="flex items-center p-3 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="font-medium">搜索文章</span>
                <svg className="w-4 h-4 ml-auto transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/categories"
                className="flex items-center p-3 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="font-medium">浏览分类</span>
                <svg className="w-4 h-4 ml-auto transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default HomePage;
