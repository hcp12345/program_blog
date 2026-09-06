import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkDirective from 'remark-directive';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { articleApi, categoryApi, tagApi } from '../services/api';
import 'highlight.js/styles/github.css';

// 预览模式枚举
const PREVIEW_MODE = {
  EDIT: 'edit',       // 仅编辑
  PREVIEW: 'preview', // 仅预览
  SPLIT: 'split',     // 分屏
};

// 默认配置
const DEFAULT_CONFIG = {
  coverImage: 'https://picsum.photos/seed/blog/1200/630', // 默认封面图片
};

function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    categoryId: '',
    tagIds: [],
    status: 'draft',
  });

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(PREVIEW_MODE.SPLIT);

  useEffect(() => {
    fetchCategories();
    fetchTags();
    if (isEdit) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const res = await articleApi.getDetail(id);
      const article = res.data;
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        coverImage: article.coverImage || '',
        categoryId: article.categoryId || '',
        tagIds: article.tags?.map((t) => t.id) || [],
        status: article.status || 'draft',
      });
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getList();
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await tagApi.getList();
      setTags(res.data || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  // 处理文件导入
  const handleFileImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.name.endsWith('.md')) {
      alert('请选择 .md 格式的 Markdown 文件');
      return;
    }

    try {
      const text = await file.text();

      // 从文件名提取标题（去除 .md 扩展名）
      const fileName = file.name.replace(/\.md$/i, '');
      const title = fileName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      // 生成 slug
      const slug = fileName
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // 设置默认分类（选择第一个分类）
      const defaultCategoryId = categories.length > 0 ? categories[0].id : '';

      setFormData((prev) => ({
        ...prev,
        title,
        slug,
        content: text,
        coverImage: prev.coverImage || DEFAULT_CONFIG.coverImage,
        categoryId: prev.categoryId || defaultCategoryId,
        excerpt: prev.excerpt || text.substring(0, 200),
      }));

      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to read file:', error);
      alert('文件读取失败: ' + error.message);
    }
  };

  // 触发文件选择
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 自动生成 slug
    if (name === 'title' && !isEdit) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleContentChange = (e) => {
    const content = e.target.value;
    setFormData((prev) => ({
      ...prev,
      content,
      excerpt: prev.excerpt || content.substring(0, 200),
    }));
  };

  const handleTagToggle = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEdit) {
        await articleApi.update(id, formData);
      } else {
        await articleApi.create(formData);
      }
      navigate('/admin/articles');
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('保存失败: ' + (error.message || '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,text/markdown"
        onChange={handleFileImport}
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? '编辑文章' : '新建文章'}
          </h2>
          {!isEdit && (
            <button
              type="button"
              onClick={handleImportClick}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>导入 Markdown</span>
            </button>
          )}
        </div>

        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文章标题 *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入文章标题"
          />
        </div>

        {/* 别名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文章别名 *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="article-slug"
          />
        </div>

        {/* 分类 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分类
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.tagIds.includes(tag.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* 封面图 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            封面图片 URL
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={DEFAULT_CONFIG.coverImage}
            />
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, coverImage: DEFAULT_CONFIG.coverImage }))}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition whitespace-nowrap"
              title="使用默认封面"
            >
              使用默认
            </button>
          </div>
          {formData.coverImage && (
            <div className="mt-2">
              <img
                src={formData.coverImage}
                alt="封面预览"
                className="h-32 rounded-lg object-cover"
                onError={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
              />
            </div>
          )}
        </div>

        {/* Markdown 内容编辑器和预览 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Markdown 内容 *
            </label>

            {/* 预览模式切换按钮 */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setPreviewMode(PREVIEW_MODE.EDIT)}
                className={`px-3 py-1 rounded text-sm transition ${
                  previewMode === PREVIEW_MODE.EDIT
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="仅编辑"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(PREVIEW_MODE.SPLIT)}
                className={`px-3 py-1 rounded text-sm transition ${
                  previewMode === PREVIEW_MODE.SPLIT
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="分屏预览"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(PREVIEW_MODE.PREVIEW)}
                className={`px-3 py-1 rounded text-sm transition ${
                  previewMode === PREVIEW_MODE.PREVIEW
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="仅预览"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <div className={`grid gap-4 ${previewMode === PREVIEW_MODE.SPLIT ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* 编辑区 */}
            {previewMode !== PREVIEW_MODE.PREVIEW && (
              <div className={previewMode === PREVIEW_MODE.SPLIT ? 'h-[600px]' : ''}>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleContentChange}
                  required
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                    previewMode === PREVIEW_MODE.SPLIT ? 'h-full resize-none' : 'min-h-[400px]'
                  }`}
                  placeholder="请输入 Markdown 内容或点击上方按钮导入 .md 文件..."
                />
              </div>
            )}

            {/* 预览区 */}
            {previewMode !== PREVIEW_MODE.EDIT && (
              <div
                className={`border border-gray-300 rounded-lg bg-white p-6 overflow-auto ${
                  previewMode === PREVIEW_MODE.SPLIT ? 'h-[600px]' : 'min-h-[400px]'
                }`}
              >
                {formData.content ? (
                  <div className="markdown-body prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks, remarkDirective]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeSanitize]}
                    >
                      {formData.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-12">
                    在左侧输入 Markdown 内容，此处将实时预览
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="mt-2 text-sm text-gray-500">
            支持 GitHub Flavored Markdown、表格、任务列表、删除线、代码高亮等最新语法
            {!isEdit && ' · 可导入 .md 文件'}
          </p>
        </div>

        {/* 摘要 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            摘要
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="文章摘要（可选，默认自动生成）"
          />
        </div>

        {/* 状态 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            状态
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">归档</option>
          </select>
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/articles')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : isEdit ? '更新文章' : '创建文章'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArticleEditor;
