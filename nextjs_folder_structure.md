# Next.js (App Router) 推奨フォルダ構成

```text
newProject/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── resource-a/page.tsx
│   │   │   ├── resource-b/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/login/route.ts
│   │   │   ├── auth/logout/route.ts
│   │   │   ├── resource-a/route.ts
│   │   │   ├── resource-b/route.ts
│   │   │   └── upload/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── common/
│   │   └── features/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── database.types.ts
│   │   ├── api/
│   │   ├── auth/
│   │   └── validators/
│   ├── hooks/
│   ├── types/
│   └── utils/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── AGENTS.md
├── TASKS.md
└── README.md
```

## 運用方針
- 機能単位で `components/features/*` と `lib/api/*` を対応させる
- API入力は `src/lib/validators/*` に集約
- `src/lib/supabase/database.types.ts` を定期再生成する
