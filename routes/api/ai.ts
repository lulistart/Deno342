import { FreshContext } from "$fresh/server.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  const headers = { "Content-Type": "application/json" };

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  try {
    const { idea } = await req.json();

    // --- 配置区域 (基于你的截图) ---
    // 1. API 地址：根据截图预览，完整地址是 .../v1/chat/completions
    const API_URL = "https://tz-ai.de5.net/v1/chat/completions";
    // 2. API Key：你截图里的密钥
    const API_KEY = Deno.env.get("API_KEY") || "sk-56X2mu8vL8nK3jR6hA1cF4wE9yT0uI9oB2gD5s67xV1r6";
    // 3. 模型：使用截图里的 gemini-2.5-flash (这个通常比 pro 更快更稳定)
    const MODEL = "gemini-2.5-flash"; 

    console.log(`[Backend] 开始请求: ${API_URL}, 模型: ${MODEL}`);

    // --- 核心逻辑：使用原生 fetch ---
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `你是一个架构师。请以纯 JSON 格式返回 3 个技术栈方案。
            JSON 必须包含 "options" 数组。不要使用 Markdown 格式。
            示例: { "options": [{ "id": "1", "name": "方案名", "desc": "...", "frontend": "...", "backend": "...", "db": "...", "deploy": "..." }] }`
          },
          { role: "user", content: `用户需求: ${idea}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    // --- 错误处理 ---
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Backend] API Error:", response.status, errorText);
      // 把真正的错误原因返回给前端
      return new Response(JSON.stringify({ 
        error: `API 请求被拒绝 (${response.status})`, 
        details: errorText 
      }), { status: 500, headers });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("[Backend] API 响应成功");
    return new Response(content, { status: 200, headers });

  } catch (error) {
    console.error("[Backend] Internal Error:", error);
    return new Response(JSON.stringify({ 
      error: "服务器内部错误", 
      details: error.message 
    }), { status: 500, headers });
  }
};
