# Дизайн-система Rise UI Kit

Визуальный язык библиотеки — в духе Nuxt UI:
- нейтральная палитра;
- тонкие рамки;
- радиусы 4–8px;
- единая высота контролов;
- фокус-кольцо основного цвета;
- тёмная тема на тех же токенах.

Технически всё сделано на SCSS и CSS-переменных, без Tailwind и без новых зависимостей.

Документ описывает, как устроены токены и по каким правилам написаны стили компонентов. Живые примеры — в Storybook, раздел **Foundations**.

## 1. Токены

Все токены объявлены в `src/styles/_tokens.scss`. Они подключаются в каждый стиль компонента через prelude (`build/config/css.ts`) и попадают в `dist/styles.css`; повторы правил схлопывает минификатор, повторы блоков `@media` — плагин сборки `build/plugins/cssDedupe.ts`.

### 1.1. Три уровня

| Уровень | Имена | Для чего |
|---|---|---|
| Палитры | `--rise-color-{роль}-{50…950}` | Сырые оттенки ролей — палитры Tailwind CSS: `primary` (orange), `neutral` (zinc), `success` (green), `info` (blue), `warning` (amber), `error` (red) |
| Семантические токены | `--rise-bg`, `--rise-text-muted`, `--rise-primary-soft`… | Что именно красится. Значения зависят от темы |
| Компоненты | `var(--rise-…)` в SCSS | Только семантические токены: никаких HEX, `rgba()` и палитр напрямую |

### 1.2. Семантические токены

**Фон**

| Токен | Светлая | Тёмная | Где |
|---|---|---|---|
| `--rise-bg` | white | neutral-900 | Фон страницы, карточек, полей, панелей |
| `--rise-bg-muted` | neutral-50 | neutral-800 | Подвалы, второстепенные области, readonly-поля |
| `--rise-bg-elevated` | neutral-100 | neutral-800 | Наведение на пункты и нейтральные кнопки, заголовки таблиц |
| `--rise-bg-accented` | neutral-200 | neutral-700 | Нажатие, трек слайдера и прогресса, выключенный переключатель |
| `--rise-bg-inverted` | neutral-900 | white | Тултипы и инвертированные блоки |

**Текст**

| Токен | Светлая | Тёмная | Где |
|---|---|---|---|
| `--rise-text-highlighted` | neutral-900 | white | Заголовки, значения в полях, выбранные пункты |
| `--rise-text` | neutral-700 | neutral-200 | Основной текст, подписи полей |
| `--rise-text-toned` | neutral-600 | neutral-300 | Вторичный текст на `bg-elevated` |
| `--rise-text-muted` | neutral-500 | neutral-400 | Подписи, описания, счётчики на `bg`/`bg-muted` |
| `--rise-text-dimmed` | neutral-400 | neutral-500 | Плейсхолдеры, неактивные подсказки |
| `--rise-text-inverted` | white | neutral-900 | Текст на `bg-inverted` |

**Рамки**

| Токен | Светлая | Тёмная | Где |
|---|---|---|---|
| `--rise-border` | neutral-200 | neutral-800 | Рамки поверхностей (карточки, модальные окна, меню), разделители |
| `--rise-border-muted` | neutral-200 | neutral-700 | Внутренние разделители |
| `--rise-border-accented` | neutral-300 | neutral-700 | Рамки полей ввода, outline-кнопок, чекбоксов и радио |
| `--rise-border-inverted` | neutral-900 | white | Рамки на инвертированном фоне |

**Роли** (`primary`, `success`, `info`, `warning`, `error`)

| Токен | Светлая | Тёмная | Где |
|---|---|---|---|
| `--rise-{роль}` | оттенок 600/700 | 400 | Заливка (solid), иконки, выбранные элементы, текст роли на `bg` |
| `--rise-{роль}-hover` | на шаг темнее | 300 | Заливка при наведении |
| `--rise-on-{роль}` | white | neutral-950 | Текст и иконки на заливке роли |
| `--rise-{роль}-soft` | 50 | роль 12% поверх bg | Мягкий фон (soft-варианты, выбранный пункт меню, алерты) |
| `--rise-{роль}-soft-hover` | 100 | роль 18% поверх bg | Мягкий фон при наведении |
| `--rise-{роль}-text` | 800 | 300 | Текст на мягком фоне роли |
| `--rise-{роль}-border` | 200 | роль 35% поверх bg | Тонкая рамка вокруг мягкого фона |

**Медиа** — подложки и текст поверх фото и видео (просмотр BaseImage, подписи и кнопки BaseSlider). Одни и те же в светлой и тёмной теме: контраст считается к изображению, а не к фону темы (fu-media, FOLLOW_UPS № 15).

| Токен | Значение | Где |
|---|---|---|
| `--rise-media-backdrop` | чёрный 88% | Фон окна просмотра изображения |
| `--rise-media-surface` | чёрный 60% | Панели и кнопки поверх изображения (тулбар просмотра, миникарта, кнопка автопрокрутки слайдера) |
| `--rise-media-surface-hover` | чёрный 80% | Те же панели при наведении и нажатии |
| `--rise-media-scrim` | чёрный 64% | Градиент под подписью слайда |
| `--rise-media-scrim-light` | чёрный 32% | Затемнение миниатюры видео |
| `--rise-media-control-hover` | белый 16% | Наведение на кнопку на тёмной подложке |
| `--rise-media-control-active` | белый 24% | Нажатие кнопки на тёмной подложке |
| `--rise-media-border` | белый 20% | Рамки и разделители на тёмной подложке |
| `--rise-media-text` | белый | Текст и значки на подложке |
| `--rise-media-text-toned` | белый 85% | Описание слайда |
| `--rise-media-text-muted` | белый 72% | Счётчик галереи и второстепенный текст просмотра |

**Исключение: цвета цветовой модели BaseColorPicker.** Спектр оттенка (`hsl()` по кругу), чистые белый и чёрный области насыщенности (`--picker-white`, `--picker-black`; белая рамка ручки — тот же `--picker-white`, чтобы ручка была видна на любом цвете модели) — это значения самой модели HSV, а не цвета интерфейса: в токены и темы они не переносятся и в тёмной теме не меняются (FOLLOW_UPS № 15).

**Остальное**
- `--rise-focus-ring` — цвет кольца фокуса (= primary).
- `--rise-overlay` — подложка модальных окон.
- `--rise-shadow-xs … xl` — тени.
- `--rise-radius`, `--rise-radius-xs … 2xl`, `--rise-radius-full` — радиусы. База — `--rise-radius` (4px): шкала `xs … 2xl` считается от неё, поэтому интерфейс становится острее или круглее одной переменной.
- `--rise-font-sans`, `--rise-font-mono` — шрифты.
- `--rise-font-size-2xs … 3xl` + `--rise-line-height-*` — кегль и интерлиньяж.
- `--rise-font-weight-*` — начертания.
- `--rise-control-*` — отступы, шрифт и радиус контролов.
- `--rise-disabled-opacity` — прозрачность неактивных элементов.
- `--rise-duration-*`, `--rise-ease*` — длительности и кривые анимаций; при `prefers-reduced-motion: reduce` длительности становятся 0.01ms.
- `--rise-chart-1 … 8` — восемь категориальных цветов графиков в фиксированном порядке: синий, оранжевый, бирюзовый, жёлтый, розовый, зелёный, фиолетовый, красный. Соседние пары различимы при дальтонизме (ΔE ≥ 8 в OKLab); в тёмной теме — свои оттенки с контрастом к фону не ниже 3:1.
- `--rise-code-keyword`, `-string`, `-number`, `-comment`, `-function`, `-tag`, `-attribute`, `-property`, `-variable` — подсветка кода (BaseCode, блоки кода BaseMarkdown), палитра в духе GitHub Light и Dark. Контраст текста 4.5:1 на `--rise-bg`, `--rise-bg-muted`, `--rise-bg-elevated` и `--rise-primary-soft` (выделенная строка) в обеих темах — проверяет `npm run test:contrast`.
- `--rise-z-overlay` (1000), `--rise-z-toast` (2000), `--rise-z-tooltip` (3000), `--rise-z-max` (9999) — z-index слоёв. Окна, боковые панели, тур, выпадающие панели и контекстные меню — один стек: `z-index: calc(var(--rise-z-overlay) + var(--rise-layer-index, 0))`, где `--rise-layer-index` — место слоя в порядке открытия (`useLayerIndex`). Уведомления, подсказки и просмотр изображения — поверх стека. Числа z-index в стилях компонентов не пишутся.

### 1.3. Контраст

Пары «текст/фон» и «графика/фон» проверяет `npm run test:contrast` (`scripts/check-contrast.mjs`). Пороги WCAG 2.2 AA:
- текст — 4.5:1;
- кольцо фокуса и графика — 3:1.

Результат лежит в [contrast.md](./contrast.md). Правило для компонентов:
- на `bg-elevated` вторичный текст — `--rise-text-toned`, а не `muted` (у `muted` там 4.40:1);
- на мягком фоне роли текст — `--rise-{роль}-text`, а не `--rise-{роль}`.

### 1.4. Темы

- Светлая тема — по умолчанию (`:root`) или `data-theme="light"`.
- Тёмная тема — `data-theme="dark"` на `<html>` или на любом контейнере.
- Тема «как в системе» — `data-theme="system"`: светлые токены, а при `prefers-color-scheme: dark` — тёмные. Переключает тему приложения `useColorMode()` (режимы `light`, `dark`, `system`, выбор сохраняется в localStorage), кнопка для шапки — `BaseColorModeButton`.
- Семантические и производные токены (шкала радиусов, шрифт и радиус контролов) пересчитываются на каждом элементе с `data-theme`. Поэтому:
  - вложенная светлая область внутри тёмной работает;
  - палитру можно переопределить на отдельном контейнере с `data-theme`.
- `color-scheme` выставляется вместе с темой: нативные элементы (скроллбары, календарь `input[type=date]`) тоже темнеют.
- Компоненты не пишут отдельных правил под `[data-theme='dark']`: всё различие — в токенах. Исключение — осознанные эффекты вроде шиммера скелетона.

### 1.5. Совместимость

Переменные 1.x (`--color-accent`, `--color-text-muted`, `--border-radius-base`, `--shadow-md`…) оставлены алиасами новых токенов. Их можно читать в CSS приложения, но компоненты их больше не используют. Поэтому переопределение `--color-accent` компоненты не перекрашивает — используйте `--rise-color-primary-*` или `--rise-primary`. В 2.0 алиасы остаются, удалены они будут в следующей мажорной версии.

### 1.6. Темы бренда (`createTheme`)

Тема — несколько входов → **литералы сидов** (уровень 1) на селекторе `[data-rise-theme="имя"][data-rise-theme]` (специфичность 0,2,0 — сильнее `:root` кита при любом порядке подключения). Семантику тема не пишет: кит пересчитывает её на `[data-theme]` из унаследованных сидов. Отсюда правило: **область темы — `data-rise-theme` и `data-theme` на одном элементе** (`applyTheme` ставит оба).

Файлы: `src/utils/theme/oklchUtils` (sRGB ⇄ OKLCH, гамут, контраст), `src/utils/theme/themeUtils` (`createPalette`, `createNeutralPalette`, `createTheme`, `THEME_PRESETS`, `THEME_CONTRAST_PAIRS`), `src/composables/app/useTheme` (`applyTheme`, `useTheme`). Зависимостей нет.

| Вход | Сиды | Значения |
|---|---|---|
| `primary` (обязателен) | `--rise-color-primary-50…950` | HEX бренда встаёт ровно на 700; светлый затемняется до 4.5:1 с белым (`adjusted`) |
| `primaryDark` | `--rise-color-primary-300`, `-400` только в тёмном режиме | свой бренд тёмной темы (чёрный бренд → светлая кнопка) |
| `neutral` | `--rise-color-neutral-0…950` | `tinted` (по умолчанию: хрома 0.012 тона бренда, `neutral-0` — почти белый) · `gray` · HEX (тон и хрома ≤ 0.04) |
| `success`, `info`, `warning`, `error` | палитры ролей | HEX на главном оттенке кита (700 / 600); не задан — палитра кита |
| `palettes` | палитры как есть | готовые оттенки вместо генератора (так устроен `rise`) |
| `radius` | `--rise-radius` | `none` 0 · `sm` 2px · `md` 4px · `lg` 8px · `full` 14px · число px |
| `density` | `--rise-density` | `compact` 0.75 · `default` 1 · `comfortable` 1.25 · число |
| `shadows` | `--rise-shadow-strength` | `none` 0 · `soft` 0.6 · `default` 1 · `strong` 1.8 · число |
| `font` | `--rise-font-sans`, `-heading` (по умолчанию = sans), `-mono` | стеки; `@font-face` подключает приложение |
| `motion` | `--rise-duration-fast/-/-slow`, `--rise-ease` | `none` 0.01ms · `subtle` 100/150/200ms · `default` как в ките · `expressive` 200/320/450ms с отскоком; тема с `motion` сама обнуляет длительности при `prefers-reduced-motion` |
| `tokens` | любые `--rise-*` | сиды и токены компонентов поверх сгенерированного |

Не заданный вход не выводится — значение наследуется от кита или `:root` приложения. Значения очищаются от `{ } < > ;`, имя приводится к `[a-z0-9-]`.

Генерация палитры (эталон — прототип решения research-theming):
1. Бренд → OKLCH, встаёт на 700, если даёт 4.5:1 с `--rise-on-primary` (белый); иначе светлота уменьшается до порога.
2. Остальные оттенки — лестница светлоты OKLCH: светлее главного — со сдвигом от бренда (50 и 100 не темнее L 0.97 и 0.92), темнее — пропорционально светлоте бренда (у чёрного бренда оттенки не слипаются); хрома по кривой, в гамут sRGB — уменьшением хромы.
3. Дотяжка оттенков пар контраста: 800 на 50 ≥ 4.5; 400 на `#262626` ≥ 4.5 (заливка тёмной темы и текст на ней); 300 на `#333333` ≥ 4.5 (текст роли на мягком фоне тёмной). Нейтраль: 500 и 700 на `neutral-0`, 400 и 200 на 900 ≥ 4.5; если бренд не берёт 4.5:1 на тонированном `neutral-0`, фон — белый.
4. Тёмная тема — из тех же палитр существующими `dark-tokens` (400/300/950, `color-mix` мягких фонов).

Контраст: `createTheme().contrast` — все пары `THEME_CONTRAST_PAIRS` (их же проверяет `scripts/check-contrast.mjs`) в обоих режимах; юнит-тест — сетка 216 брендов × 4 нейтрали без провалов. `npm run test:contrast` = `check-contrast.mjs --theme=all`: кит и 4 пресета × 2 режима (сиды пресета поверх `_tokens.scss`), отчёт — [contrast.md](./contrast.md) по разделам; расхождение генератора с `_tokens.scss` больше 0.05 — предупреждение «поправьте `resolveThemeColors`».

Пресеты (`THEME_PRESETS`):

| Пресет | Бренд | Нейтраль | Радиус | Плотность | Шрифт | Тени | Движение |
|---|---|---|---|---|---|---|---|
| `rise` | палитры кита дословно | кит (zinc) | md | default | Inter (кит) | default | default |
| `corporate` | `#1d4ed8` | slate `#64748b` | sm | compact | системный стек | soft | subtle |
| `playful` | `#7c3aed` | тонированная | full | comfortable | заголовки Nunito | strong | expressive |
| `minimal` | `#18181b`, тёмная `#fafafa` | серый | none | default | ui-monospace / JetBrains Mono | none | none |

Рантайм: `applyTheme(theme, { target, nonce })` — `<style data-rise-theme-style="имя">` в `<head>` (один на тему) и атрибуты на области; без `document` ничего не делает. `useTheme()` — общее управление (`theme`, `themes`, `css`, `setTheme`, `configure`), `createThemeController()` — отдельное. Плагин: `theme`, `themes`, `themeNonce`.

## 2. Размеры и масштаб

- Размер компонента задаёт `sizeScale` — число в процентах. 100 — базовый размер.
- Все длины в стилях умножаются на `--size-scale` функцией `sz()`: отступы, кегль, интерлиньяж, иконки, радиусы, высоты.
- Не масштабируются:
  - рамки 1px;
  - кольцо фокуса (2px);
  - тени;
  - z-index.

| Пресет | sizeScale | Высота контрола | Кегль |
|---|---|---|---|
| xs | 75 | 24px | 10.5px |
| sm | 87.5 | 28px | 12.25px |
| md | **100** | **32px** | **14px** |
| lg | 112.5 | 36px | 15.75px |
| xl | 125 | 40px | 17.5px |

Контрол при `sizeScale` = 100: рамка 1px + отступ `--rise-control-padding-y` (5px) + строка 20px + отступ 5px + рамка 1px = 32px. Кнопка, поле, селект, поиск, пин-код и триггер даты одной высоты, поэтому их можно ставить в один ряд.

Плотность всего интерфейса меняется токенами `--rise-control-padding-y/x` на `:root`, без пропов.

Вложенный компонент без своего `sizeScale` наследует масштаб родителя: `--size-scale` — наследуемая CSS-переменная. Композитные компоненты передают `sizeScale` дочерним явно.

## 3. Правила стилей компонентов

1. **Только токены.** Цвета — `--rise-*` (семантические). Никаких HEX/`rgb()`/`rgba()`/`--color-*`/палитр в стилях компонентов. Полупрозрачность — через `color-mix(in srgb, var(--rise-…) N%, transparent)`.
2. **Все длины через `sz()`.** Исключения — в разделе 2.
3. **Шрифт — парой.** `@include text-size(sm)` или `@include control-text`, а не голый `font-size`. Начертания — `var(--rise-font-weight-*)`.
4. **Радиусы из шкалы:**
   - контролы, пункты меню, поповеры — `md` (`--rise-control-radius`);
   - карточки, модальные окна, алерты, тосты — `lg`;
   - бейджи, тултипы, мелкие элементы — `sm`;
   - переключатели, аватары, пилюли, прогресс — `full`.
5. **Фокус.**
   - Кнопки, ссылки, пункты, вкладки — `@include focus-ring`: кольцо 2px `--rise-focus-ring` снаружи. Внутри контейнера с `overflow: hidden` — `@include focus-ring(-2px)`.
   - Поля (обёртки с input) — `@include field-focus`: рамка и кольцо 1px, итого 2px без сдвига вёрстки.
   - Фокус виден только с клавиатуры (`:focus-visible`). Поля показывают фокус и при клике.
6. **Состояния.**
   - Наведение — `@include hover`. Не срабатывает на отключённых элементах и на тач-экранах.
   - Нажатие — `@include active`.
   - Отключённое — `@include disabled-state` (opacity `--rise-disabled-opacity` + `cursor: not-allowed`).
   - Кнопка, которая может отключиться от собственного нажатия (предел шага, исчерпанная история, пустой выбор), — BaseButton `isFocusableWhenDisabled`: `aria-disabled` вместо `disabled`, фокус и место в порядке Tab сохраняются. Отключение всего компонента (`isDisabled`) — нативный `disabled`. У `[aria-disabled='true']:focus-visible` корень без `opacity` — кольцо фокуса полной яркости, тусклое только содержимое.
   - Никаких `filter: brightness()`, `transform: translateY()` и `scale()` на hover/active: состояния меняют цвет фона, рамки и тень.
7. **Анимации.**
   - Переходы цветов — `@include transition-colors`.
   - Остальное — `@include transition(prop…)`: длительность из токенов, при `prefers-reduced-motion` она обнуляется.
   - Декоративные бесконечные анимации (пульсация, шиммер) — внутри `@include motion-safe`. Спиннеры загрузки крутятся всегда.
   - Имена `@keyframes` — с префиксом компонента (`base-button-spin`).
8. **Кастомный цвет.** Свойства, которые может перекрасить проп `color`, пишутся через миксины `custom-bg*` / `custom-text*` с токеном по умолчанию.
9. **Без тем в компонентах.** Правила `[data-theme='dark'] .base-x` не пишем: тему делают токены.
10. **Без мёртвых селекторов.** Модификатор, которого нет в шаблоне, удаляется. Пример — размерные `--sm/--md/--lg` у полей без пропа `size`.
11. **Цвет компонента не перекрашивает вложенные.** Переменные `--custom-*` наследуются. Поэтому обёртки пользовательских слотов (тело карточки и модального окна, подвал, панель выпадающего списка) сбрасывают их миксином `@include reset-custom-color`. Так проп `color` красит сам компонент, но не кнопки и поля внутри него.

## 4. Рецепты по семействам

### Действия (кнопки, чипы, бейджи, пагинация)

| Вариант | Фон | Текст | Рамка | Hover |
|---|---|---|---|---|
| `default` (solid) | `--rise-primary` | `--rise-on-primary` | — | `--rise-primary-hover` |
| `soft` | `--rise-primary-soft` | `--rise-primary-text` | — | `-soft-hover` |
| `outline` | `--rise-bg` | `--rise-text` | `--rise-border-accented` | фон `--rise-bg-elevated` |
| `ghost` | transparent | `--rise-text` | — | фон `--rise-bg-elevated` |
| `shadow` | `--rise-bg` | `--rise-text-highlighted` | `--rise-border` | `--rise-bg-muted` + `--rise-shadow-md` |

Размеры:
- кнопка — 32px, отступ 5/10, кегль 14/20 medium, gap 6px, иконка 16–20px;
- бейдж md — 12/16 medium, отступ 2/8, радиус `sm`.

### Поля (Input, Textarea, Select, Search, DatePicker, Pin, ColorPicker)

Коробка поля — `@include field-box`:
- рамка `--rise-border-accented`;
- фон `--rise-bg`;
- радиус `md`;
- фокус — `field-focus`;
- ошибка — рамка и фокус `--rise-error`.

Вокруг коробки:
- подпись — `@include field-label` (14/20 medium, `--rise-text`);
- звёздочка — `field-required`;
- ошибка — `field-error`;
- подсказка — `field-hint`;
- плейсхолдер — `--rise-text-dimmed`;
- значение — `--rise-text-highlighted`;
- префиксы и иконки внутри поля — `--rise-text-muted`.

| Вариант | Как выглядит |
|---|---|
| `default` | Рамка accented, фон bg |
| `outline` | Рамка, фон прозрачный |
| `soft` | Без рамки, фон `bg-elevated` 50%, hover `bg-elevated` |
| `ghost` | Без рамки и фона, hover `bg-elevated` |
| `filled` | Фон `bg-elevated` + рамка |
| `underline` | Только нижняя линия |
| `shadow` | Как default + `shadow-xs` |

Доступность полей:
- `label` связан с полем через `for`/`id`;
- ошибка — `aria-invalid` + `aria-describedby`;
- обязательность — `aria-required`.

### Переключатели (Checkbox, Radio, Switch)

- **Checkbox.** Квадрат 16px, радиус `sm`, рамка `--rise-border-accented`, фон `--rise-bg`. Checked — фон и рамка `--rise-primary`, галочка `--rise-on-primary`.
- **Radio.** Круг 16px. Checked — заливка `--rise-primary` с белой точкой 6px.
- **Switch.**
  - Трек 36×20: выкл. — `--rise-bg-accented`, вкл. — `--rise-primary`.
  - Бегунок 16px: `--rise-bg` с `shadow-sm`.
- Подпись — 14/20, `--rise-text`; описание — `--rise-text-muted`.
- Фокус — `focus-ring` на квадрате/треке.
- Отключённое — `disabled-state` на всей строке.

### Поверхности (Card, Modal, Slideover, Popover, Dropdown, Tooltip, Notification, Accordion, Tabs-контейнер, Table, Tree, SideBar)

- **Card**, фон `--rise-bg`, рамка `--rise-border`, радиус `lg`. Секции разделены линией `--rise-border`, отступы 16/20.
  - Варианты:
    - `default` — рамка;
    - `outline` — рамка `accented`;
    - `soft` — фон `bg-elevated` 50% без рамки;
    - `ghost` — без фона и рамки;
    - `shadow` — рамка + `shadow-sm`.
- **Плавающие панели** (Popover, Dropdown, меню Select/Search, календарь в поповере) — `@include floating-surface`: фон bg, рамка border, радиус `md`, `shadow-lg`, внутренний отступ 4px. Пункты — `@include menu-item`: 6/8, радиус `md`, hover `bg-elevated`.
- **Меню** (DropdownMenu, ContextMenu) — панель Dropdown шириной 180–320px. Пункт — `menu-item`, подсветка `bg-elevated` у пункта с фокусом (стрелки и наведение ставят фокус, кольца нет); колонка отметок 16px у флажков и переключателей; подпись группы 12/16 `text-muted` полужирная; разделитель — линия `border` на всю ширину панели; сочетание клавиш и стрелка подменю — справа, `text-muted`; опасное действие — `error`.
- **Вопрос у кнопки** (Popconfirm) — панель Dropdown, внутри отступ 8px, ширина до 300px; вопрос 14/20 полужирный, пояснение 14/20 `text-muted`, кнопки sm справа.
  - Выбранный пункт: текст `--rise-text-highlighted` + галочка `--rise-primary`, либо фон `--rise-primary-soft` и текст `--rise-primary-text`.
- **Modal / Slideover.**
  - Подложка `--rise-overlay`.
  - Окно `--rise-bg`: рамка `--rise-border`, радиус `lg`, `shadow-xl`.
  - Шапка 16/20, заголовок 16/24 semibold `--rise-text-highlighted`, описание `--rise-text-muted`.
  - Кнопка закрытия — ghost-кнопка.
- **Tooltip.** Фон `--rise-bg-inverted`, текст `--rise-text-inverted`, 12/16, отступ 4/8, радиус `sm`, без рамки.
- **Notification (toast).** Как карточка + `shadow-lg`. Цвет типа — иконка `--rise-{роль}`, текст нейтральный, прогресс-полоса снизу `--rise-{роль}`.
- **Alert.** Мягкий фон роли:
  - `soft`: `-soft` + `-text`;
  - `outline`: рамка `-border` + текст `-text`;
  - `default`: заливка `--rise-{роль}` + `--rise-on-{роль}`.
  - Радиус `lg`, отступ 12/16.
- **Table.**
  - Шапка: 14/20 semibold `--rise-text-highlighted`, фон `--rise-bg`, нижняя линия `--rise-border-accented`.
  - Ячейки 14/20 `--rise-text`, отступ 12/16, строки разделены `--rise-border`, hover строки — `--rise-bg-muted`.
  - Выбранная строка — `--rise-primary-soft`.
- **Tabs.**
  - `underline` (по умолчанию) — линия 2px `--rise-primary` под активной вкладкой, общая нижняя линия `--rise-border`.
  - `pills` — «пилюли» в контейнере `bg-elevated`: активная вкладка `bg` + `shadow-xs`.
  - `rounded`, `arc` — те же токены: активная вкладка на фоне `bg`, неактивные — прозрачные.
  - Текст неактивных — `--rise-text-muted`, активной — `--rise-text-highlighted`.

### Обратная связь (Loader, Progress, Skeleton, Empty)

- **Прогресс.** Трек `--rise-bg-accented`, заполнение `--rise-primary`, радиус `full`, высота 8px.
- **Скелетон.** Фон `--rise-bg-elevated`, пульсация только в `motion-safe`.
- **Empty.** Иконка `--rise-text-dimmed`, заголовок 14/20 medium `--rise-text-highlighted`, описание `--rise-text-muted`.

## 5. Файлы

- `src/styles/_tokens.scss` — токены.
- `src/styles/_mixins.scss` — миксины (таблица ниже).
- `src/styles/_functions.scss` — `sz()`.
- `src/styles/_variables.scss` — брейкпоинты и подключение токенов. Карта `$breakpoints` совпадает с `BREAKPOINTS` из `useBreakpoint` — это проверяет тест.
- `src/styles/_fonts.scss` — `@font-face` для Inter Variable и JetBrains Mono Variable из `@fontsource-variable`; `src/styles/index.scss` — токены, шрифты и базовый шрифт страницы для Storybook (в `dist/styles.css` не входит, FOLLOW_UPS № 8).
- `build/storybook/preview.scss` — раскладки примеров в Storybook (`story-row`, `story-col`, `story-grid`…).
- `src/stories/` — страницы Foundations и хелперы stories.
- `scripts/check-contrast.mjs` — проверка контраста токенов.

### Миксины и функции

| Миксин или функция | Что делает |
|---|---|
| `sz($values)` | Умножает длины на `--size-scale`: `sz(10px 20px)` → `calc(10px * var(--size-scale, 1)) calc(20px * var(--size-scale, 1))`, ноль остаётся нулём |
| `text-size($size)` | Кегль и интерлиньяж из шкалы: `2xs`, `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl` |
| `control-text` | Кегль и интерлиньяж контролов: 14/20 при `sizeScale` 100 |
| `transition($props...)` | Переход перечисленных свойств с `--rise-duration` и `--rise-ease` |
| `transition-colors($duration)` | Переход цвета, фона, рамки, контура, тени и прозрачности; по умолчанию `--rise-duration-fast` |
| `motion-safe`, `motion-reduce` | Правила только без `prefers-reduced-motion` и только с ним |
| `hover` | Наведение: только на устройствах с наведением и не на отключённых элементах — после касания состояние не «залипает» |
| `active` | Нажатие, не на отключённых элементах |
| `focus-ring($offset: 2px)` | Кольцо 2px `--rise-focus-ring` при `:focus-visible`; `-2px` — кольцо внутри элемента |
| `disabled-state` | Прозрачность `--rise-disabled-opacity` и `cursor: not-allowed` |
| `field-box` | Коробка поля: рамка `border-accented`, радиус контрола, фон, который перекрашивает проп `color`, переходы и фокус |
| `field-focus($color)` | Фокус поля: рамка и кольцо 1px цвета роли, по умолчанию `--rise-primary` |
| `field-label`, `field-required`, `field-error`, `field-hint` | Подпись поля, звёздочка обязательности, ошибка и подсказка |
| `floating-surface` | Плавающая панель: фон, рамка, радиус md и тень lg |
| `menu-item` | Пункт меню или списка: отступы 6px 8px, радиус md, подсветка при наведении |
| `reset-custom-color` | Сбрасывает `--custom-*` на обёртке пользовательского слота (правило 11) |
| `custom-bg`, `custom-bg-hover`, `custom-bg-active`, `custom-bg-all` | Фон, который перекрашивает проп `color`: `--custom-bg-hover` → `--custom-bg` → значение по умолчанию |
| `custom-bg-reset` | Сбрасывает `--custom-bg*`, унаследованные от родителя со своим цветом, на вложенном компоненте кита (кнопка в сообщении, разделитель в панели): его фон берёт свои значения по умолчанию |
| `custom-text`, `custom-text-hover` | То же для цвета текста |
| `respond-below($name)` | Экран уже брейкпоинта (`max-width` на 0.02px меньше): `xs` 320, `sm` 480, `mobile` 640, `md` 768, `lg` 1024, `xl` 1440, `xxl` 1920 |
| `truncate`, `visually-hidden`, `scrollbar-thin`, `flex-center` | Обрезка строки многоточием; скрытие с экрана, но не от скринридера; тонкая полоса прокрутки; центрирование flex |
