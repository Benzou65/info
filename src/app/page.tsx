import NewsChannel from "./components/NewsChannel";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <h1 className="text-4xl font-bold mb-8">Benzou Info</h1>
      <NewsChannel />
    </main>
  );
}
