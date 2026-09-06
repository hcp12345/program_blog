import { useEffect, useState } from 'react';
import { tagApi } from '../../services/api';

function TagManagement() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', color: '' });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await tagApi.getList();
      setTags(res.data || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await tagApi.create(formData);
      setFormData({ name: '', slug: '', description: '', color: '' });
      fetchTags();
    } catch (error) {
      console.error('Failed to create tag:', error);
      alert('创建失败');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await tagApi.update(editingId, formData);
      setEditingId(null);
      setFormData({ name: '', slug: '', description: '', color: '' });
      fetchTags();
    } catch (error) {
      console.error('Failed to update tag:', error);
      alert('更新失败');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个标签吗？')) return;

    try {
      await tagApi.delete(id);
      fetchTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      alert('删除失败');
    }
  };

  const startEdit = (tag) => {
    setEditingId(tag.id);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      color: tag.color || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', description: '', color: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">标签管理</h1>

      {/* 创建/编辑表单 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? '编辑标签' : '新建标签'}
        </h2>
        <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标签名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              别名
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              颜色
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#61dafb"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingId ? '更新' : '创建'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 标签列表 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  别名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  颜色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  文章数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td className="px-6 py-4">{tag.name}</td>
                  <td className="px-6 py-4">{tag.slug}</td>
                  <td className="px-6 py-4">
                    {tag.color && (
                      <span
                        className="inline-block w-6 h-6 rounded"
                        style={{ backgroundColor: tag.color }}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">{tag.articleCount || 0}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => startEdit(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
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
      )}
    </div>
  );
}

export default TagManagement;
