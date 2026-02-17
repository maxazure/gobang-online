function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="glass rounded-2xl p-12 text-center max-w-md w-full mx-4">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          五子棋在线对战
        </h1>
        <p className="text-slate-300 mb-8">
          实时对战 · AI 对战 · 观战模式
        </p>
        <div className="space-y-3">
          <button className="w-full py-3 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
            快速匹配
          </button>
          <button className="w-full py-3 px-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors">
            与 AI 对战
          </button>
          <button className="w-full py-3 px-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors border border-slate-600">
            观战模式
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
