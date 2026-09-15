import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import ArticleListPage from './pages/ArticleListPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ArticleEditor from './pages/ArticleEditor';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ArticleManagement from './pages/admin/ArticleManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import TagManagement from './pages/admin/TagManagement';
import CommentManagement from './pages/admin/CommentManagement';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* 前台路由 */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="articles" element={<ArticleListPage />} />
        <Route path="articles/:slug" element={<ArticleDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        {/* 可以添加分类、标签页面 */}
        <Route path="categories/:slug" element={<ArticleListPage />} />
        <Route path="tags/:slug" element={<ArticleListPage />} />
      </Route>

      {/* 登录/注册路由（不含布局） */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 后台管理路由 - 需要登录 */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/articles" replace />} />
        <Route path="articles" element={<ArticleManagement />} />
        <Route path="articles/new" element={<ArticleEditor />} />
        <Route path="articles/:id/edit" element={<ArticleEditor />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="tags" element={<TagManagement />} />
        <Route path="comments" element={<CommentManagement />} />
      </Route>

      {/* 404 页面 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
