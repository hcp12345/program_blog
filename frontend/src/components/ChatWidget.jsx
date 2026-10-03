import { useState } from 'react';
import ChatPanel from './ChatPanel';

/**
 * 前台右下角智能客服浮窗
 */
function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] max-w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-slide-down">
          <ChatPanel />
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        title={open ? '收起智能客服' : '打开智能客服'}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-glow transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
          </svg>
        )}
      </button>
    </>
  );
}

export default ChatWidget;
