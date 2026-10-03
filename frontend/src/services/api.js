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

// AI 智能客服相关 API
export const chatApi = {
  // 我的会话列表
  getSessions: () => api.get('/chat/sessions'),
  // 会话消息
  getMessages: (id) => api.get(`/chat/sessions/${id}/messages`),
  // 删除会话
  deleteSession: (id) => api.delete(`/chat/sessions/${id}`),
  // 智能客服配置（管理员）
  getSettings: () => api.get('/chat/settings'),
  updateSettings: (data) => api.put('/chat/settings', data),
  // 客服质检：全量会话检索（管理员）
  adminSessions: (params) => api.get('/chat/admin/sessions', { params }),
};

/**
 * 发起流式对话（SSE）
 * 后端返回 event: start / delta / tool / done / error
 * @param {object} opts { message, sessionId, handlers: { onStart, onDelta, onTool, onDone, onError }, signal }
 */
export async function streamChat({ message, sessionId, onStart, onDelta, onTool, onDone, onError, signal }) {
  const token = localStorage.getItem('token');

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, sessionId }),
      signal,
    });
  } catch (err) {
    if (err.name !== 'AbortError' && onError) onError({ message: '网络异常，请稍后重试' });
    return;
  }

  // 限流等前置错误会以 JSON 返回
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (onError) onError({ message: data.message || `请求失败（${res.status}）` });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  for (;;) {
    let chunk;
    try {
      chunk = await reader.read();
    } catch {
      break;
    }
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });

    const blocks = buffer.split('\n\n');
    buffer = blocks.pop(); // 最后一段可能不完整

    for (const block of blocks) {
      let event = 'message';
      let data = '';
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
      }
      let payload = {};
      try {
        payload = data ? JSON.parse(data) : {};
      } catch {
        payload = {};
      }

      if (event === 'start' && onStart) onStart(payload);
      else if (event === 'delta' && onDelta) onDelta(payload.text || '');
      else if (event === 'tool' && onTool) onTool(payload);
      else if (event === 'done' && onDone) onDone(payload);
      else if (event === 'error' && onError) onError(payload);
    }
  }
}

export default api;
