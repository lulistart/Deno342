import { useState } from "preact/hooks";
import { Check, ChevronRight, Copy, Server, Terminal, Globe, Database, Cpu, Code2 } from "lucide-preact";

type TechStack = {
  id: string;
  name: string;
  desc: string;
  frontend: string;
  backend: string;
  db: string;
  deploy: string;
};

const MOCK_OPTIONS: TechStack[] = [
  {
    id: "speed",
    name: "极速 MVP 方案",
    desc: "利用 Deno 全球边缘计算，最快速度上线验证想法。",
    frontend: "Fresh (Preact)",
    backend: "Deno Standard Lib",
    db: "Deno KV",
    deploy: "Deno Deploy",
  },
  {
    id: "standard",
    name: "标准全栈方案",
    desc: "适合中大型应用，生态成熟，易于扩展。",
    frontend: "React + Vite",
    backend: "NestJS / Express",
    db: "PostgreSQL",
    deploy: "Docker / Railway",
  },
  {
    id: "serverless",
    name: "轻量 Serverless",
    desc: "低成本，按量付费，适合工具类应用。",
    frontend: "Vue 3",
    backend: "Cloudflare Workers",
    db: "Supabase",
    deploy: "Cloudflare Pages",
  },
];

export default function Architect() {
  const [step, setStep] = useState<number>(1);
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStack, setSelectedStack] = useState<TechStack | null>(null);
  const [finalPrompt, setFinalPrompt] = useState("");

  const handleAnalyze = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    // 这里模拟请求后端
    setTimeout(() => {
        setLoading(false);
        setStep(2);
    }, 1000);
  };

  const handleGenerate = () => {
    if (!selectedStack) return;
    setLoading(true);
    
    // 生成 Prompt 逻辑
    const prompt = `
# Role
You are a Tech Lead expert in ${selectedStack.frontend} and ${selectedStack.backend}.

# Goal
Build a web app based on: "${idea}"

# Tech Stack
- Frontend: ${selectedStack.frontend}
- Backend: ${selectedStack.backend}
- Database: ${selectedStack.db}
- Deploy: ${selectedStack.deploy}

# Instructions
1. Initialize the project structure.
2. Create specific config files for ${selectedStack.deploy}.
3. Write the initial boilerplate code.
    `.trim();

    setTimeout(() => {
      setFinalPrompt(prompt);
      setLoading(false);
      setStep(3);
    }, 800);
  };

  return (
    <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-2xl mx-auto mt-10">
      {/* 步骤条 */}
      <div class="flex gap-2 mb-8 justify-center">
        {[1, 2, 3].map(s => (
            <div key={s} class={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                {s}
            </div>
        ))}
      </div>

      {step === 1 && (
        <div class="space-y-4">
          <h2 class="text-xl font-bold flex items-center gap-2"><Globe size={20}/> 你的创意是什么？</h2>
          <textarea 
            class="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="我想做一个..."
            value={idea}
            onInput={(e) => setIdea((e.target as HTMLTextAreaElement).value)}
          />
          <button onClick={handleAnalyze} disabled={loading || !idea} class="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50">
            {loading ? "分析中..." : "开始规划架构"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div class="space-y-4">
          <h2 class="text-xl font-bold flex items-center gap-2"><Server size={20}/> 选择技术方案</h2>
          <div class="grid gap-3">
            {MOCK_OPTIONS.map(opt => (
                <div key={opt.id} onClick={() => setSelectedStack(opt)} class={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedStack?.id === opt.id ? 'border-black bg-gray-50' : 'border-gray-100'}`}>
                    <div class="flex justify-between font-bold">
                        {opt.name}
                        {selectedStack?.id === opt.id && <Check size={18}/>}
                    </div>
                    <p class="text-sm text-gray-500 mt-1">{opt.desc}</p>
                    <div class="mt-2 flex gap-2 text-xs text-gray-600">
                        <span class="bg-white border px-1 rounded">{opt.frontend}</span>
                        <span class="bg-white border px-1 rounded">{opt.deploy}</span>
                    </div>
                </div>
            ))}
          </div>
          <div class="flex gap-3 mt-4">
             <button onClick={() => setStep(1)} class="px-4 py-2 text-gray-500">上一步</button>
             <button onClick={handleGenerate} disabled={!selectedStack || loading} class="flex-1 bg-black text-white py-3 rounded-lg disabled:opacity-50">
                {loading ? "生成中..." : "生成 Cursor 提示词"}
             </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div class="space-y-4">
            <h2 class="text-xl font-bold flex items-center gap-2"><Terminal size={20}/> 你的开发指令</h2>
            <div class="bg-gray-900 text-gray-100 p-4 rounded-lg h-48 overflow-y-auto text-xs font-mono">
                <pre class="whitespace-pre-wrap">{finalPrompt}</pre>
            </div>
            <button onClick={() => {navigator.clipboard.writeText(finalPrompt); alert("已复制")}} class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2">
                <Copy size={16}/> 复制内容
            </button>
            <button onClick={() => setStep(1)} class="w-full text-center text-gray-400 text-sm mt-2">重置</button>
        </div>
      )}
    </div>
  );
}
