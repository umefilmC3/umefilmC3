import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, MessageCircle, Search } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function Themes() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();

  const categories = [
    { value: 'all', label: 'すべて' },
    { value: 'history', label: '歴史' },
    { value: 'science', label: '科学' },
    { value: 'literature', label: '文学' },
    { value: 'philosophy', label: '哲学' },
    { value: 'art', label: '芸術' },
    { value: 'technology', label: '技術' },
    { value: 'culture', label: '文化' },
    { value: 'other', label: 'その他' }
  ];

  useEffect(() => {
    fetchThemes();
  }, [selectedCategory]);

  const fetchThemes = async () => {
    try {
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      const response = await api.get('/themes', { params });
      setThemes(response.data);
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredThemes = themes.filter(theme =>
    theme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (theme.description && theme.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">学習テーマ</h1>
        {user && (
          <Link
            to="/themes/new"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>テーマを作成</span>
          </Link>
        )}
      </div>

      {/* 説明 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">テーマとは？</h2>
        <p className="text-gray-700 mb-3">
          テーマは、共通の興味や学習トピックを持つ人々が集まる場所です。
          同じテーマについて、異なる情報源から学んだ知識を持ち寄り、
          多角的な理解を深めることができます。
        </p>
        <p className="text-gray-600">
          例: 「空海と真言密教」「恐竜の絶滅」「量子力学入門」など
        </p>
      </div>

      {/* 検索とフィルター */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="テーマを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* テーマリスト */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThemes.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-lg shadow-md text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">テーマが見つかりませんでした</p>
            {user && (
              <Link
                to="/themes/new"
                className="inline-block mt-4 text-indigo-600 hover:text-indigo-700"
              >
                新しいテーマを作成する
              </Link>
            )}
          </div>
        ) : (
          filteredThemes.map((theme) => (
            <Link
              key={theme.id}
              to={`/themes/${theme.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg flex-1">{theme.title}</h3>
                  <BookOpen className="w-5 h-5 text-indigo-600 flex-shrink-0 ml-2" />
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {theme.description || 'このテーマについて一緒に学びましょう'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded">
                    {categories.find(c => c.value === theme.category)?.label || '一般'}
                  </span>
                  <div className="flex items-center space-x-1 text-gray-500 text-sm">
                    <MessageCircle className="w-4 h-4" />
                    <span>{theme.question_count || 0} 質問</span>
                  </div>
                </div>

                {theme.creator_name && (
                  <div className="mt-3 text-xs text-gray-500">
                    作成者: {theme.creator_name}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
