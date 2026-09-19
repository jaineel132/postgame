import Link from "next/link";

export default function RecapNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold">No recap here</h1>
      <p className="opacity-70">This link doesn&apos;t match any postgame recap. Check the URL and try again.</p>
      <Link href="/" className="underline">Back to postgame</Link>
    </main>
  );
}
