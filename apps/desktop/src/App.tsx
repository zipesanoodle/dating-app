import { SwipeCards } from "./components/SwipeCards";

function App() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
          HeartSync
        </h1>
        <p className="text-gray-500 mt-2">Find your perfect match</p>
      </header>
      
      <SwipeCards />
    </main>
  );
}

export default App;
