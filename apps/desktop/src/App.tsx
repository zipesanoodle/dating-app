import { useState, useEffect } from "react";
import { SwipeCards } from "./components/SwipeCards";
import { Login } from "./components/Login";
import { Navigation, View } from "./components/Navigation";
import { Messages } from "./components/Messages";
import { Settings } from "./components/Settings";
import { api } from "./api";
import { Sparkles, MessageCircle } from "lucide-react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!api.getToken());
  const [currentView, setCurrentView] = useState<View>('discovery');
  const [showMatchToast, setShowMatchToast] = useState(false);
  const [newMessageToast, setNewMessageToast] = useState<any>(null);

  useEffect(() => {
    if (isLoggedIn) {
      const sub = api.onNewMessageGlobal((message) => {
        // Only show toast if we are not looking at messages or not in that specific chat
        // For simplicity, just show if not in messages view
        if (currentView !== 'messages') {
          setNewMessageToast(message);
          setTimeout(() => setNewMessageToast(null), 5000);
        }
      });
      return () => sub.unsubscribe();
    }
  }, [isLoggedIn, currentView]);

  const handleLogout = () => {
    api.clearToken();
    setIsLoggedIn(false);
  };

  const handleMatch = () => {
    setShowMatchToast(true);
    setTimeout(() => setShowMatchToast(false), 5000);
  };

  const renderView = () => {
    switch (currentView) {
      case 'discovery':
        return <SwipeCards onMatch={handleMatch} />;
      case 'messages':
        return <Messages />;
      case 'settings':
        return <Settings onLogout={handleLogout} />;
      default:
        return <SwipeCards onMatch={handleMatch} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <header className="mb-8 text-center relative w-full max-w-sm">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
            HeartSync
          </h1>
          <p className="text-gray-500 mt-2">Find your perfect match</p>
        </header>
        <Login onLogin={() => setIsLoggedIn(true)} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 md:pl-20 pb-20 md:pb-0">
      <Navigation currentView={currentView} setView={setCurrentView} />
      
      <div className="max-w-4xl mx-auto h-full overflow-y-auto">
        {currentView === 'discovery' && (
          <header className="py-6 text-center">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
              HeartSync
            </h1>
          </header>
        )}
        
        {renderView()}
      </div>

      {/* Match Toast */}
      {showMatchToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-full shadow-2xl border-2 border-pink-200 flex items-center gap-3 z-[100] animate-bounce">
          <div className="bg-pink-100 p-2 rounded-full text-pink-500">
            <Sparkles size={24} />
          </div>
          <div className="font-bold text-gray-900">It's a Match! 🎉</div>
          <button 
            onClick={() => {
              setCurrentView('messages');
              setShowMatchToast(false);
            }}
            className="ml-4 text-sm font-bold text-pink-500 hover:underline"
          >
            Chat Now
          </button>
        </div>
      )}
      {/* Message Toast */}
      {newMessageToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-full shadow-2xl border-2 border-blue-200 flex items-center gap-3 z-[100] animate-in slide-in-from-top-4">
          <div className="bg-blue-100 p-2 rounded-full text-blue-500">
            <MessageCircle size={24} />
          </div>
          <div className="max-w-[200px]">
            <div className="font-bold text-gray-900 text-sm">New Message</div>
            <div className="text-gray-500 text-xs truncate">{newMessageToast.content}</div>
          </div>
          <button 
            onClick={() => {
              setCurrentView('messages');
              setNewMessageToast(null);
            }}
            className="ml-4 text-sm font-bold text-blue-500 hover:underline"
          >
            Reply
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
