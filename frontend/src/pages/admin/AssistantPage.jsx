import ChatPanel from '../../components/ChatPanel';

/**
 * 后台 AI 助手（已识别管理员身份，可使用管理类工具）
 */
function AssistantPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">AI 助手</h2>
        <p className="text-sm text-gray-500 mt-1">
          以管理员身份对话，可直接查询站点统计、生成文章（按配置存草稿或直接发布）、调整文章状态。
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[620px] flex flex-col">
        <ChatPanel
          welcome="你好，管理员 👋 试试这样问我："
        />
      </div>

      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <p>· 涉及写操作时，助手会先复述内容并等你确认，确认后才会执行。</p>
        <p>· 发布模式（草稿 / 直接发布）可在「智能客服配置」中调整。</p>
      </div>
    </div>
  );
}

export default AssistantPage;
