import { FreshContext } from "$fresh/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // 1. 获取环境变量 (稍后在 Deno Deploy 后台设置)
  const apiKey = Deno.env.get("API_KEY");
  const baseURL = Deno.env.get("API_URL");

  if (!apiKey || !baseURL) {
    return new Response(JSON.stringify({ error: "API 配置缺失，请检查环境变量" }), { status: 500 });
  }

  // 2. 仅允许 POST 请求
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { idea } = await req.json();

    // 3. 初始化 OpenAI 客户端 (适配你的截图配置)
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL, // 这里会用到你截图里的地址
    });

    // 4. 定义系统提示词 (让 AI 返回 JSON)
    const systemPrompt = `
    你是一个资深全栈架构师。请根据用户的需求，分析并推荐3个技术栈方案。
    必须严格返回纯 JSON 格式，不要包含 Markdown 代码块标记（如 \`\`\`json），结构如下：
    {
      "options": [
        {
          "id": "方案ID",
          "name": "方案名称",
          "desc": "方案简述",
          "frontend": "前端技术",
          "backend": "后端技术",
          "db": "数据库",
          "deploy": "部署方式"
        }
      ]
    }
    `;

    // 5. 调用 API (根据截图，我们选一个聪明点的模型，比如 sonnet 或 flash)
    const completion = await openai.chat.completions.create({
      model: "gemini-claude-sonnet-4-5", // 你的截图中支持这个模型，适合做架构分析
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `用户需求: ${idea}` },
      ],
      response_format: { type: "json_object" }, // 强制 JSON
    });

    const content = completion.choices[0].message.content;
    
    return new Response(content, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "AI 调用失败", details: error.message }), { status: 500 });
  }
};
