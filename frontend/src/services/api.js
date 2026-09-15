import axios from 'axios';

// 在开发环境使用相对路径，通过 Vite 代理转发到后端
// 在生产环境使用环境变量配置的完整 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

// 文章相关 API
export const articleApi = {
  // 获取文章列表
  getList: (params) => api.get('/articles', { params }),
  // 获取文章详情
  getDetail: (id) => api.get(`/articles/${id}`),
  // 根据 slug 获取文章
  getBySlug: (slug) => api.get(`/articles/slug/${slug}`),
  // 创建文章
  create: (data) => api.post('/articles', data),
  // 更新文章
  update: (id, data) => api.put(`/articles/${id}`, data),
  // 删除文章
  delete: (id) => api.delete(`/articles/${id}`),
  // 批量删除文章
  batchDelete: (ids) => api.post('/articles/batch-delete', { ids }),
  // 点赞文章
  like: (id) => api.post(`/articles/${id}/like`),
};

// 分类相关 API
export const categoryApi = {
  // 获取所有分类
  getList: () => api.get('/categories'),
  // 获取分类详情
  getDetail: (id) => api.get(`/categories/${id}`),
  // 根据 slug 获取分类
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  // 创建分类
  create: (data) => api.post('/categories', data),
  // 更新分类
  update: (id, data) => api.put(`/categories/${id}`, data),
  // 删除分类
  delete: (id) => api.delete(`/categories/${id}`),
};

// 标签相关 API
export const tagApi = {
  // 获取所有标签
  getList: () => api.get('/tags'),
  // 获取标签详情
  getDetail: (id) => api.get(`/tags/${id}`),
  // 根据 slug 获取标签
  getBySlug: (slug) => api.get(`/tags/slug/${slug}`),
  // 创建标签
  create: (data) => api.post('/tags', data),
  // 更新标签
  update: (id, data) => api.put(`/tags/${id}`, data),
  // 删除标签
  delete: (id) => api.delete(`/tags/${id}`),
};

// 评论相关 API
export const commentApi = {
  // 获取评论列表
  getList: (params) => api.get('/comments', { params }),
  // 获取评论详情
  getDetail: (id) => api.get(`/comments/${id}`),
  // 创建评论
  create: (data) => api.post('/comments', data),
  // 更新评论状态
  update: (id, data) => api.put(`/comments/${id}`, data),
  // 删除评论
  delete: (id) => api.delete(`/comments/${id}`),
  // 点赞评论
  like: (id) => api.post(`/comments/${id}/like`),
};

// 搜索相关 API
export const searchApi = {
  // 搜索文章
  search: (params) => api.get('/search', { params }),
  // 获取热门内容
  getHot: () => api.get('/articles/hot'),
};

export default api;
