# Отдельные пакеты крупных компонентов

Заготовки отдельных репозиториев: `@ramzes1385/rise-media-player` (порция 4.13 v2), `@ramzes1385/rise-maps` и `@ramzes1385/rise-editor` (задача w13-packages). Сами репозитории и публикацию делает владелец.

Компоненты остаются в ките: плеер — входом `@ramzes1385/rise-ui-kit/media`, карты и редактор — корнем и `/components`, 3D-карта — входом `/map3d`. Пакет — копия кода компонента с переписанными импортами. Код кита он берёт только из публичных входов — это проверяет `build/tests/packageBoundaries.spec.ts` («границы пакета …»): каждое имя, которое папки пакета импортируют из кита, должен экспортировать корень, `/components`, `/composables`, `/utils` или `/icons`. Поэтому перенос механический.

## Как получить содержимое репозитория

```sh
node build/packages/extract.mjs <media|maps|editor> ../rise-maps
cd ../rise-maps
npm install
npm run build
```

`extract.mjs <имя> <папка>` кладёт в пустую папку:

- шаблон проекта: общий `templates/common/` (`tsconfig.json`, `tsconfig.build.json` — типы в `dist`) и свой `templates/<имя>/` (`package.json` с китом и Vue в peerDependencies, `vite.config.ts` — lib-сборка, `vue` и кит внешние, README пакета);
- компоненты без тестов и stories — папки из `packages.json`; импорты `@components/*`, `@composables/*`, `@utils/*`, `@icons/*` и `@/locales` переписаны на `@ramzes1385/rise-ui-kit/components`, `/composables`, `/utils`, `/icons` и корень, импорты между компонентами одного пакета — на относительные пути. Импорт другого внутреннего модуля кита и относительный импорт за пределы пакета останавливают скрипт с ошибкой;
- общие папки кита — поле `shared` (например, `scene3d`: 3D-ядро `src/scene3d` без тестов копируется в `src/scene3d` пакета); импорты `@/scene3d/…` переписаны на относительные пути;
- `src/kitLocale.ts` — если компоненты берут строки интерфейса из внутренних модулей кита (`@/locales/messages`, `/state`, `/warn`): файл читает словарь кита публичным `useLocale()` и отдаёт те же имена (`UI_MAP`, `warn`, `getLocale`…). Разделы `UI_*` берутся из `src/locales/messages.ts`; неизвестное имя останавливает скрипт;
- SCSS-помощники кита (`_functions.scss`, `_mixins.scss`, `_variables.scss`) в `src/styles/kit/` без токенов.

## packages.json

Описание пакетов: ключ — имя для `extract.mjs`, поля:

- `name` — имя пакета в npm;
- `components` — папки компонентов кита (`src/components/<dir>`) и их место в `src/` пакета (`to`; пустая строка — корень `src/`, там лежит `index.ts` компонента);
- `entries` — входы пакета, которые создаёт скрипт (`src/<файл>` с `export *` из папок); пусто — вход пакета `src/index.ts` самого компонента;
- `threeEntries` — входы, которым разрешён `three` (остальные входы его не достигают: проверяет тот же spec);
- `shared` — общие папки `src/<имя>` кита, которые пакет копирует целиком (необязательное; общие папки так же могут импортировать `three`).

Новый пакет: запись в `packages.json`, папка `templates/<имя>/` (`package.json`, `vite.config.ts`, `README.md`), прогон `build/tests/packageBoundaries.spec.ts`.

## Пакеты

| Пакет | Что внутри | Входы | Стили |
|---|---|---|---|
| `@ramzes1385/rise-media-player` | `BaseMediaPlayer`, `BasePresentationPlayer` (`src/presentation/`) | `.` | `styles.css` → `dist/media.css` |
| `@ramzes1385/rise-maps` | `BaseMap`, `BaseImageMap`, `BaseImageMapEditor` (корень); `BaseImageMap3D` (`/map3d`) | `.`, `./map3d` | `styles.css` → `dist/maps.css` |
| `@ramzes1385/rise-editor` | `BaseEditor` | `.` | `styles.css` → `dist/editor.css` |

- **Карты.** `BaseImageMap3D` опирается на модель и части `BaseImageMap`, `BaseImageMapEditor` берёт у него данные и разбор SVG, а у 3D — проверку 3D-полей JSON (`model/validate3d.ts`, без three). Поэтому все четыре папки идут в один пакет, а `three` (необязательный peerDependency) подключает только вход `/map3d`.
- **Редактор.** Панель форматирования, состояние и история отмены лежат в публичных composables кита (`useEditorToolbar`, `useEditorState`, `useEditorHistory`), поэтому пакет несёт только компонент; для него в публичные экспорты кита добавлены `useEditorHistory`, `getClipboardData`, `releasePlaceholders`, `stripPlaceholders`, `getSelectionRange`, `rangeFromStatic`, `selectRange`, `getShortcutLetter`, `foldSearchText` (только добавление).

## Что решить перед переносом

- **Тесты и stories.** Сейчас они в ките и опираются на его тестовую инфраструктуру (Vitest, Storybook, помощники stories). В новом репозитории им нужна своя настройка — или они остаются в ките до выхода пакета.
- **Строки интерфейса.** Разделы словаря (`player`, `map`, `imageMap`, `imageMapEditor`, `imageMap3d`, `editor`) остаются в словаре кита: пакеты читают его через публичный `useLocale()`. Если словарь переедет в пакет, в ките раздел можно оставить для совместимости.
- **Иконки.** Иконки компонентов лежат в спрайте кита: пакету нужна версия кита, в которой они есть.
- **Версия кита.** В шаблонах — `^2.0.0`: пакеты опираются на публичный API 2.0 (в том числе на экспорты, добавленные для редактора).
- **Копии в ките.** Пока компонент остаётся в ките, его правки приходится переносить в пакет повторным `extract.mjs`. Когда пакет выйдет, компонент можно убрать из кита по образцу плеера (отдельная порция, ломающее изменение API).
