import { useState, useEffect } from "react";
import { SwipeCards } from "./components/SwipeCards";
import { Login } from "./components/Login";
import { api } from "./api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!api.getToken());

  const handleLogout = () => {
    api.clearToken();
    setIsLoggedIn(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center relative w-full max-w-sm">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
          HeartSync
        </h1>
        <p className="text-gray-500 mt-2">Find your perfect match</p>
        
        {isLoggedIn && (
          <button 
            onClick={handleLogout}
            className="absolute top-0 right-0 text-xs text-gray-400 hover:text-pink-500"
          >
            Logout
          </button>
        )}
      </header>
      
      {isLoggedIn ? (
        <SwipeCards />
      ) : (
        <Login onLogin={() => setIsLoggedIn(true)} />
      )}
    </main>
  );
}

export default App;
