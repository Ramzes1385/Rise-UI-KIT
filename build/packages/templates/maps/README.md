# Rise Maps

Карты для Vue 3 на [Rise UI Kit](https://github.com/Ramzes1385/Rise-UI-KIT):

- `BaseMap` — карта с общим API для Яндекс Карт (API v3) и Google Maps: метки, линии, многоугольники, кластеры, слои, светлая и тёмная схемы.
- `BaseImageMap` — интерактивная картинка и карта этажей: точки и фигуры на плане или SVG, подсказки, справочник объектов, фильтры, маршруты.
- `BaseImageMapEditor` — редактор JSON для `BaseImageMap`: рисование точек и фигур, свойства, этажи, группы.
- `BaseImageMap3D` — 3D-карта этажей на three.js, отдельный вход `@ramzes1385/rise-maps/map3d`.

## Установка

```sh
npm install @ramzes1385/rise-maps @ramzes1385/rise-ui-kit vue
```

Кит и Vue — peerDependencies: карты строятся из компонентов кита (кнопки, поля, окна, подсказки) и берут у него язык, настройки по умолчанию и иконки. Подключите кит как обычно — стили и спрайт иконок `icons.svg` (см. README кита), — и добавьте стили карт:

```ts
import '@ramzes1385/rise-ui-kit/styles.css'
import '@ramzes1385/rise-maps/styles.css'
```

## Использование

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseImageMap } from '@ramzes1385/rise-maps'
import type { ImageMapData } from '@ramzes1385/rise-maps'

const active = ref<string | null>(null)
const data: ImageMapData = {
	layers: [{ id: 'f1', title: 'Этаж 1', image: '/plan-1.svg', width: 1000, height: 600 }],
	objects: [{ id: 'info', type: 'point', x: 0.5, y: 0.5, title: 'Справочная', icon: 'info', action: 'none' }],
}
</script>

<template>
	<BaseImageMap v-model:active="active" :data="data" height="480px" />
</template>
```

`BaseMap`, `BaseImageMap` и `BaseImageMapEditor` — из корня пакета; свойства, события и слоты те же, что у одноимённых компонентов в ките (разделы BaseMap, BaseImageMap, BaseImageMapEditor справочника компонентов кита — `docs/reference/COMPONENTS.md` — и Storybook). Строки интерфейса — разделы `map`, `imageMap`, `imageMapEditor`, `imageMap3d` словаря кита: язык переключает `setLocale()`, свои строки задаёт `defineLocale()`.

- **Яндекс и Google.** Скрипт поставщика загружается по требованию, когда у `BaseMap` есть `apiKey`; ключ выдаёт поставщик (его же можно задать для всех карт настройкой плагина кита `defaults: { BaseMap: { apiKey } }`). Без ключа или при ошибке — заглушка (слот `placeholder`); для Google нужен ещё Map ID стиля (`map-id`).
- **3D-карта.** `BaseImageMap3D` лежит в отдельном входе и подключает `three` — он необязательный peerDependency (`>=0.180.0 <0.200.0`), ставьте его только если используете 3D:

```sh
npm install three
```

```ts
import { BaseImageMap3D } from '@ramzes1385/rise-maps/map3d'
```

Корень пакета `three` не тянет: без 3D его в сборке приложения нет.

## Переход с `@ramzes1385/rise-ui-kit`

1. Установите пакет и замените импорты: `BaseMap`, `BaseImageMap`, `BaseImageMapEditor` и их типы — из `@ramzes1385/rise-maps`; `BaseImageMap3D` — из `@ramzes1385/rise-maps/map3d` (вместо `@ramzes1385/rise-ui-kit/map3d`).
2. Подключите `@ramzes1385/rise-maps/styles.css` после стилей кита.

Остальное без изменений.

## Разработка

- `npm run build` — `dist/index.js`, `dist/map3d.js`, `dist/maps.css` и типы в `dist/`.
- `npm run typecheck` — проверка типов.
- `src/styles/kit/` — копия SCSS-помощников кита (`sz()`, `text-size`, `focus-ring` и другие) без токенов: переменные `--rise-*` приходят из `styles.css` кита. При обновлении кита их копируют заново.
- `src/kitLocale.ts` — строки интерфейса: читает словарь кита публичным `useLocale()`.
