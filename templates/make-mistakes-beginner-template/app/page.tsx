export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full text-center space-y-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-white">
          BuildOS Workspace
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Your workspace is initialized. Ask Nova AI to synthesize components, create pages, or build your application features.
        </p>
      </div>
    </main>
  );
}
