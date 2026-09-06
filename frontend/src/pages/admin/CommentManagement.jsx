import { useEffect, useState } from 'react';
import { commentApi } from '../../services/api';

function CommentManagement() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchComments();
  }, [page]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await commentApi.getList({ page, pageSize });
      setComments(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await commentApi.update(id, { status });
      fetchComments();
    } catch (error) {
      console.error('Failed to update comment:', error);
      alert('更新失败');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      await commentApi.delete(id);
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('删除失败');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">评论管理</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    评论者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    内容
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    文章
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comments.map((comment) => (
                  <tr key={comment.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={comment.authorAvatar || '/default-avatar.png'}
                          alt={comment.authorName}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <div>
                          <div className="font-medium">{comment.authorName}</div>
                          <div className="text-sm text-gray-500">{comment.authorEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {comment.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {comment.article?.title || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={comment.status}
                        onChange={(e) => handleStatusChange(comment.id, e.target.value)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          comment.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : comment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="pending">待审核</option>
                        <option value="approved">已批准</option>
                        <option value="rejected">已拒绝</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                上一页
              </button>
              <span className="text-gray-600">第 {page} / {totalPages} 页</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CommentManagement;
