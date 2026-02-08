import { useState, useEffect, useRef } from "react";
import { api, Profile } from "../api";
import { Send, ChevronLeft, User as UserIcon } from "lucide-react";

interface Match {
  id: string;
  otherUser: Profile;
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
}

export function Messages() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchMessages(selectedMatch.id);
      
      const unsubscribe = api.onMessage(selectedMatch.id, (message) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => unsubscribe.unsubscribe();
    }
  }, [selectedMatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMatches = async () => {
    try {
      const data = await api.getMatches();
      setMatches(data as any);
    } catch (error) {
      console.error("Failed to fetch matches", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (matchId: string) => {
    try {
      const data = await api.getMessages(matchId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch) return;

    try {
      await api.sendMessage(selectedMatch.id, newMessage);
      setNewMessage("");
      // Message will be added via subscription
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  if (loading) return <div className="flex justify-center p-8 text-gray-400">Loading matches...</div>;

  if (selectedMatch) {
    return (
      <div className="flex flex-col h-screen bg-white fixed inset-0 z-[60] md:relative md:inset-auto md:h-full md:rounded-2xl md:shadow-lg overflow-hidden">
        {/* Chat Header */}
        <header className="flex items-center p-4 border-b border-gray-100 gap-4">
          <button onClick={() => setSelectedMatch(null)} className="md:hidden">
            <ChevronLeft size={24} className="text-gray-500" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {selectedMatch.otherUser.imageUrl ? (
              <img src={selectedMatch.otherUser.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <UserIcon size={20} />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{selectedMatch.otherUser.name}</h3>
            <p className="text-xs text-green-500 font-medium">Online</p>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex ${msg.senderId === selectedMatch.otherUser.userId ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  msg.senderId === selectedMatch.otherUser.userId 
                    ? 'bg-white text-gray-800 shadow-sm border border-gray-100' 
                    : 'bg-pink-500 text-white'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-2 bg-white">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-pink-500 transition-all text-sm"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-pink-500 text-white rounded-full disabled:opacity-50 hover:bg-pink-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 px-2">Matches</h2>
      
      {matches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <p className="text-gray-400">No matches yet. Keep swiping!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((match) => (
            <button
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className="w-full flex items-center gap-4 p-4 hover:bg-white hover:shadow-md transition-all rounded-2xl group border border-transparent hover:border-gray-50"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm flex-shrink-0">
                {match.otherUser.imageUrl ? (
                  <img src={match.otherUser.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <UserIcon size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900 group-hover:text-pink-500 transition-colors">{match.otherUser.name}, {match.otherUser.age}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {match.lastMessage?.content || "Say hello! 👋"}
                </p>
              </div>
              {match.lastMessage && (
                <div className="text-[10px] text-gray-400 uppercase font-semibold">
                  {new Date(match.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
