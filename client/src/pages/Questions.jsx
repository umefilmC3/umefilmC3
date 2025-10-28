import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, User, Plus, Search } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchQuestions();
  }, [filterStatus]);

  const fetchQuestions = async () => {
    try {
      const params = {};
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const response = await api.get('/questions', { params });
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.content.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold">質問一覧</h1>
        {user && (
          <Link
            to="/questions/new"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>質問を投稿</span>
          </Link>
        )}
      </div>

      {/* 検索とフィルター */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="質問を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">すべて</option>
            <option value="open">未解決</option>
            <option value="answered">解決済み</option>
          </select>
        </div>
      </div>

      {/* 質問リスト */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">質問が見つかりませんでした</p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <Link
              key={question.id}
              to={`/questions/${question.id}`}
              className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {question.status === 'answered' && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        解決済み
                      </span>
                    )}
                    {question.theme_title && (
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                        {question.theme_title}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{question.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{question.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{question.display_name || question.username}</span>
                    </span>
                    <span>
                      {new Date(question.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
                <div className="ml-6 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4 min-w-[80px]">
                  <MessageCircle className="w-6 h-6 text-indigo-600 mb-1" />
                  <span className="text-lg font-semibold">{question.answer_count || 0}</span>
                  <span className="text-xs text-gray-500">回答</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
