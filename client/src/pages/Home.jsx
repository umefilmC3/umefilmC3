import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MessageCircle, Users, BookOpen, TrendingUp, User } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [questionsRes, themesRes] = await Promise.all([
        api.get('/questions'),
        api.get('/themes')
      ]);
      setQuestions(questionsRes.data.slice(0, 5));
      setThemes(themesRes.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-4">eureka へようこそ</h1>
        <p className="text-xl mb-6">共読・共学・共語で、新しい学びの扉を開こう</p>
        <div className="flex flex-wrap gap-4">
          {user ? (
            <>
              <Link
                to="/questions/new"
                className="flex items-center space-x-2 bg-white text-indigo-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                <Plus className="w-5 h-5" />
                <span>質問を投稿</span>
              </Link>
              <Link
                to="/themes"
                className="flex items-center space-x-2 bg-indigo-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-indigo-800 transition"
              >
                <BookOpen className="w-5 h-5" />
                <span>テーマを探す</span>
              </Link>
            </>
          ) : (
            <Link
              to="/register"
              className="bg-white text-indigo-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
            >
              今すぐ参加する
            </Link>
          )}
        </div>
      </div>

      {/* 特徴セクション */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">共読</h3>
          <p className="text-gray-600">
            同じテーマについて、異なる情報源から学んだ知識を持ち寄り、多角的な理解を深めます。
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">共学</h3>
          <p className="text-gray-600">
            年齢や専門性に関係なく、水平な関係で学び合い、お互いに新しい視点を提供し合います。
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">共語</h3>
          <p className="text-gray-600">
            学習プロセスを共有し、発見の喜びや理解の瞬間をコミュニティ全体で分かち合います。
          </p>
        </div>
      </div>

      {/* 人気のテーマ */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>人気のテーマ</span>
          </h2>
          <Link to="/themes" className="text-indigo-600 hover:text-indigo-700">
            すべて見る →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <Link
              key={theme.id}
              to={`/themes/${theme.id}`}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-lg mb-2">{theme.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{theme.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                  {theme.category || '一般'}
                </span>
                <span>{theme.question_count || 0} 質問</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 最新の質問 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-indigo-600" />
            <span>最新の質問</span>
          </h2>
          <Link to="/questions" className="text-indigo-600 hover:text-indigo-700">
            すべて見る →
          </Link>
        </div>
        <div className="space-y-4">
          {questions.map((question) => (
            <Link
              key={question.id}
              to={`/questions/${question.id}`}
              className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-lg mb-2">{question.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{question.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{question.display_name || question.username}</span>
                  </span>
                  {question.theme_title && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {question.theme_title}
                    </span>
                  )}
                </div>
                <span className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{question.answer_count || 0} 回答</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
