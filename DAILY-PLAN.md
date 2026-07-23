# Herminox — план на каждый день

Последнее обновление: 2026-07-23  
Правило в Cursor: `.cursor/rules/herminox-daily-plan.mdc` (alwaysApply)

## Безопасность 10/10
Не делаем: парсинг чатов, холодные ЛС, Reddit-боты, thin PSEO на тысячи URL, сбор логинов.

## Ежедневно
1. **3–5 уникальных** guide-страниц (или усиление существующих) — формула + таблица + пример.
2. **5–10 писем** коучам/блогерам → шаблоны на https://herminox.com/partners/ (техника: /embed/)
3. Проверка аналитики (GA + Cloudflare) и GSC по новым URL.
4. Smoke-test одного калькулятора по кругу (FBA → ACoS → Inventory → Unit → CPU → Returns).

## Уже сделано (не переделывать без нужды)
- Prefill FBA + ACoS, embed виджеты, `/embed/`, **`/partners/`** (шаблоны писем + форма), guides hub (20), noindex на query-URL, CSP/analytics.
- **Аудит логики всех 6 калькуляторов** (2026-07-23): `node scripts/audit-calculators.mjs` — зелёный.
  - FBA / ACoS / Unit / Returns — math OK
  - Inventory — recovery = capital ÷ (sell − fees); FAQ/вердикт уточнены
  - Cost Per Use — демо исправлено (было ложное tie $300/5y vs $60/1y)

## Дальше по приоритету
1. Prefill для Inventory / Unit Price / Cost Per Use / Return Tracker  
2. Outreach партнёров (kit: `/partners/`)
3. Новые unique guides  
4. Read-only API (позже)

## Завтра продолжаем с
- Prefill остальных tools **или** новые guides (3–5) + outreach (5–10 писем на `/embed/`)
- Повторный `node scripts/audit-calculators.mjs` после любых правок math
