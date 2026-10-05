# 3D-карта этажей: вход `/map3d`

`BaseImageMap3D` — карта торгового центра, офиса или кампуса в 3D на [three.js](https://threejs.org): этажи стопкой, объекты выдавлены из плана или взяты из модели GLB, камера с вращением, выбор, каталог и маршруты. Данные — тот же JSON, что у 2D-карты `BaseImageMap` (его рисует BaseImageMapEditor), плюс несколько необязательных 3D-полей. Без WebGL карта сама показывает 2D-план.

Компонент живёт в отдельном входе пакета `@ramzes1385/rise-ui-kit/map3d`: в корень пакета, `/components` и плагин он не входит, поэтому приложения без 3D-карты не загружают ни его, ни three.js.

Полный список пропсов, событий, слотов и методов — [COMPONENTS.md, «BaseImageMap3D»](./COMPONENTS.md#baseimagemap3d); живые примеры — Storybook, раздел Media/BaseImageMap3D.

## Установка

```bash
npm i @ramzes1385/rise-ui-kit three
# типы three для TypeScript: от них зависят .d.ts входа /map3d
npm i -D @types/three
```

- `three` — **необязательная peer-зависимость** кита: `>=0.180.0 <0.200.0` (кит проверен на 0.186). Ставит только приложение, которое импортирует `/map3d`.
- Без `three` основной вход (`@ramzes1385/rise-ui-kit`, `/components` и остальные) собирается и работает как прежде — проверено сборкой Vite 8 и `vue-tsc` в чистом приложении без `three`. Импорт `/map3d` без `three` падает **при сборке**: Vite 8 подменяет отсутствующую необязательную peer-зависимость пустым модулем и пишет `[MISSING_EXPORT] "AmbientLight" is not exported by "__vite-optional-peer-dep:three:@ramzes1385/rise-ui-kit"` (по строке на каждый класс three); другие сборщики — `Could not resolve "three"`. Это ожидаемо: установите `three`. TypeScript без `@types/three` на типах `/map3d` пишет `Cannot find module 'three'`.
- Стили карты уже в общем `@ramzes1385/rise-ui-kit/styles` (`styles.css` или `styles.layer.css`); отдельного CSS у входа нет.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseImageMap3D } from '@ramzes1385/rise-ui-kit/map3d'
import type { ImageMap3DData, ImageMap3DView } from '@ramzes1385/rise-ui-kit/map3d'

import '@ramzes1385/rise-ui-kit/styles'

const view = ref<ImageMap3DView>('3d')
const active = ref<string | null>(null)

const data: ImageMap3DData = {
	version: 1,
	layers: [
		{ id: 'f1', title: 'Этаж 1', shortTitle: '1', image: '/maps/floor-1.svg', width: 1000, height: 600, elevation: 0 },
		{ id: 'f2', title: 'Этаж 2', shortTitle: '2', image: '/maps/floor-2.svg', width: 1000, height: 600 },
	],
	objects: [
		{ id: 'shop-101', title: 'Магазин 101', layer: 'f1', type: 'rect', x: 0.1, y: 0.2, width: 0.2, height: 0.25, height3d: 40 },
		{ id: 'cafe', title: 'Кофейня', layer: 'f2', type: 'rect', x: 0.6, y: 0.5, width: 0.15, height: 0.2 },
	],
	scene3d: { floorGap: 220 },
}
</script>

<template>
	<BaseImageMap3D
		v-model:view="view"
		v-model:active="active"
		:data="data"
		has-directory
		has2d-toggle
		height="560px"
		@fallback="reason => console.info('Показан план:', reason)" />
</template>
```

Вход не нужно регистрировать в плагине: импортируйте компонент там, где он нужен (как `BaseMediaPlayer` из `/media`). Ленивая загрузка — `defineAsyncComponent(() => import('@ramzes1385/rise-ui-kit/map3d').then(m => m.BaseImageMap3D))`: карта и three.js попадут в отдельный чанк и загрузятся при первом показе (в чистом приложении на Vite 8 — ≈270 КБ gzip вместе с three и общими частями кита, основной чанк — ≈31 КБ).

## Формат данных

`ImageMap3DData` = `ImageMapData` (формат BaseImageMap и BaseImageMapEditor, `version: 1`) с необязательными полями ниже. Любой JSON 2D-карты подходит без правок, а JSON с 3D-полями открывает и BaseImageMap — он их не читает.

Единицы — **единицы слоя**: `width` × `height` слоя (пиксели картинки или единицы viewBox SVG). Объекты 2D заданы долями (`x: 0.1` — 10 % ширины), в 3D они переводятся в единицы слоя.

| Поле | Тип | По умолчанию | Что делает |
|---|---|---|---|
| `layer.elevation` | число | номер этажа × `scene3d.floorGap` | Высота этажа по вертикали. Этажи идут снизу вверх в порядке `layers` |
| `layer.model` | `{ url, scale?, position?, rotationY? }` | нет | Этаж из модели GLB/GLTF вместо пола с картинкой. `url` — адрес модели; `scale` — масштаб (больше 0, по умолчанию 1); `position` — сдвиг `[x, y, z]` в единицах слоя; `rotationY` — поворот вокруг вертикали в градусах |
| `object.height3d` | число ≥ 0 | `scene3d.objectHeight` | Высота выдавливания объекта (`rect`, `ellipse`, `polygon`, `svg`). Не `height`: у `rect` это размер в плане |
| `object.meshName` | непустая строка | `id` объекта | Имя узла объекта в модели этажа |
| `scene3d.floorGap` | число ≥ 0 | 0,25 × большая сторона слоя | Расстояние между этажами без своего `elevation` |
| `scene3d.floorThickness` | число > 0 | 4 | Толщина плиты этажа |
| `scene3d.objectHeight` | число ≥ 0 | 0,03 × большая сторона слоя | Высота объектов без `height3d` |

- **Неверное поле игнорируется** (берётся умолчание), а при разработке (`NODE_ENV !== 'production'`) в консоли — предупреждение: `[rise-ui-kit] BaseImageMap3D: layers["f1"].model.scale = 0 не учтено — ожидается число больше 0`. Те же правила проверяет BaseImageMapEditor перед сохранением.
- **Этаж без модели**: плита толщиной `floorThickness` с картинкой слоя сверху (`image`, `svg` или `svgUrl`; SVG очищается тем же белым списком, что у 2D), объекты — выдавленные тела цвета своего стиля и группы. Точки (`point`) — метки HTML над сценой.
- **Этаж из модели**: координаты модели — в единицах плана: X = `x` × `width`, Z = `y` × `height` (левый верхний угол плана — начало), Y — вверх. Узел объекта ищется по `meshName ?? id`; загрузчик GLTF заменяет пробелы в именах на `_` — кит ищет и так. Все меши узла окрашиваются по состоянию объекта; меш, уже отданный одному объекту, другому не переназначается (общий `meshName` или вложенные узлы — второй объект берёт только свободные меши, в dev — предупреждение). Узла нет — объект выдавливается по своей фигуре, в dev — предупреждение.

## Модели GLB

- Модель этажа приложение отдаёт **со своего домена или с CDN с CORS** (`Access-Control-Allow-Origin`): кит грузит `layer.model.url` через `GLTFLoader` (fetch). Закрытое хранилище — через свой посредник (прокси) с проверкой доступа; ключи хранилища в JSON карты не кладите.
- Одна модель — один этаж. Масштаб, сдвиг и поворот подгоняются `layer.model.scale`, `position`, `rotationY`, а не правкой модели.
- **Сжатие DRACO, KTX2, meshopt** кит не подключает (декодеры весят сотни КБ и лежат у приложения). Подключите их пропом `configureLoader` — он получает `GLTFLoader` перед загрузкой:

```ts
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import type { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const draco = new DRACOLoader().setDecoderPath('/draco/') // файлы декодера — из node_modules/three/examples/jsm/libs/draco/

function configureLoader(loader: GLTFLoader) {
	loader.setDRACOLoader(draco)
	loader.setMeshoptDecoder(MeshoptDecoder)
	// KTX2 нужен рендерер: new KTX2Loader().setTranscoderPath('/basis/') и detectSupport(renderer) в своей rendererFactory
}
```

```vue
<BaseImageMap3D :data="data" :configure-loader="configureLoader" />
```

- Модель не загрузилась (404, CORS, битый файл) — карта показывает 2D-план, сообщение «Не удалось запустить 3D — показан план» (`role="status"`), событие `fallback('error')` и в dev — предупреждение с адресом и ошибкой. Следующий переход в 3D (`setView('3d')`, `v-model:view`, переключатель «3D / 2D») или новые `data` пробуют снова.

## Камера и этажи

- `camera`: `isometric` (по умолчанию) — ортографическая изометрия, вид сверху под 35° с поворотом 45°; `perspective` — перспектива.
- `layerMode`: `stack` (по умолчанию) — все этажи стопкой, неактивные полупрозрачны (0,25); `single` — виден только активный этаж.
- Этаж выбирается переключателем «Этажи» над картой (если этажей больше одного), `v-model:layer`, `setLayer(id)`, клавишами PageUp/PageDown; камера переезжает на высоту этажа. Событие `layer-change(id)`.
- Мышь и касание: вращение и наклон — левая кнопка или один палец (`hasOrbit`, по умолчанию `true`), сдвиг — правая кнопка или два пальца. Наклон 5–75° от вертикали, масштаб 0,5–8×. **Колесо масштабирует только с Ctrl или ⌘** — без них прокручивается страница; щипок на тачпаде работает.
- Кнопки камеры (`hasZoomControls`, по умолчанию `true`; выключить — `:has-zoom-controls="false"`, тогда с одним этажом панели над картой нет): «Увеличить», «Уменьшить», «Повернуть влево», «Повернуть вправо», «Сбросить вид». Методы через `ref`: `zoomIn()`, `zoomOut()`, `rotate(degrees)`, `resetCamera()`, `zoomToObject(id)` (этаж объекта и камера на нём).
- Переходы камеры и рост линии маршрута — по токену `--rise-duration-xslow` (500 мс в пресете движения `standard`); при `prefers-reduced-motion: reduce`, пресете `none` (`data-rise-motion` на `<html>` или на обёртке карты) и `reducedMotion: 'always'` — сразу конечное состояние.
- Цвета сцены — из токенов `--rise-*` и стилей карты (`styles`, группы); пересчитываются при смене `data-theme`, `data-rise-theme` и системной темы.

## Выбор, клавиатура и скринридер

- Щелчок или касание по объекту активного этажа выбирает его (`select`, `update:active`) и выполняет действие объекта — `popup`, `link`, `layer` или `defaultAction`, как у BaseImageMap. Щелчок после перетаскивания камеры больше чем на 4 px не выбирает. Наведение — `hover(object | null)` и карточка у объекта (`hasTooltip`, слот `tooltip`).
- Область карты — **одна точка Tab**. Клавиши в ней:

| Клавиша | Действие |
|---|---|
| ← → ↑ ↓ | к соседнему объекту в эту сторону экрана |
| Home / End | первый / последний объект этажа |
| Enter / Space | открыть объект (его действие) |
| Escape | снять фокус объекта |
| PageUp / PageDown | этаж выше / ниже |
| Shift + ← / → | поворот камеры на 15° |
| Shift + ↑ / ↓ | наклон камеры на 10° |
| `+` / `=` и `-` | масштаб |
| `0` | исходный вид |

- Объект в фокусе и смену этажа объявляет `aria-live="polite"` («Магазин 101, Этаж 1», «Показан этаж: Этаж 2»); подсказка по клавишам — `aria-describedby`.
- Объекты сцены и метки не фокусируются по отдельности: для скринридера основной путь — **каталог** (`hasDirectory`: список с поиском и фильтрами, обычные кнопки) или **2D-вид** (`has2dToggle` или `v-model:view="'2d'"`: BaseImageMap, где каждый объект — элемент в порядке Tab). Для карт, где без доступности не обойтись, включайте одно из двух.

## Маршруты

`hasRoutes`, `v-model:route`, событие `route-change(result | null)`, методы `showRoute(from, to)` и `clearRoute()`, панель «Как пройти» — те же, что у BaseImageMap, и тот же граф `data.routes`. В 3D путь — трубка цвета `--rise-primary` поверх этажей с вертикальными участками на лестницах и лифтах; линия вырастает от начала к концу.

## 2D-вид и фолбэк

- `v-model:view`: `3d` (по умолчанию) или `2d` — BaseImageMap с теми же данными, пропсами и слотами. Переключатель «3D / 2D» над картой — `has2dToggle` (по умолчанию выключен). 2D-вид получает выбранный объект, этаж, поиск, фильтры и маршрут и возвращает их изменения.
- **Автоматически 2D**: браузер без WebGL (`fallback('unsupported')`), рендерер не создался или модель не загрузилась (`fallback('error')`). Под картой — строка `role="status"`. Если 2D выбрало само приложение (`view="2d"`), события и строки нет.
- **SSR**: до монтирования рендерится разметка области без холста; WebGL проверяется в `onMounted`.
- Свой рендерер (особые настройки WebGL, тесты) — проп `rendererFactory(canvas)`; ошибка внутри фабрики — тоже `fallback('error')`.

## Ограничения

- В 3D-виде нет легенды (`hasLegend`) и полноэкранного режима (`hasFullscreen`) — они работают в 2D-виде. `isPulsing` в 3D не используется.
- Метки `point` и объекты не фокусируются по отдельности (см. «Выбор, клавиатура и скринридер»).
- В режиме `layerMode: 'single'` маршрут через этажи рисуется целиком: этажи скрыты, линия видна.
- Пропсов `wheelZoom`, `maxZoom`, `initArea` у 3D-карты нет — у камеры свои пределы; метода `resetZoom` нет, есть `resetCamera`.
- Сжатые модели (DRACO, KTX2, meshopt) — только через `configureLoader` приложения.
- Картинка WebGL зависит от GPU и драйвера, поэтому скриншот-тестов 3D-видов в ките нет; снимается только 2D-вид.
- Редактор BaseImageMapEditor остаётся 2D: 3D-поля задаются в его панели свойств числами, сцену он не показывает.
