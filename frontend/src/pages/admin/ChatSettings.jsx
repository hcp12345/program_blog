/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { chatApi } from '../../services/api';

/**
 * 智能客服配置：限流阈值 + 文章发布模式
 */
function ChatSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState({ model: '', apiKeyConfigured: false });
  const [form, setForm] = useState({ rateLimitPerIpPerDay: 50, draftPublishMode: 'manual' });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getSettings();
      setForm({
        rateLimitPerIpPerDay: res.data.rateLimitPerIpPerDay,
        draftPublishMode: res.data.draftPublishMode,
      });
      setInfo({ model: res.data.model, apiKeyConfigured: res.data.apiKeyConfigured });
    } catch (e) {
      setError(e.message || '配置加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      setSaving(true);
      await chatApi.updateSettings(form);
      setMessage('配置已保存，立即生效');
    } catch (err) {
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">加载中…</p>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">智能客服配置</h2>
      <p className="text-sm text-gray-500 mb-6">调整限流与 AI 生成文章的发布策略，保存后立即生效。</p>

      {!info.apiKeyConfigured && (
        <div className="mb-5 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3">
          ⚠️ 尚未检测到模型 API Key。请在服务端设置环境变量 <code className="font-mono">ZHIPU_API_KEY</code> 后重启服务，
          否则访客对话会返回「智能客服尚未配置」。
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            每 IP 每日对话次数上限
          </label>
          <input
            type="number"
            min="0"
            value={form.rateLimitPerIpPerDay}
            onChange={e => setForm({ ...form, rateLimitPerIpPerDay: e.target.value })}
            className="w-40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="mt-2 text-xs text-gray-400">设为 0 表示不限制；管理员对话不计数。</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI 生成文章的发布模式
          </label>
          <div className="space-y-2">
            {[
              { value: 'manual', label: '人工确认（推荐）', desc: 'AI 生成的文章保存为草稿，由你在后台确认后发布' },
              { value: 'auto', label: '自动发布', desc: 'AI 生成的文章直接以已发布状态上线' },
            ].map(opt => (
              <label
                key={opt.value}
                className={`flex items-start space-x-3 border rounded-lg px-4 py-3 cursor-pointer transition ${
                  form.draftPublishMode === opt.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="draftPublishMode"
                  value={opt.value}
                  checked={form.draftPublishMode === opt.value}
                  onChange={e => setForm({ ...form, draftPublishMode: e.target.value })}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-800">{opt.label}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-400 border-t border-gray-100 pt-4">
          当前模型：<span className="font-mono">{info.model || '-'}</span>
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
        >
          {saving ? '保存中…' : '保存配置'}
        </button>
      </form>
    </div>
  );
}

export default ChatSettings;
