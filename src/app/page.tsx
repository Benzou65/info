import NewsChannel from "./components/NewsChannel";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <header className="flex justify-between items-center w-full">
        <h1 className="text-4xl font-bold mb-8">Benzou Info</h1>
      </header>
      <NewsChannel />
    </main>
  );
}
