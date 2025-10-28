import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MessageCircle, CheckCircle, BookOpen, Award, Calendar } from 'lucide-react';
import api from '../utils/api';

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // ユーザー情報取得
      const userRes = await api.get(`/users/${id}`);
      setUser(userRes.data);

      // ユーザーの質問取得
      const questionsRes = await api.get(`/questions?user_id=${id}`);
      setQuestions(questionsRes.data);

      // 統計情報を計算
      const resolvedQuestions = questionsRes.data.filter(q => q.status === 'resolved').length;
      const totalAnswers = questionsRes.data.reduce((sum, q) => sum + (q.answer_count || 0), 0);
      
      setStats({
        totalQuestions: questionsRes.data.length,
        resolvedQuestions,
        totalAnswers,
        points: resolvedQuestions * 10 + totalAnswers * 5
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
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

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">ユーザーが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* プロフィールヘッダー */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 mb-8 text-white">
        <div className="flex items-start space-x-6">
          <div className="bg-white rounded-full p-4">
            <User className="w-16 h-16 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.display_name || user.username}</h1>
            <p className="text-lg opacity-90 mb-4">@{user.username}</p>
            {user.bio && (
              <p className="text-base opacity-90 mb-4">{user.bio}</p>
            )}
            <div className="flex items-center space-x-6 text-sm">
              {user.age_group && (
                <div className="flex items-center space-x-2">
                  <span>年齢層: {user.age_group}</span>
                </div>
              )}
              {user.user_type && (
                <div className="flex items-center space-x-2">
                  <span>タイプ: {user.user_type}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>参加日: {formatDate(user.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">質問数</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalQuestions}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-indigo-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">解決済み</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolvedQuestions}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">獲得回答</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalAnswers}</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">ポイント</p>
              <p className="text-2xl font-bold text-orange-600">{stats.points}</p>
            </div>
            <Award className="w-8 h-8 text-orange-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              質問 ({stats.totalQuestions})
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'answers'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              回答 (0)
            </button>
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="p-6">
          {activeTab === 'questions' && (
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">まだ質問がありません</p>
                </div>
              ) : (
                questions.map((question) => (
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
                          {question.theme_title && (
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {question.theme_title}
                            </span>
                          )}
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
                ))
              )}
            </div>
          )}

          {activeTab === 'answers' && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">回答機能は現在開発中です</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
