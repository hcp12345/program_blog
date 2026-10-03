/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { chatApi } from '../../services/api';

/**
 * 客服质检：检索全量对话记录
 */
function ChatQuality() {
  const [keyword, setKeyword] = useState('');
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState('');

  const fetchList = async (kw = keyword) => {
    try {
      setLoading(true);
      setError('');
      const res = await chatApi.adminSessions({ keyword: kw || undefined, pageSize: 20 });
      setList(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    setExpanded(null);
    fetchList(keyword);
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">客服质检</h2>
      <p className="text-sm text-gray-500 mb-6">
        对话记录长期保留，可按关键词检索访客与 AI 的完整对话，用于服务质量检查。
      </p>

      <form onSubmit={handleSearch} className="flex space-x-2 mb-5">
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="搜索会话标题或消息内容…"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          搜索
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">
          {loading ? '加载中…' : `共 ${total} 个会话`}
        </p>
      </div>

      <div className="space-y-3">
        {!loading && list.length === 0 && (
          <p className="text-sm text-gray-400 bg-white rounded-xl border border-gray-100 px-4 py-6 text-center">
            暂无对话记录
          </p>
        )}

        {list.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-left"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{s.title || '新对话'}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(s.updatedAt).toLocaleString('zh-CN')} · IP {s.ip || '-'} ·
                  {s.userId ? ` 用户#${s.userId}` : ' 访客'} · {s.messages.length} 条消息 · {s.toolCalls} 次工具调用
                </p>
              </div>
              <span className="text-gray-400 text-xs ml-3">{expanded === s.id ? '收起' : '展开'}</span>
            </button>

            {expanded === s.id && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-2 bg-gray-50/50">
                {s.messages.map((m, i) => (
                  <div key={i} className="flex">
                    <span
                      className={`shrink-0 w-14 text-[11px] pt-0.5 ${
                        m.role === 'user' ? 'text-primary-600' : 'text-green-600'
                      }`}
                    >
                      {m.role === 'user' ? '访客' : 'AI'}
                    </span>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap break-words flex-1">
                      {m.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatQuality;
