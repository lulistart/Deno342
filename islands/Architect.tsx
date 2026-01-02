import { useState } from "preact/hooks";
// 修改点：直接使用完整 URL，防止 deno.json 配置失效导致的“按钮点击无反应”
import { Check, Copy, Server, Terminal, Globe, Loader2 } from "https://esm.sh/lucide-preact@0.300.0";

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
  const [options, setOptions] = useState<TechStack[]>([]);
  const [selectedStack, setSelectedStack] = useState<TechStack | null>(null);
  const [finalPrompt, setFinalPrompt] = useState("");

  const handleAnalyze = async () => {
    if (!idea.trim()) {
        alert("请先输入你的创意！");
        return;
    }
    
    setLoading(true);
    // 立即清除之前的选择，防止混淆
    setSelectedStack(null); 
    setOptions([]);

    try {
      console.log("正在请求后端..."); // 方便你在 F12 控制台查看
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `请求失败 (${res.status})`);
      }

      // 容错处理：有时 AI 会把 options 包在 json 根目录下，有时直接返回数组
      // 这里做个自动判断
      let resultOptions = [];
      if (Array.isArray(data.options)) {
        resultOptions = data.options;
      } else if (data.result && Array.isArray(data.result.options)) {
        resultOptions = data.result.options;
      } else if (typeof data === 'object' && data !== null) {
         // 尝试寻找任何看起来像数组的字段
         const possibleKey = Object.keys(data).find(k => Array.isArray(data[k]));
         if (possibleKey) resultOptions = data[possibleKey];
      }

      if (resultOptions.length > 0) {
        setOptions(resultOptions);
        setStep(2);
      } else {
        console.error("AI 返回数据格式异常:", data);
        alert("AI 返回的数据格式不对，请重试一下。\n(已在控制台打印详细信息)");
      }

    } catch (err) {
      console.error(err);
      alert("分析出错了: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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

# Instructions
1. Initialize the project structure strictly following best practices.
2. Create a '.cursorrules' file.
3. Generate the database schema for ${selectedStack.db}.
4. Provide a step-by-step implementation guide.
    `.trim();

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

      {/* STEP 1 */}
      {step === 1 && (
        <div class="animate-in fade-in">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><Globe size={20}/> 你的创意是什么？</h2>
          <textarea 
            class="w-full h-32 p-4 border rounded-xl focus:ring-2 focus:ring-black focus:outline-none resize-none text-lg"
            placeholder="例如：开发一个基于 Deno 的个人博客系统..."
            value={idea}
            onInput={(e) => setIdea((e.target as HTMLTextAreaElement).value)}
          />
          <button 
            onClick={handleAnalyze} 
            disabled={loading} 
            class="w-full mt-4 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 class="animate-spin"/> AI 正在思考...</> : "开始规划架构"}
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div class="animate-in fade-in">
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

      {/* STEP 3 */}
      {step === 3 && (
        <div class="animate-in fade-in">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><Terminal size={20}/> 开发指令已就绪</h2>
            <div class="bg-[#1e1e1e] text-gray-200 p-5 rounded-xl h-64 overflow-y-auto text-sm font-mono leading-relaxed border border-gray-700 shadow-inner">
                <pre class="whitespace-pre-wrap">{finalPrompt}</pre>
            </div>
            <button 
                onClick={() => {navigator.clipboard.writeText(finalPrompt); alert("已复制！")}} 
                class="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
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
