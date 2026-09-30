---
name: check
description: Проверки порции Rise UI Kit агентом rise-checker — линтеры, типы, тесты с порогом покрытия, словари, истории, доступность — короткий отчёт без логов. Используй в конце порции и перед коммитом.
argument-hint: "[компоненты или файлы; пусто — изменения относительно feat/rise-v2]"
context: fork
agent: rise-checker
background: false
---

Проверь порцию Rise UI Kit.

Состав: $ARGUMENTS

Если состав не указан — изменения относительно `feat/rise-v2`: `git diff --name-only feat/rise-v2...HEAD`, `git diff --name-only`, `git ls-files --others --exclude-standard -- src docs`. Прогони все проверки по своим правилам и верни отчёт в своём формате: СТАТУС, СОСТАВ, ПРОВЕРКИ, ОШИБКИ, НЕ ПРОВЕРЕНО.
