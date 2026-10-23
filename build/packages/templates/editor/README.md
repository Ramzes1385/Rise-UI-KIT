# Rise Editor

Визуальный редактор текста для Vue 3 на [Rise UI Kit](https://github.com/Ramzes1385/Rise-UI-KIT): `BaseEditor` с панелью форматирования, историей отмены, загрузкой изображений, очисткой HTML и `v-model` с HTML.

## Установка

```sh
npm install @ramzes1385/rise-editor @ramzes1385/rise-ui-kit vue
```

Кит и Vue — peerDependencies: редактор строится из компонентов кита (кнопки, поля, меню, подсказки) и его composables, берёт у него язык, настройки по умолчанию и иконки. Подключите кит как обычно — стили и спрайт иконок `icons.svg` (см. README кита), — и добавьте стили редактора:

```ts
import '@ramzes1385/rise-ui-kit/styles.css'
import '@ramzes1385/rise-editor/styles.css'
```

## Использование

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseEditor } from '@ramzes1385/rise-editor'

const content = ref('<p>Привет</p>')
</script>

<template>
	<BaseEditor v-model="content" label="Описание" placeholder="Расскажите о проекте" />
</template>
```

Свойства, события и слоты те же, что у `BaseEditor` в ките (раздел BaseEditor справочника компонентов кита — `docs/reference/COMPONENTS.md` — и Storybook). Редактор очищает HTML при показе, вставке и в `update:modelValue`; свой очиститель задаёт проп `sanitize`. Строки интерфейса — раздел `editor` словаря кита: язык переключает `setLocale()`, свои строки задаёт `defineLocale()`.

## Переход с `@ramzes1385/rise-ui-kit`

1. Установите пакет и замените импорт: `BaseEditor` и его типы — из `@ramzes1385/rise-editor`.
2. Подключите `@ramzes1385/rise-editor/styles.css` после стилей кита.

Остальное без изменений.

## Разработка

- `npm run build` — `dist/index.js`, `dist/editor.css` и типы в `dist/`.
- `npm run typecheck` — проверка типов.
- `src/styles/kit/` — копия SCSS-помощников кита (`sz()`, `text-size`, `focus-ring` и другие) без токенов: переменные `--rise-*` приходят из `styles.css` кита. При обновлении кита их копируют заново.
- `src/kitLocale.ts` — строки интерфейса: читает словарь кита публичным `useLocale()`.
