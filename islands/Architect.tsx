import { useState } from "preact/hooks";
import { Check, Copy, Server, Terminal, Globe, Loader2 } from "lucide-preact";

// 定义数据结构
type TechStack = {
  id: string;
  name: string;
  desc: string;
  frontend: string;
  backend: string;
  db: string;
  deploy: string;
};

export default function Architect() {
  const [step, setStep] = useState<number>(1);
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 这里将存储 AI 返回的真实方案
  const [options, setOptions] = useState<TechStack[]>([]);
  const [selectedStack, setSelectedStack] = useState<TechStack | null>(null);
  const [finalPrompt, setFinalPrompt] = useState("");

  // 1. 调用后端 API 分析需求
  const handleAnalyze = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setSelectedStack(null); // 重置选择

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({ idea }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "请求失败");
      }

      const data = await res.json();
      
      // 容错处理：确保返回的是 options 数组
      if (data.options && Array.isArray(data.options)) {
        setOptions(data.options);
        setStep(2);
      } else {
        alert("AI 返回格式异常，请重试");
        console.error("数据格式不对:", data);
      }

    } catch (err) {
      alert("分析出错: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. 生成最终 Prompt (纯前端拼接即可，无需再调 AI)
  const handleGenerate = () => {
    if (!selectedStack) return;
    setLoading(true);
    
    const prompt = `
# Role
You are a Senior Tech Lead expert in ${selectedStack.frontend} and ${selectedStack.backend}.

# Project Goal
Build a web application based on this requirement: "${idea}"

# Selected Tech Stack
- Frontend: ${selectedStack.frontend}
- Backend: ${selectedStack.backend}
- Database: ${selectedStack.db}
- Deployment: ${selectedStack.deploy}

# Instructions for Cursor / Windsurf
1. Initialize the project structure strictly following best practices for ${selectedStack.frontend}.
2. Create a '.cursorrules' file to guide the AI editor with coding standards.
3. Generate the database schema for ${selectedStack.db}.
4. Provide a step-by-step implementation guide.
    `.trim();

    // 模拟一点生成等待感
    setTimeout(() => {
      setFinalPrompt(prompt);
      setLoading(false);
      setStep(3);
    }, 600);
  };

  return (
    <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-3xl mx-auto mt-6">
      {/* 步骤指示器 */}
      <div class="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
            {s}
          </div>
        ))}
      </div>

      {/* STEP 1: 输入 */}
      {step === 1 && (
        <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><Globe size={20}/> 你的创意是什么？</h2>
          <textarea 
            class="w-full h-32 p-4 border rounded-xl focus:ring-2 focus:ring-black focus:outline-none resize-none text-lg"
            placeholder="例如：开发一个基于 Deno 的个人博客系统，支持 Markdown..."
            value={idea}
            onInput={(e) => setIdea((e.target as HTMLTextAreaElement).value)}
          />
          <button 
            onClick={handleAnalyze} 
            disabled={loading || !idea} 
            class="w-full mt-4 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 class="animate-spin"/> AI 正在思考 (gemini-3)...</> : "开始规划架构"}
          </button>
        </div>
      )}

      {/* STEP 2: 选择方案 */}
      {step === 2 && (
        <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><Server size={20}/> AI 推荐方案</h2>
          <div class="grid gap-4">
            {options.map((opt) => (
              <div 
                key={opt.id} 
                onClick={() => setSelectedStack(opt)} 
                class={`p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${selectedStack?.id === opt.id ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold text-lg">{opt.name}</h3>
                    {selectedStack?.id === opt.id && <Check class="text-green-600" />}
                </div>
                <p class="text-gray-600 mb-3 text-sm">{opt.desc}</p>
                <div class="flex flex-wrap gap-2 text-xs font-mono text-gray-500">
                    <span class="bg-white border px-2 py-1 rounded">{opt.frontend}</span>
                    <span class="bg-white border px-2 py-1 rounded">{opt.backend}</span>
                    <span class="bg-white border px-2 py-1 rounded">{opt.deploy}</span>
                </div>
              </div>
            ))}
          </div>
          <div class="flex gap-4 mt-6">
             <button onClick={() => setStep(1)} class="px-6 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-lg">上一步</button>
             <button 
                onClick={handleGenerate} 
                disabled={!selectedStack || loading} 
                class="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 flex justify-center"
             >
                {loading ? <Loader2 class="animate-spin"/> : "生成开发指令"}
             </button>
          </div>
        </div>
      )}

      {/* STEP 3: 结果 */}
      {step === 3 && (
        <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><Terminal size={20}/> 开发指令已就绪</h2>
            <div class="bg-[#1e1e1e] text-gray-200 p-5 rounded-xl h-64 overflow-y-auto text-sm font-mono leading-relaxed border border-gray-700 shadow-inner">
                <pre class="whitespace-pre-wrap">{finalPrompt}</pre>
            </div>
            <button 
                onClick={() => {navigator.clipboard.writeText(finalPrompt); alert("已复制到剪贴板！")}} 
                class="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200"
            >
                <Copy size={18}/> 一键复制
            </button>
            <button onClick={() => {setStep(1); setIdea(''); setSelectedStack(null)}} class="w-full text-center text-gray-400 text-sm mt-4 hover:text-black">
                开始新项目
            </button>
        </div>
      )}
    </div>
  );
}
