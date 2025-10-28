import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function NewQuestion() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    themeId: '',
    tags: ''
  });
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchThemes();
  }, [user, navigate]);

  const fetchThemes = async () => {
    try {
      const response = await api.get('/themes');
      setThemes(response.data);
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tags = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      const response = await api.post('/questions', {
        title: formData.title,
        content: formData.content,
        themeId: formData.themeId || null,
        tags: JSON.stringify(tags)
      });

      navigate(`/questions/${response.data.id}`);
    } catch (error) {
      console.error('Error creating question:', error);
      setError(error.response?.data?.error || '質問の投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/questions" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>質問一覧に戻る</span>
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">質問を投稿</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              質問タイトル *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例: なぜ空海は高野山を選んだのですか？"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              質問の詳細 *
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows="8"
              value={formData.content}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="質問の背景や、具体的に知りたいことを詳しく書いてください..."
            />
            <p className="mt-1 text-sm text-gray-500">
              具体的に書くことで、より的確な回答が得られやすくなります
            </p>
          </div>

          <div>
            <label htmlFor="themeId" className="block text-sm font-medium text-gray-700 mb-2">
              テーマ（任意）
            </label>
            <select
              id="themeId"
              name="themeId"
              value={formData.themeId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">テーマを選択（任意）</option>
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              関連するテーマがあれば選択してください
            </p>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              タグ（任意）
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="歴史, 仏教, 日本文化（カンマ区切り）"
            />
            <p className="mt-1 text-sm text-gray-500">
              質問に関連するキーワードをカンマ区切りで入力してください
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-900 mb-2">質問のヒント</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>他の人が理解しやすいように、具体的に質問しましょう</li>
              <li>なぜその疑問を持ったのか、背景を共有すると良い回答が得られます</li>
              <li>既に調べたことがあれば、それも書いてみましょう</li>
              <li>複数の視点からの回答を歓迎する姿勢を示しましょう</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? '投稿中...' : '質問を投稿'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
