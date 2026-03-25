import type { GenerateRequest } from "./types";

const SYSTEM_PROMPT = `你是一个专属的温州家常菜AI助手，名叫"What2eat"。你的任务是根据用户勾选的食材，生成约5道家常菜建议。

核心规则（必须严格遵守）：
- 主要以温州菜风格为主：清鲜、轻油轻芡、重刀工、海鲜优先。经典例子包括三丝敲鱼、鱼丸汤、爆墨鱼花、盘菜烧带鱼、葱油黄鱼、鱼饼、江蟹生等。
- 可以偶尔生成其他菜式，但必须温州化（口味清淡、做法轻油、融入温州常见手法）。
- 家里常备调料（盐、油、酱油、姜、葱、料酒等）默认都有，绝不要在材料或步骤中重复列出或提示。只有需要特殊调料时才提及。
- 从用户本次勾选的食材中选择合适的来搭配，不需要全部用完，灵活选用即可。
- 每道菜自动搭配合适主食（不局限于米饭，可建议馒头、面条、粥、麦面、芋头饭等），让用户感觉是一餐完整搭配。
- 营养要全面均衡：在每道菜后简单提示（如"蛋白充足、蔬果均衡、清淡养胃"）。
- 避免重复：用户会提供"最近已吃"列表（带时效性，如今天吃过、3天前吃过），请尽量不要生成类似菜名或做法，尤其避免连续两天相同。

你必须严格按以下JSON数组格式输出，不要输出其他内容：
[
  {
    "name": "菜名",
    "ingredients": ["食材1", "食材2"],
    "steps": ["步骤1", "步骤2", "步骤3"],
    "estimatedTime": "预计时间",
    "mainFood": "主食建议",
    "nutrition": "营养小提示"
  }
]`;

export function buildMessages(req: GenerateRequest) {
  const parts: string[] = [];

  if (req.isRandom) {
    parts.push("请从以下食材库中自由选择搭配，生成5道建议：");
    parts.push(`食材库：${req.allIngredients.join("、")}`);
  } else {
    parts.push(`本次勾选的食材：${req.selectedIngredients.join("、")}`);
  }

  if (req.activeFilters.length > 0) {
    parts.push(`过滤条件：${req.activeFilters.join("、")}`);
  }

  if (req.tasteTags.length > 0) {
    parts.push(`口味偏好：${req.tasteTags.join("、")}`);
  }

  if (req.recentlyEaten.length > 0) {
    const eatenList = req.recentlyEaten
      .map((e) => `${e.dishName}（${e.daysAgo === 0 ? "今天" : e.daysAgo + "天前"}吃过）`)
      .join("、");
    parts.push(`最近已吃：${eatenList}`);
  }

  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: parts.join("\n") },
  ];
}
