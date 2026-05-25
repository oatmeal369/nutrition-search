# Nutrition Search

Supabase `foods` 테이블을 검색하는 Next.js + Vercel용 프로젝트입니다.

## 필요한 환경변수

`.env.local` 파일을 만들고 아래 값을 넣으세요.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_api_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 실행

```bash
npm install
npm run dev
```

## Vercel 배포

Vercel 프로젝트의 Environment Variables에도 같은 값을 넣으세요.

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Supabase 테이블

기본 테이블명은 `foods`입니다.
검색 컬럼은 `FOOD_NM_KR`입니다.
