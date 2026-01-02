import { FreshContext } from "$fresh/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  const headers = { "Content-Type": "application/json" };

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  try {
    const { idea } = await req.json();

    // --- 核心配置 (基于你的截图) ---
    // 优先读取环境变量，如果读不到，就使用后面的字符串(你截图里的 Key)
    const apiKey = Deno.env.get("API_KEY") || "sk-56X2mu8vL8nK3jR6hA1cF4wE9yT0uI9oB2gD5s67xV1r6";
    // 你的截图预览显示需要 /v1，所以这里写死 /v1
    const baseURL = Deno.env.get("API_URL") || "https://tz-ai.de5.net/v1/chat/completions";

    const openai = new OpenAI({ apiKey, baseURL });

    console.log(`正在调用 AI: ${baseURL}, Model: gemini-3-pro-preview`);

    const systemPrompt = `
    你是一个资深全栈架构师。
    任务：根据用户需求推荐 3 个技术栈方案。
    格式：必须返回纯 JSON，不要使用 Markdown 代码块。
    JSON 结构示例：
    {
      "options": [
        {
          "id": "1",
          "name": "极速版",
          "desc": "适合快速上线",
          "frontend": "React",
          "backend": "Node",
          "db": "Mongo",
          "deploy": "Vercel"
        }
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gemini-3-pro-preview", // 截图中的模型 ID
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `用户需求: ${idea}` },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    return new Response(content, { status: 200, headers });

  } catch (error) {
    console.error("API Error:", error);
    // 返回详细错误给前端，方便弹窗显示
    return new Response(JSON.stringify({ 
      error: "AI 调用失败", 
      details: error.message 
    }), { status: 500, headers });
  }
};
