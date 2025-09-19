'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { sendMessage, analyzeDocument } from '../../redux/slices/aiSlice';
import { fetchDocuments } from '../../redux/slices/documentsSlice';

export default function AIAssistant() {
  const dispatch = useAppDispatch();
  const { documents } = useAppSelector(state => state.documents);
  const { messages, loading, error } = useAppSelector(state => state.ai);
  
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis'>('chat');

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    try {
      await dispatch(sendMessage(currentMessage)).unwrap();
      setCurrentMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!analysisQuery.trim() || selectedDocuments.length === 0) return;

    try {
      // For now, just analyze the first selected document
      await dispatch(analyzeDocument(selectedDocuments[0])).unwrap();
      setAnalysisQuery('');
    } catch (error) {
      console.error('Error analyzing document:', error);
    }
  };

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const clearChat = () => {
    // Dispatch action to clear chat when implemented
    console.log('Clear chat not implemented yet');
  };

  if (loading && messages.length === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error with AI Assistant</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Chat
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'analysis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Document Analysis
            </button>
          </nav>
        </div>

        {activeTab === 'chat' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">AI Terms Assistant</h2>
              <button
                onClick={clearChat}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Clear Chat
              </button>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask me anything about your terms and contracts..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !currentMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Analysis</h2>

            {/* Document Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Select Documents to Analyze</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {documents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No documents available for analysis.</p>
                ) : (
                  documents.map((doc) => (
                    <label key={doc._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc._id)}
                        onChange={() => handleDocumentSelect(doc._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{doc.originalName}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Analysis Query */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Query
              </label>
              <textarea
                value={analysisQuery}
                onChange={(e) => setAnalysisQuery(e.target.value)}
                placeholder="What would you like to analyze? e.g., 'Summarize key terms', 'Find potential risks', 'Extract important dates'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <button
              onClick={handleAnalyzeDocument}
              disabled={loading || !analysisQuery.trim() || selectedDocuments.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              Analyze Documents
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setCurrentMessage("Summarize all my active cases")}
            className="p-3 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            📋 Case Summary
          </button>
          <button
            onClick={() => setCurrentMessage("What deadlines are coming up?")}
            className="p-3 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            ⏰ Upcoming Deadlines
          </button>
          <button
            onClick={() => setCurrentMessage("Find contracts expiring soon")}
            className="p-3 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            📄 Contract Review
          </button>
          <button
            onClick={() => setCurrentMessage("What legal research do I need to do?")}
            className="p-3 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            🔍 Research Tasks
          </button>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">AI Insights</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400">💡</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Document Pattern Analysis</h4>
                <p className="text-sm text-blue-700 mt-1">
                  I&apos;ve noticed several contracts with similar termination clauses. Would you like me to analyze them for consistency?
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">Upcoming Renewal Alert</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  3 contracts are set to expire within the next 30 days. Consider scheduling renewal discussions.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-green-400">✅</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">Compliance Check</h4>
                <p className="text-sm text-green-700 mt-1">
                  All recently uploaded documents appear to meet current regulatory requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
