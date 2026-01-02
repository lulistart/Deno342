import { FreshContext } from "$fresh/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // 1. 设置跨域头 (防止部分浏览器阻挡)
  const headers = { "Content-Type": "application/json" };

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  try {
    const { idea } = await req.json();

    if (!idea) {
        return new Response(JSON.stringify({ error: "请输入需求" }), { status: 400, headers });
    }

    // 2. 配置 OpenAI 客户端 (使用你提供的信息)
    const apiKey = Deno.env.get("API_KEY") || "sk-56X2mu8vL8nK3jR6hA1cF4wE9yT0uI9oB2gD5s67xV1r6";
    const baseURL = Deno.env.get("API_URL") || "https://tz-ai.de5.net/v1"; 

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    console.log(`正在调用 AI... 模型: gemini-3-pro-preview`);

    // 3. 核心 Prompt：强制 AI 输出 JSON 格式
    const systemPrompt = `
    你是一个资深全栈架构师。
    任务：根据用户需求推荐 3 个技术栈方案。
    格式：必须严格返回纯 JSON，不要包含 Markdown 格式（如 \`\`\`json ），直接返回 JSON 对象。
    JSON 结构如下：
    {
      "options": [
        {
          "id": "unique_string",
          "name": "方案名称",
          "desc": "一句话描述",
          "frontend": "前端技术栈",
          "backend": "后端技术栈",
          "db": "数据库",
          "deploy": "部署方案"
        }
      ]
    }
    `;

    // 4. 发起请求
    const completion = await openai.chat.completions.create({
      model: "gemini-3-pro-preview", // 指定你要求的模型
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `用户想做的应用: "${idea}"` },
      ],
      response_format: { type: "json_object" }, // 强制 JSON 模式
    });

    const content = completion.choices[0].message.content;
    console.log("AI 响应成功");

    return new Response(content, { status: 200, headers });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};
