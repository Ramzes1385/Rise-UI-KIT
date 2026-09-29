# Rise Media Player

Видеоплеер для Vue 3 на [Rise UI Kit](https://github.com/Ramzes1385/Rise-UI-KIT): своя панель управления, субтитры .vtt и .srt, озвучки, HLS через hls.js, сезоны, серии и главы, реклама (свои вставки, интеграции, VAST), баннеры и достижения, трансляция на телевизор.

## Установка

```sh
npm install @ramzes1385/rise-media-player @ramzes1385/rise-ui-kit vue
```

Кит и Vue — peerDependencies: плеер строится из компонентов кита (кнопки, меню, окна) и берёт у него язык, настройки по умолчанию и иконки. Подключите кит как обычно — стили и спрайт иконок `icons.svg` (см. README кита), — и добавьте стили плеера:

```ts
import '@ramzes1385/rise-ui-kit/styles.css'
import '@ramzes1385/rise-media-player/styles.css'
```

## Использование

```vue
<script setup lang="ts">
import { BaseMediaPlayer } from '@ramzes1385/rise-media-player'
</script>

<template>
	<BaseMediaPlayer sources="/video/intro.mp4" title="Знакомство с сервисом" poster="/video/intro.webp" />
</template>
```

Свойства, события и слоты — те же, что у `BaseMediaPlayer` в ките (раздел BaseMediaPlayer в README кита и Storybook). Строки интерфейса плеера — раздел `player` словаря кита: язык переключает `setLocale()`, свои строки задаёт `defineLocale()`.

- **HLS.** Потоки .m3u8 Safari играет сам; для остальных браузеров передайте класс hls.js: `<BaseMediaPlayer :hls="Hls" … />`. В плеере hls.js нет — его ставит приложение.
- **Трансляция.** Remote Playback API браузера работает без настройки. Для Google Cast подключите скрипт `https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1`; своё приложение-приёмник — `cast-receiver-id`.

## Переход с `@ramzes1385/rise-ui-kit/media`

1. Установите пакет и замените импорт: `@ramzes1385/rise-ui-kit/media` → `@ramzes1385/rise-media-player`.
2. Добавьте `import '@ramzes1385/rise-media-player/styles.css'`: во входе кита стили плеера были в общем `styles.css`.

Остальное без изменений.

## Разработка

- `npm run build` — `dist/index.js`, `dist/media.css` и типы в `dist/`.
- `npm run typecheck` — проверка типов.
- `src/styles/kit/` — копия SCSS-помощников кита (`sz()`, `text-size`, `focus-ring` и другие) без токенов: переменные `--rise-*` приходят из `styles.css` кита. При обновлении кита их копируют заново.
