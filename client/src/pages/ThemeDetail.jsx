import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, MessageCircle, Users, Plus, Calendar } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function ThemeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [theme, setTheme] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchThemeData();
  }, [id]);

  const fetchThemeData = async () => {
    try {
      setLoading(true);
      const [themeRes, questionsRes] = await Promise.all([
        api.get(`/themes/${id}`),
        api.get(`/questions?theme_id=${id}`)
      ]);
      setTheme(themeRes.data);
      setQuestions(questionsRes.data);
    } catch (error) {
      console.error('Error fetching theme data:', error);
      setError('テーマ情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error || 'テーマが見つかりません'}</p>
          <Link to="/themes" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
            テーマ一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* テーマヘッダー */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 mb-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-8 h-8" />
              <h1 className="text-3xl font-bold">{theme.title}</h1>
            </div>
            <p className="text-lg mb-6 opacity-90">{theme.description}</p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>作成日: {formatDate(theme.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>{questions.length} 件の質問</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{theme.category || '一般'}</span>
              </div>
            </div>
          </div>
          {user && (
            <Link
              to={`/questions/new?theme_id=${id}`}
              className="flex items-center space-x-2 bg-white text-indigo-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
            >
              <Plus className="w-5 h-5" />
              <span>質問を投稿</span>
            </Link>
          )}
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">総質問数</p>
              <p className="text-2xl font-bold text-indigo-600">{questions.length}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-indigo-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">未解決</p>
              <p className="text-2xl font-bold text-orange-600">
                {questions.filter(q => q.status === 'open').length}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-orange-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">解決済み</p>
              <p className="text-2xl font-bold text-green-600">
                {questions.filter(q => q.status === 'resolved').length}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">参加者</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(questions.map(q => q.user_id)).size}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* 質問リスト */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <MessageCircle className="w-6 h-6 text-indigo-600" />
          <span>このテーマの質問</span>
        </h2>

        {questions.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">まだ質問がありません</p>
            {user && (
              <Link
                to={`/questions/new?theme_id=${id}`}
                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-indigo-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span>最初の質問を投稿する</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <Link
                key={question.id}
                to={`/questions/${question.id}`}
                className="block border border-gray-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">
                      {question.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {question.content}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{question.display_name || question.username}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(question.created_at)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{question.answer_count || 0} 回答</span>
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {question.status === 'resolved' ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        解決済み
                      </span>
                    ) : (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                        未解決
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
