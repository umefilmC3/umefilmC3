import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MessageCircle, ThumbsUp, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from '../components/CommentSection';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [sourceInfo, setSourceInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await api.get(`/questions/${id}`);
      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/answers', {
        questionId: id,
        content: newAnswer,
        sourceInfo: sourceInfo || null
      });
      setNewAnswer('');
      setSourceInfo('');
      fetchQuestion(); // 質問を再取得して回答リストを更新
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('回答の投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAnswer = async (answerId) => {
    try {
      await api.post(`/answers/${answerId}/select`);
      fetchQuestion();
    } catch (error) {
      console.error('Error selecting answer:', error);
      alert('回答の選択に失敗しました');
    }
  };

  const handleUpvote = async (answerId) => {
    try {
      await api.post(`/answers/${answerId}/upvote`);
      fetchQuestion();
    } catch (error) {
      console.error('Error upvoting answer:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <p className="text-gray-500 text-lg">質問が見つかりませんでした</p>
        </div>
      </div>
    );
  }

  const isQuestionOwner = user && user.id === question.user_id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/questions" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>質問一覧に戻る</span>
      </Link>

      {/* 質問 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          {question.status === 'answered' && (
            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>解決済み</span>
            </span>
          )}
          {question.theme_title && (
            <Link
              to={`/themes/${question.theme_id}`}
              className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full hover:bg-indigo-200"
            >
              {question.theme_title}
            </Link>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
        
        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{question.content}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-400" />
            <span className="font-medium">{question.display_name || question.username}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              {new Date(question.created_at).toLocaleString('ja-JP')}
            </span>
          </div>
        </div>
      </div>

      {/* 回答セクション */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
          <MessageCircle className="w-6 h-6 text-indigo-600" />
          <span>{question.answers?.length || 0} 件の回答</span>
        </h2>

        <div className="space-y-4">
          {question.answers?.map((answer) => (
            <div
              key={answer.id}
              className={`bg-white rounded-lg shadow-md p-6 ${
                answer.is_selected ? 'border-2 border-green-500' : ''
              }`}
            >
              {answer.is_selected && (
                <div className="flex items-center space-x-2 text-green-600 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">選ばれた回答</span>
                </div>
              )}

              <div className="prose max-w-none mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{answer.content}</p>
              </div>

              {answer.source_info && (
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>情報源:</strong> {answer.source_info}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{answer.display_name || answer.username}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">
                    {new Date(answer.created_at).toLocaleString('ja-JP')}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleUpvote(answer.id)}
                    disabled={!user}
                    className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 disabled:opacity-50"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span>{answer.upvotes || 0}</span>
                  </button>

                  {isQuestionOwner && !answer.is_selected && question.status !== 'answered' && (
                    <button
                      onClick={() => handleSelectAnswer(answer.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                    >
                      この回答を選択
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* コメント・ディスカッションセクション */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <CommentSection parentType="question" parentId={id} />
      </div>

      {/* 回答フォーム */}
      {user ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">回答を投稿</h3>
          <form onSubmit={handleSubmitAnswer}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                回答内容 *
              </label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows="6"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="あなたの知識や経験を共有してください..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                情報源（任意）
              </label>
              <input
                type="text"
                value={sourceInfo}
                onChange={(e) => setSourceInfo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="書籍名、記事URL、動画など"
              />
              <p className="mt-1 text-sm text-gray-500">
                この情報をどこで学んだかを共有することで、他の学習者の参考になります
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting ? '投稿中...' : '回答を投稿'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">回答するにはログインが必要です</p>
          <Link
            to="/login"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            ログイン
          </Link>
        </div>
      )}
    </div>
  );
}
