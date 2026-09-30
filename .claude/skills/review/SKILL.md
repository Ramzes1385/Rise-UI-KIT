---
name: review
description: Независимое ревью диффа порции Rise UI Kit агентом rise-reviewer — API и типы, раскладка ui/model/types, стили на токенах, доступность, словари, истории, тесты, документы. Ничего не правит. Используй после того, как /check вернул OK.
argument-hint: "[база, по умолчанию feat/rise-v2]"
context: fork
agent: rise-reviewer
background: false
---

Сделай ревью порции Rise UI Kit.

База: $ARGUMENTS (не указана — `feat/rise-v2`). Смотри `git diff <база>...HEAD` и незакоммиченные изменения, новые файлы читай целиком. Верни ответ в своём формате: ВЕРДИКТ, БЛОКЕРЫ, ЗАМЕЧАНИЯ, ДОКУМЕНТЫ, ПОСМОТРЕТЬ ГЛАЗАМИ.
