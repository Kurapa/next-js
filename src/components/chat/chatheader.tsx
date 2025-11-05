import { Tractor, Leaf, Sparkles } from "lucide-react";


// You can place this in src/components/layout/ChatHeader.tsx or directly in your page file.

export function ChatHeader() {
  return (
    <header className="w-full bg-gradient-to-r from-green-800 via-green-600 to-green-400 shadow-2xl rounded-b-3xl px-8 py-7 flex items-center justify-between relative backdrop-blur-md overflow-hidden border-b-4 border-green-900">
      <div className="absolute inset-0 pointer-events-none">
        {/* Sparkling background - subtle */}
        <div className="absolute top-2 left-10 w-24 h-24 opacity-30">
          <Sparkles size={100} className="text-green-300 animate-pulse" />
        </div>
        <div className="absolute bottom-2 right-16 w-20 h-20 opacity-20">
          <Sparkles size={70} className="text-green-200 animate-pulse" />
        </div>
      </div>
      <div className="flex items-center gap-5 z-10">
        <span className="bg-green-900/80 rounded-full p-3 shadow-2xl flex items-center animate-bounce">
          <Tractor size={38} className="text-green-100 drop-shadow-lg" />
        </span>
        <h1 className="ml-1 text-3xl md:text-4xl font-extrabold text-white tracking-wider drop-shadow-2xl flex items-center gap-2">
          <span className="bg-gradient-to-r from-amber-100 via-green-200 to-green-400 bg-clip-text text-transparent">
            Farming Assistant
          </span>
          <Leaf size={30} className="text-green-100 animate-spin-slow ml-1" />
        </h1>
      </div>
      <div className="z-10 flex items-center gap-2">
        <span className="px-4 py-2 rounded-xl bg-green-700/80 text-white font-bold shadow-xl border-2 border-green-400 text-md flex items-center gap-1">
          <Leaf size={20} className="mr-1 text-green-300" />
          For smart farmers
        </span>
      </div>
    </header>
  );
}
