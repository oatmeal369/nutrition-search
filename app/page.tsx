"use client";

import { useState } from "react";
import { Search, Database, Flame, Beef, Droplets, Wheat, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Food = {
  id?: number;
  NUM?: number;
  FOOD_CD?: string;
  FOOD_NM_KR?: string;
  DB_GRP_NM?: string;
  DB_CLASS_NM?: string;
  NUT_CON_STT?: string;
  AMT_NUM1?: number | string | null; // 에너지 kcal
  AMT_NUM3?: number | string | null; // 단백질 g
  AMT_NUM4?: number | string | null; // 지방 g
  AMT_NUM6?: number | string | null; // 탄수화물 g
  AMT_NUM13?: number | string | null; // 나트륨 mg
};

function value(v: number | string | null | undefined, unit: string) {
  if (v === null || v === undefined || v === "") return "-";
  return `${v}${unit}`;
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
      .select('id, NUM, FOOD_CD, FOOD_NM_KR, DB_GRP_NM, DB_CLASS_NM, NUT_CON_STT, AMT_NUM1, AMT_NUM3, AMT_NUM4, AMT_NUM6, AMT_NUM13')
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
                Supabase의 foods 테이블에서 식품명을 검색하고 에너지, 단백질, 지방, 탄수화물, 나트륨을 확인하는 사이트야.
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
                key={`${food.FOOD_CD ?? "food"}-${food.id ?? idx}-${idx}`}
                onClick={() => setSelected(food)}
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  selected?.id === food.id && selected?.FOOD_CD === food.FOOD_CD
                    ? "border-emerald-400 bg-emerald-400/10"
                    : "border-white/10 bg-neutral-900 hover:bg-neutral-800"
                }`}
              >
                <p className="font-semibold">{food.FOOD_NM_KR ?? "-"}</p>
                <p className="mt-1 text-sm text-neutral-400">
                  {food.DB_GRP_NM ?? "-"} · {food.DB_CLASS_NM ?? "-"} · {food.FOOD_CD ?? "-"}
                </p>
              </button>
            ))}
          </aside>

          <section>
            {selected ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                  <p className="text-sm text-emerald-300">선택한 식품</p>
                  <h2 className="mt-1 text-3xl font-bold">{selected.FOOD_NM_KR}</h2>
                  <p className="mt-2 text-neutral-400">
                    식품코드 {selected.FOOD_CD ?? "-"} · 분류 {selected.DB_GRP_NM ?? "-"} · 기준 {selected.NUT_CON_STT ?? "-"}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <Card icon={<Flame />} label="에너지" value={value(selected.AMT_NUM1, " kcal")} />
                  <Card icon={<Beef />} label="단백질" value={value(selected.AMT_NUM3, " g")} />
                  <Card icon={<Droplets />} label="지방" value={value(selected.AMT_NUM4, " g")} />
                  <Card icon={<Wheat />} label="탄수화물" value={value(selected.AMT_NUM6, " g")} />
                  <Card icon={<Database />} label="나트륨" value={value(selected.AMT_NUM13, " mg")} />
                </div>

                <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                  <h3 className="mb-4 text-lg font-semibold">원자료 주요 컬럼</h3>
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <Info label="NUM" value={String(selected.NUM ?? "-")} />
                    <Info label="FOOD_CD" value={selected.FOOD_CD ?? "-"} />
                    <Info label="FOOD_NM_KR" value={selected.FOOD_NM_KR ?? "-"} />
                    <Info label="DB_GRP_NM" value={selected.DB_GRP_NM ?? "-"} />
                    <Info label="DB_CLASS_NM" value={selected.DB_CLASS_NM ?? "-"} />
                    <Info label="NUT_CON_STT" value={selected.NUT_CON_STT ?? "-"} />
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-neutral-500">{label}</p>
      <p className="mt-1 break-all font-medium">{value}</p>
    </div>
  );
}
