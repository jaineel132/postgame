export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight">postgame</h1>
      <p className="text-lg opacity-70">
        Spotify Wrapped for a single coding session. Coming soon.
      </p>
      <code className="rounded bg-black/10 px-3 py-1 dark:bg-white/10">npx postgame</code>
    </main>
  );
}
