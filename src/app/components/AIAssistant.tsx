'use client';

import { useState, useEffect } from 'react';

interface Document {
  id: string;
  filename: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AnalysisResult {
  query: string;
  summary: string;
  documents: { id: string; filename: string; relevance: number }[];
  keyPoints: string[];
}

export default function AIAssistant() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis'>('chat');

  useEffect(() => {
    fetchDocuments();
    // Add welcome message
    setChatMessages([{
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI legal assistant. I can help you analyze documents, answer questions about your cases, and provide insights based on your document collection. How can I assist you today?',
      timestamp: new Date()
    }]);
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          context: selectedDocuments
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      // Add suggestions as separate messages if provided
      if (data.suggestions && data.suggestions.length > 0) {
        const suggestionsMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: `Here are some suggestions:\n${data.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, suggestionsMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the backend server is running and try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeDocuments = async () => {
    if (selectedDocuments.length === 0 || !analysisQuery.trim()) {
      alert('Please select documents and enter an analysis query.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds: selectedDocuments,
          query: analysisQuery
        }),
      });

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error('Error analyzing documents:', error);
      alert('Analysis failed. Please make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Legal Assistant</h2>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === 'chat'
                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🤖 Chat Assistant
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === 'analysis'
                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 Document Analysis
          </button>
        </div>

        {/* Document Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Select Documents for Context</h3>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
            {documents.length === 0 ? (
              <p className="text-gray-500 text-sm">No documents available. Upload documents first.</p>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <label key={doc.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => toggleDocumentSelection(doc.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{doc.filename}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {selectedDocuments.length > 0 && (
            <p className="text-sm text-blue-600 mt-2">
              {selectedDocuments.length} document(s) selected for context
            </p>
          )}
        </div>

        {activeTab === 'chat' ? (
          /* Chat Interface */
          <div className="space-y-4">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
              {chatMessages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a question about your documents or legal matters..."
                rows={2}
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !currentMessage.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          /* Document Analysis Interface */
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Query
              </label>
              <textarea
                value={analysisQuery}
                onChange={(e) => setAnalysisQuery(e.target.value)}
                placeholder="What would you like to analyze? (e.g., 'Summarize key legal points', 'Find deadlines and important dates', 'Extract client obligations')"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleAnalyzeDocuments}
              disabled={isLoading || selectedDocuments.length === 0 || !analysisQuery.trim()}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Documents'}
            </button>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h4>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Query:</h5>
                    <p className="text-gray-700 italic">{analysisResult.query}</p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Summary:</h5>
                    <p className="text-gray-700">{analysisResult.summary}</p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Key Points:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {analysisResult.keyPoints.map((point, index) => (
                        <li key={index} className="text-gray-700">{point}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Analyzed Documents:</h5>
                    <div className="space-y-2">
                      {analysisResult.documents.map(doc => (
                        <div key={doc.id} className="flex justify-between items-center bg-white p-2 rounded border">
                          <span className="text-gray-700">{doc.filename}</span>
                          <span className="text-sm text-blue-600">
                            {Math.round(doc.relevance)}% relevance
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
