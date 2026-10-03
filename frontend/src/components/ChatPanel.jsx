/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatApi, streamChat } from '../services/api';

// 工具名 → 友好提示
const TOOL_LABELS = {
  searchArticles: '正在搜索文章…',
  getArticle: '正在阅读文章内容…',
  listCategories: '正在查询分类…',
  listTags: '正在查询标签…',
  getHotArticles: '正在获取热门文章…',
  getSiteStats: '正在统计站点数据…',
  createArticle: '正在创建文章…',
  updateArticleStatus: '正在更新文章状态…',
  listPendingComments: '正在查询待审核评论…',
};

/**
 * 智能客服对话面板（前台浮窗与后台助手页共用）
 * @param {object} props { heightClass?: string, welcome?: string }
 */
function ChatPanel({ heightClass = 'min-h-[260px]', welcome }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [toolHint, setToolHint] = useState('');
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const listRef = useRef(null);

  const scrollToBottom = () => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  useEffect(scrollToBottom, [messages, toolHint]);

  const loadSessions = async () => {
    try {
      const res = await chatApi.getSessions();
      setSessions(res.data || []);
    } catch {
      /* 未登录的访客也可用，忽略 */
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setError('');
    setInput('');
    setMessages(prev => [ ...prev, { role: 'user', content: text }, { role: 'assistant', content: '' } ]);
    setStreaming(true);
    setToolHint('');

    await streamChat({
      message: text,
      sessionId,
      onStart: payload => {
        if (payload.sessionId) setSessionId(payload.sessionId);
      },
      onDelta: delta => {
        setToolHint('');
        setMessages(prev => {
          const next = [ ...prev ];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: (last.content || '') + delta };
          return next;
        });
      },
      onTool: payload => {
        setToolHint(TOOL_LABELS[payload.name] || `正在调用 ${payload.name}…`);
      },
      onDone: () => {
        setStreaming(false);
        setToolHint('');
        loadSessions();
      },
      onError: payload => {
        setStreaming(false);
        setToolHint('');
        setError(payload.message || '抱歉，服务暂时不可用');
        setMessages(prev => {
          const next = [ ...prev ];
          if (next.length && next[next.length - 1].role === 'assistant' && !next[next.length - 1].content) {
            next.pop();
          }
          return next;
        });
      },
    });
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openSession = async id => {
    try {
      const res = await chatApi.getMessages(id);
      setMessages((res.data.list || []).map(m => ({ role: m.role, content: m.content })));
      setSessionId(id);
      setShowHistory(false);
      setError('');
    } catch {
      setError('会话加载失败');
    }
  };

  const newSession = () => {
    setSessionId(null);
    setMessages([]);
    setError('');
    setShowHistory(false);
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    if (!confirm('确定删除这条会话记录吗？')) return;
    try {
      await chatApi.deleteSession(id);
      if (id === sessionId) newSession();
      loadSessions();
    } catch {
      setError('删除失败');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            AI
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">博客智能助手</p>
            <p className="text-xs text-gray-400">帮你找文章、答疑问</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => { setShowHistory(!showHistory); loadSessions(); }}
            title="历史会话"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={newSession}
            title="新对话"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 历史会话 */}
      {showHistory && (
        <div className="max-h-40 overflow-auto border-b border-gray-100 bg-gray-50">
          {sessions.length === 0 && (
            <p className="px-4 py-3 text-xs text-gray-400">暂无历史会话</p>
          )}
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => openSession(s.id)}
              className={`group flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-white ${s.id === sessionId ? 'bg-white' : ''}`}
            >
              <div className="min-w-0">
                <p className="text-xs text-gray-700 truncate">{s.title || '新对话'}</p>
                <p className="text-[11px] text-gray-400 truncate">{s.messageCount} 条消息</p>
              </div>
              <button
                onClick={e => deleteSession(e, s.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs px-1"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 消息区 */}
      <div ref={listRef} className={`flex-1 overflow-auto px-4 py-3 space-y-3 ${heightClass}`}>
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-3">
              {welcome || '你好呀 👋 我可以帮你找文章、介绍分类标签，试试问我：'}
            </p>
            <div className="space-y-2">
              {[ '这个博客都写了哪些内容？', '有没有关于 React 的文章？', '最近哪些文章最热门？' ].map(t => (
                <button
                  key={t}
                  onClick={() => setInput(t)}
                  className="block w-full text-left text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg px-3 py-2 transition"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {m.role === 'user' ? (
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
              ) : m.content ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:my-1 prose-a:text-primary-600">
                  <ReactMarkdown
                    remarkPlugins={[ remarkGfm ]}
                    components={{
                      a: props => <a {...props} target="_blank" rel="noreferrer" />,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <span className="inline-flex items-center text-gray-400 text-xs">
                  {toolHint || '思考中…'}
                </span>
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="问我关于这个博客的任何问题…"
            className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-24"
          />
          <button
            onClick={handleSend}
            disabled={streaming || !input.trim()}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:shadow-glow transition"
          >
            {streaming ? '…' : '发送'}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-gray-400 text-center">
          回答由 AI 生成，仅供参考 · Enter 发送 / Shift+Enter 换行
        </p>
      </div>
    </div>
  );
}

export default ChatPanel;
