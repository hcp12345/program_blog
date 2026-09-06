import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* 侧边栏 */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">博客管理后台</h1>
        </div>
        <nav className="mt-6 flex-1">
          <Link
            to="/admin/articles"
            className="block px-6 py-3 hover:bg-gray-800 transition"
          >
            文章管理
          </Link>
          <Link
            to="/admin/categories"
            className="block px-6 py-3 hover:bg-gray-800 transition"
          >
            分类管理
          </Link>
          <Link
            to="/admin/tags"
            className="block px-6 py-3 hover:bg-gray-800 transition"
          >
            标签管理
          </Link>
          <Link
            to="/admin/comments"
            className="block px-6 py-3 hover:bg-gray-800 transition"
          >
            评论管理
          </Link>
          <Link
            to="/admin/articles/new"
            className="block px-6 py-3 hover:bg-gray-800 transition"
          >
            新建文章
          </Link>
        </nav>
        {/* 用户信息 */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
              {user?.nickname?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nickname || user?.username}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">管理面板</h2>
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              返回前台
            </Link>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
