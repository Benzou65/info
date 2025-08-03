import NewsChannel from "./components/NewsChannel";

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Title overlay - top of screen */}
      <header className="absolute top-0 left-0 right-0 z-20 p-6">
        <h1 className="text-4xl font-bold text-white text-center bg-black bg-opacity-30 px-6 py-3 rounded-lg backdrop-blur-sm">
          Benzou Info
        </h1>
      </header>

      {/* News Channel component */}
      <NewsChannel />
    </main>
  );
}
