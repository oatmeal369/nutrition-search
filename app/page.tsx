"use client";

import { useState } from "react";
import {
  Search,
  Database,
  Flame,
  Beef,
  Droplets,
  Wheat,
  AlertCircle,
  Candy,
  HeartPulse,
  CircleDot,
  Leaf,
  Pill,
  Scale,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Food = Record<string, number | string | null | undefined>;

type Nutrient = {
  key: string;
  label: string;
  unit?: string;
};

const labelNutrients: Nutrient[] = [
  { key: "SERVING_SIZE", label: "영양성분 기준량" },
  { key: "AMT_NUM1", label: "에너지", unit: "kcal" },
  { key: "AMT_NUM6", label: "탄수화물", unit: "g" },
  { key: "AMT_NUM7", label: "당류", unit: "g" },
  { key: "AMT_NUM8", label: "식이섬유", unit: "g" },
  { key: "AMT_NUM3", label: "단백질", unit: "g" },
  { key: "AMT_NUM4", label: "지방", unit: "g" },
  { key: "AMT_NUM24", label: "포화지방산", unit: "g" },
  { key: "AMT_NUM25", label: "트랜스지방산", unit: "g" },
  { key: "AMT_NUM23", label: "콜레스테롤", unit: "mg" },
  { key: "AMT_NUM13", label: "나트륨", unit: "mg" },
];

const mineralNutrients: Nutrient[] = [
  { key: "AMT_NUM9", label: "칼슘", unit: "mg" },
  { key: "AMT_NUM10", label: "철", unit: "mg" },
  { key: "AMT_NUM11", label: "인", unit: "mg" },
  { key: "AMT_NUM12", label: "칼륨", unit: "mg" },
  { key: "AMT_NUM111", label: "마그네슘", unit: "mg" },
  { key: "AMT_NUM116", label: "아연", unit: "mg" },
  { key: "AMT_NUM109", label: "구리", unit: "mg" },
  { key: "AMT_NUM112", label: "망간", unit: "mg" },
  { key: "AMT_NUM113", label: "몰리브덴", unit: "μg" },
  { key: "AMT_NUM115", label: "셀레늄", unit: "μg" },
  { key: "AMT_NUM118", label: "요오드", unit: "μg" },
  { key: "AMT_NUM119", label: "크롬", unit: "μg" },
];

const vitaminNutrients: Nutrient[] = [
  { key: "AMT_NUM14", label: "비타민 A", unit: "μg RAE" },
  { key: "AMT_NUM18", label: "비타민 B1", unit: "mg" },
  { key: "AMT_NUM19", label: "비타민 B2", unit: "mg" },
  { key: "AMT_NUM20", label: "니아신", unit: "mg" },
  { key: "AMT_NUM29", label: "비타민 B6", unit: "mg" },
  { key: "AMT_NUM30", label: "비타민 B12", unit: "μg" },
  { key: "AMT_NUM31", label: "엽산", unit: "μg DFE" },
  { key: "AMT_NUM33", label: "판토텐산", unit: "mg" },
  { key: "AMT_NUM28", label: "비오틴", unit: "μg" },
  { key: "AMT_NUM21", label: "비타민 C", unit: "mg" },
  { key: "AMT_NUM22", label: "비타민 D", unit: "μg" },
  { key: "AMT_NUM36", label: "비타민 E", unit: "mg α-TE" },
  { key: "AMT_NUM48", label: "비타민 K", unit: "μg" },
];

const fatDetailNutrients: Nutrient[] = [
  { key: "AMT_NUM61", label: "총 불포화지방산", unit: "g" },
  { key: "AMT_NUM91", label: "오메가3 지방산", unit: "g" },
  { key: "AMT_NUM92", label: "오메가6 지방산", unit: "g" },
  { key: "AMT_NUM151", label: "총 필수지방산", unit: "g" },
  { key: "AMT_NUM152", label: "총 단일불포화지방산", unit: "g" },
  { key: "AMT_NUM153", label: "총 다중불포화지방산", unit: "g" },
  { key: "AMT_NUM154", label: "총 지방산", unit: "g" },
  { key: "AMT_NUM156", label: "식염상당량", unit: "g" },
];

const selectColumns = [
  "id",
  "NUM",
  "FOOD_CD",
  "FOOD_NM_KR",
  "DB_GRP_NM",
  "DB_CLASS_NM",
  "FOOD_OR_NM",
  "FOOD_CAT1_NM",
  "FOOD_CAT2_NM",
  "FOOD_CAT3_NM",
  "FOOD_REF_NM",
  "SERVING_SIZE",
  ...labelNutrients.map((n) => n.key),
  ...mineralNutrients.map((n) => n.key),
  ...vitaminNutrients.map((n) => n.key),
  ...fatDetailNutrients.map((n) => n.key),
];

function displayValue(food: Food | null, key: string, unit?: string) {
  if (!food) return "-";
  const v = food[key];
  if (v === null || v === undefined || v === "") return "-";
  if (key === "SERVING_SIZE") return String(v);
  return `${v}${unit ? ` ${unit}` : ""}`;
}

function pick(food: Food | null, key: string) {
  const v = food?.[key];
  if (v === null || v === undefined || v === "") return "-";
  return String(v);
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [selected, setSelected] = useState<Food | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("식품명을 입력하고 검색해봐. 예: 김밥, 닭고기, 캐슈넛");

  async function searchFoods(e?: React.FormEvent) {
    e?.preventDefault();

    const q = query.trim();
    if (!q) {
      setMessage("검색어를 입력해.");
      setFoods([]);
      setSelected(null);
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("foods")
      .select(selectColumns.join(", "))
      .ilike("FOOD_NM_KR", `%${q}%`)
      .limit(50);

    setLoading(false);

    if (error) {
      setMessage(`Supabase 오류: ${error.message}`);
      setFoods([]);
      setSelected(null);
      return;
    }

    const rows = data ?? [];
    setFoods(rows);
    setSelected(rows[0] ?? null);

    if (rows.length === 0) {
      setMessage("검색 결과가 없어.");
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/20 via-neutral-900 to-neutral-950 p-8 shadow-2xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                <Database size={16} />
                식품영양성분 DB
              </div>
              <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
                식품명으로<br />영양성분 검색
              </h1>
              <p className="mt-4 max-w-2xl text-neutral-300">
                식품 구매 시 보는 영양성분 표시사항과 주요 무기질·비타민을 같이 확인하는 검색 사이트야.
              </p>
            </div>

            <form onSubmit={searchFoods} className="w-full max-w-xl">
              <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="예: 김밥, 닭고기, 캐슈넛"
                  className="min-w-0 flex-1 bg-transparent px-5 py-4 text-white outline-none placeholder:text-neutral-500"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-emerald-400 px-5 py-4 font-semibold text-black hover:bg-emerald-300"
                >
                  <Search size={18} />
                  검색
                </button>
              </div>
            </form>
          </div>
        </div>

        {message && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-neutral-900 p-4 text-neutral-300">
            <AlertCircle size={18} />
            {message}
          </div>
        )}

        {loading && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-neutral-900 p-4 text-neutral-300">
            검색 중...
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-3">
            {foods.map((food, idx) => (
              <button
                key={`${pick(food, "FOOD_CD")}-${pick(food, "id")}-${idx}`}
                onClick={() => setSelected(food)}
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  selected?.id === food.id && selected?.FOOD_CD === food.FOOD_CD
                    ? "border-emerald-400 bg-emerald-400/10"
                    : "border-white/10 bg-neutral-900 hover:bg-neutral-800"
                }`}
              >
                <p className="font-semibold">{pick(food, "FOOD_NM_KR")}</p>
                <p className="mt-1 text-sm text-neutral-400">
                  {pick(food, "DB_GRP_NM")} · {pick(food, "DB_CLASS_NM")} · {pick(food, "FOOD_CD")}
                </p>
              </button>
            ))}
          </aside>

          <section>
            {selected ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                  <p className="text-sm text-emerald-300">선택한 식품</p>
                  <h2 className="mt-1 text-3xl font-bold">{pick(selected, "FOOD_NM_KR")}</h2>
                  <p className="mt-2 text-neutral-400">
                    식품코드 {pick(selected, "FOOD_CD")} · 분류 {pick(selected, "DB_GRP_NM")} · 기준량 {pick(selected, "SERVING_SIZE")}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <Card icon={<Flame />} label="에너지" value={displayValue(selected, "AMT_NUM1", "kcal")} />
                  <Card icon={<Beef />} label="단백질" value={displayValue(selected, "AMT_NUM3", "g")} />
                  <Card icon={<Droplets />} label="지방" value={displayValue(selected, "AMT_NUM4", "g")} />
                  <Card icon={<Wheat />} label="탄수화물" value={displayValue(selected, "AMT_NUM6", "g")} />
                  <Card icon={<CircleDot />} label="나트륨" value={displayValue(selected, "AMT_NUM13", "mg")} />
                </div>

                <NutrientSection
                  icon={<Scale size={18} />}
                  title="영양성분 표시사항"
                  description="식품 구매할 때 라벨에서 주로 보는 항목"
                  nutrients={labelNutrients}
                  food={selected}
                />

                <NutrientSection
                  icon={<Pill size={18} />}
                  title="무기질"
                  description="칼슘, 철, 칼륨, 마그네슘, 아연 등"
                  nutrients={mineralNutrients}
                  food={selected}
                />

                <NutrientSection
                  icon={<Leaf size={18} />}
                  title="비타민"
                  description="비타민 A, B군, C, D, E, K"
                  nutrients={vitaminNutrients}
                  food={selected}
                />

                <NutrientSection
                  icon={<HeartPulse size={18} />}
                  title="지방산·기타"
                  description="포화지방, 트랜스지방, 오메가3·6 등"
                  nutrients={fatDetailNutrients}
                  food={selected}
                />

                <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                  <h3 className="mb-4 text-lg font-semibold">원자료 주요 컬럼</h3>
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <Info label="NUM" value={pick(selected, "NUM")} />
                    <Info label="FOOD_CD" value={pick(selected, "FOOD_CD")} />
                    <Info label="FOOD_NM_KR" value={pick(selected, "FOOD_NM_KR")} />
                    <Info label="DB_GRP_NM" value={pick(selected, "DB_GRP_NM")} />
                    <Info label="DB_CLASS_NM" value={pick(selected, "DB_CLASS_NM")} />
                    <Info label="FOOD_REF_NM" value={pick(selected, "FOOD_REF_NM")} />
                    <Info label="FOOD_CAT1_NM" value={pick(selected, "FOOD_CAT1_NM")} />
                    <Info label="FOOD_CAT2_NM" value={pick(selected, "FOOD_CAT2_NM")} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-neutral-900/50 p-10 text-center text-neutral-400">
                검색 결과에서 식품을 선택하면 상세 영양성분이 보여.
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-5">
      <div className="text-emerald-300">{icon}</div>
      <p className="mt-4 text-sm text-neutral-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function NutrientSection({
  icon,
  title,
  description,
  nutrients,
  food,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  nutrients: Nutrient[];
  food: Food;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300">
            {icon}
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <p className="mt-1 text-sm text-neutral-400">{description}</p>
        </div>
      </div>
      <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
        {nutrients.map((n) => (
          <Info key={n.key} label={n.label} value={displayValue(food, n.key, n.unit)} />
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-neutral-500">{label}</p>
      <p className="mt-1 break-all font-medium">{value}</p>
    </div>
  );
}

