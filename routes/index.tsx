import { Head } from "$fresh/runtime.ts";
import Architect from "../islands/Architect.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>AI 架构师助手</title>
        {/* 直接引入 Tailwind CDN，省去配置构建流程 */}
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <div class="min-h-screen bg-gray-50 py-12 px-4">
        <div class="text-center mb-10">
            <h1 class="text-4xl font-extrabold text-gray-900 mb-2">AI 架构师</h1>
            <p class="text-gray-500">从想法到代码，只需一步</p>
        </div>
        <Architect />
      </div>
    </>
  );
}
