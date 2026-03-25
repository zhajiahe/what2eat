import Dexie, { type EntityTable } from "dexie";
import type {
  Ingredient,
  SavedRecipe,
  EatenRecord,
  Filter,
  AppSettings,
} from "./types";

const db = new Dexie("what2eat") as Dexie & {
  ingredients: EntityTable<Ingredient, "id">;
  recipes: EntityTable<SavedRecipe, "id">;
  eatenRecords: EntityTable<EatenRecord, "id">;
  filters: EntityTable<Filter, "id">;
  settings: EntityTable<AppSettings, "id">;
};

db.version(1).stores({
  ingredients: "++id, name, createdAt",
  recipes: "++id, name, createdAt",
  eatenRecords: "++id, dishName, eatenDate, recordedAt",
  filters: "++id, category, name, createdAt",
  settings: "++id",
});

export { db };

const DEFAULT_FILTERS: { category: string; name: string }[] = [
  { category: "时间", name: "15分钟快手" },
  { category: "时间", name: "30分钟" },
  { category: "时间", name: "慢炖" },
  { category: "口味", name: "清淡" },
  { category: "口味", name: "正常" },
  { category: "口味", name: "微辣" },
  { category: "类型", name: "重海鲜" },
  { category: "类型", name: "有肉" },
  { category: "类型", name: "素菜" },
  { category: "类型", name: "汤品" },
  { category: "心情季节", name: "夏天清爽" },
  { category: "心情季节", name: "冬天暖身" },
  { category: "心情季节", name: "解压" },
];

const DEFAULT_INGREDIENTS: { name: string; remark: string }[] = [
  // 海鲜
  { name: "带鱼", remark: "海鲜" },
  { name: "黄鱼", remark: "海鲜" },
  { name: "鲈鱼", remark: "海鲜" },
  { name: "墨鱼", remark: "海鲜" },
  { name: "虾", remark: "海鲜" },
  { name: "蛏子", remark: "海鲜" },
  { name: "花蛤", remark: "海鲜" },
  { name: "蛤蜊", remark: "海鲜" },
  { name: "螃蟹", remark: "海鲜" },
  { name: "鱿鱼", remark: "海鲜" },
  { name: "海带", remark: "海鲜/干货" },
  { name: "紫菜", remark: "海鲜/干货" },
  // 肉类
  { name: "猪肉", remark: "肉类" },
  { name: "排骨", remark: "肉类" },
  { name: "五花肉", remark: "肉类" },
  { name: "猪蹄", remark: "肉类" },
  { name: "鸡肉", remark: "肉类" },
  { name: "鸡腿", remark: "肉类" },
  { name: "鸡翅", remark: "肉类" },
  { name: "鸭肉", remark: "肉类" },
  { name: "牛肉", remark: "肉类" },
  { name: "牛腩", remark: "肉类" },
  { name: "肉末", remark: "肉类" },
  // 蛋奶豆
  { name: "鸡蛋", remark: "蛋类" },
  { name: "豆腐", remark: "豆制品" },
  { name: "豆腐干", remark: "豆制品" },
  { name: "腐竹", remark: "豆制品" },
  // 蔬菜
  { name: "青菜", remark: "蔬菜" },
  { name: "白菜", remark: "蔬菜" },
  { name: "菠菜", remark: "蔬菜" },
  { name: "空心菜", remark: "蔬菜" },
  { name: "生菜", remark: "蔬菜" },
  { name: "西兰花", remark: "蔬菜" },
  { name: "花菜", remark: "蔬菜" },
  { name: "番茄", remark: "蔬菜" },
  { name: "土豆", remark: "蔬菜" },
  { name: "茄子", remark: "蔬菜" },
  { name: "黄瓜", remark: "蔬菜" },
  { name: "丝瓜", remark: "蔬菜" },
  { name: "冬瓜", remark: "蔬菜" },
  { name: "南瓜", remark: "蔬菜" },
  { name: "萝卜", remark: "蔬菜" },
  { name: "胡萝卜", remark: "蔬菜" },
  { name: "芹菜", remark: "蔬菜" },
  { name: "韭菜", remark: "蔬菜" },
  { name: "四季豆", remark: "蔬菜" },
  { name: "豆芽", remark: "蔬菜" },
  { name: "莴笋", remark: "蔬菜" },
  { name: "藕", remark: "蔬菜" },
  { name: "山药", remark: "蔬菜" },
  { name: "芋头", remark: "蔬菜/主食" },
  { name: "玉米", remark: "蔬菜/主食" },
  { name: "青椒", remark: "蔬菜" },
  { name: "洋葱", remark: "蔬菜" },
  // 菌菇
  { name: "香菇", remark: "菌菇" },
  { name: "金针菇", remark: "菌菇" },
  { name: "木耳", remark: "菌菇" },
  { name: "杏鲍菇", remark: "菌菇" },
  // 干货/其他
  { name: "粉丝", remark: "干货" },
  { name: "年糕", remark: "主食" },
  { name: "面条", remark: "主食" },
  { name: "米粉", remark: "主食" },
];

export async function initDefaultFilters() {
  const count = await db.filters.count();
  if (count === 0) {
    await db.filters.bulkAdd(
      DEFAULT_FILTERS.map((f) => ({ ...f, createdAt: Date.now() }))
    );
  }
}

export async function initDefaultIngredients() {
  const existing = await db.ingredients.toArray();
  const existingNames = new Set(existing.map((i) => i.name));

  // Deduplicate existing entries
  const seen = new Set<string>();
  for (const item of existing) {
    if (seen.has(item.name)) {
      await db.ingredients.delete(item.id!);
    } else {
      seen.add(item.name);
    }
  }

  const toAdd = DEFAULT_INGREDIENTS.filter((i) => !existingNames.has(i.name));
  if (toAdd.length > 0) {
    await db.ingredients.bulkAdd(
      toAdd.map((i) => ({ ...i, createdAt: Date.now() }))
    );
  }
}

const SETTINGS_DEFAULTS: Omit<AppSettings, "id"> = {
  apiUrl: "https://hazhang-octopus.zeabur.app/v1/chat/completions",
  apiKey: "sk-octopus-O8zCNXs1xa7QkgnywHXckcir5ISNDVFjyBDPy3SpecdV844e",
  apiModel: "default",
  tasteTags: [],
};

export async function getSettings(): Promise<AppSettings> {
  const s = await db.settings.toCollection().first();
  if (s) {
    let needsUpdate = false;
    const patched = { ...s };
    for (const [key, val] of Object.entries(SETTINGS_DEFAULTS)) {
      const current = (patched as Record<string, unknown>)[key];
      if (current === undefined || (key === "apiKey" && current === "")) {
        (patched as Record<string, unknown>)[key] = val;
        needsUpdate = true;
      }
    }
    if (needsUpdate) {
      await db.settings.update(s.id!, patched);
    }
    return patched;
  }
  const id = await db.settings.add({ ...SETTINGS_DEFAULTS });
  return { ...SETTINGS_DEFAULTS, id: id as number };
}

export async function updateSettings(
  patch: Partial<Omit<AppSettings, "id">>
) {
  const s = await getSettings();
  await db.settings.update(s.id!, patch);
}

export async function getRecentlyEaten(days = 14) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const records = await db.eatenRecords
    .where("eatenDate")
    .aboveOrEqual(cutoffStr)
    .toArray();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return records.map((r) => {
    const eaten = new Date(r.eatenDate);
    eaten.setHours(0, 0, 0, 0);
    const daysAgo = Math.round(
      (today.getTime() - eaten.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { dishName: r.dishName, daysAgo };
  });
}
