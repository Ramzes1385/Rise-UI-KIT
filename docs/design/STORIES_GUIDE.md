# Как писать stories

Stories — одновременно документация (вкладка Docs), песочница (Controls) и проверки: play-функции, visual- и e2e-тесты открывают stories по id. Все файлы `*.stories.ts` устроены одинаково, чтобы было сразу видно, какая story за что отвечает. Эталоны: `BaseButton.stories.ts` (действие) и `BaseInput.stories.ts` (поле с v-model).

## 1. Структура файла

```ts
/**
 * BaseX — stories.
 * (1–3 строки: какие разделы есть и что в них.)
 */

import { … } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, … } from '@/stories/helpers'
import { X_VARIANTS } from '../model/BaseX.types'
import BaseX from '../ui/BaseX.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
  title: '<Раздел>/BaseX',
  component: BaseX,
  parameters: { docs: { description: { component: '…' } } },
  argTypes: { …baseArgTypes({ variants: X_VARIANTS }), …props по группам },
  args: { …значения по умолчанию для песочницы },
  render: …,                    // для компонентов с v-model — см. раздел 4
} satisfies Meta<typeof BaseX>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ─────────   песочница
// ─── Внешний вид ─────   Variants, Sizes, CustomColor
// ─── Состояния ───────   Disabled, Loading, WithError, Empty, Readonly…
// ─── Содержимое ──────   слоты, иконки, LongContent
// ─── Сценарии ────────   поведение, характерное для компонента
// ─── Доступность ─────   Keyboard (tags: ['!autodocs'])
```

## 2. Разделы Storybook

Заголовок `title` определяет место в сайдбаре и id story: `Element/BaseButton` → `element-basebutton--variants`.

| Раздел | Компоненты |
|---|---|
| `Foundations` | Страницы токенов: Colors, Typography, Radius & Shadows, Sizing, Theming |
| `Element` | BaseAlert, BaseAnimation, BaseAvatar, BaseBadge, BaseButton, BaseCard, BaseChip, BaseIcon, BaseImage, BaseLoader, BaseProgress, BaseSeparator, BaseSkeleton, BaseText |
| `Form` | BaseCheckbox, BaseColorPicker, BaseDatePicker, BaseFileUpload, BaseForm, BaseFormField, BaseInput, BasePin, BaseRadio, BaseRange, BaseRating, BaseSearch, BaseSelect, BaseSwitch, BaseTextarea |
| `Data` | BaseAccordion, BaseCalendar, BaseEmpty, BaseSlider, BaseTable, BaseTree |
| `Navigation` | BaseBreadcrumbs, BaseMegaMenu, BaseMenu, BasePagination, BaseSideBar, BaseStepper, BaseTabs |
| `Overlay` | BaseDropdown, BaseModal, BaseNotification, BasePopover, BaseSlideover, BaseTooltip, BaseTour |
| `Chat` | BaseChat |
| `Editor` | BaseEditor |

## 3. Описание и argTypes

- **`parameters.docs.description.component`** — 2–8 строк Markdown на русском:
  - для чего компонент и когда его выбрать;
  - ключевые варианты;
  - важное поведение: доступность, v-model, телепорт;
  - связанные компоненты.
- **Описание story** — JSDoc-комментарий над экспортом. Первое предложение говорит, что показывает пример. Storybook выводит этот текст над примером в Docs.
- **Props в таблице** сгруппированы по смыслу. Категорию оставляем стандартной (`props`), группу задаём подкатегорией через `propGroup(ARG_GROUP.x)`:

  | Группа | Какие props |
  |---|---|
  | `content` | Данные и тексты: items, label, placeholder, title |
  | `appearance` | variant, sizeScale, color, customClass, отступы, раскладка |
  | `state` | isDisabled, isLoading, isReadonly, error, isRequired |
  | `behavior` | Режимы и логика: multiple, searchable, closeOnEscape, type |
  | `a11y` | ariaLabel и подобные |

- **Общие props** (variant, sizeScale, color, customClass) — `...baseArgTypes({ variants: X_VARIANTS })`.
- **Слоты.** Текстовый слот в песочнице — `slotArgType('описание')`. У слотов категория `slots` не переопределяется: по ней Storybook понимает, что arg передаётся в слот, а не атрибутом.
- **Функции, сложные объекты, служебные props** — `control: false` или `hiddenArgTypes(...)`.
- **События** docgen добавляет сам. Чтобы видеть их в панели Actions, в `args` песочницы кладём `fn()`: `onClick: fn()`, `'onUpdate:modelValue': fn()`.

## 4. Песочница `Default` и v-model

- `Default` — первая story. Все props меняются в Controls. Она работает без кастомного `render`, если у компонента нет v-model.
- Компонент с v-model получает `render` на уровне `meta`: значение живёт в args и синхронизируется хуком `useModelArg()`. Ввод пользователя виден в Controls, изменение в Controls — в компоненте:

  ```ts
  render: args => {
    const onUpdate = useModelArg()           // хук Storybook: вызывается в теле render
    return {
      components: { BaseX },
      setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
      template: '<BaseX v-bind="props" @update:model-value="onUpdate" />',
    }
  },
  ```

- В кастомном `render` args передаются через `useArgsWithoutSlots(args)`. Иначе текст слота из args (`default: '…'`) попадёт в HTML-атрибут корня.
- В витринах (Variants, Sizes) у каждого экземпляра свой `ref`. Один общий `modelValue` на все экземпляры не нужен: каждый пример должен реагировать на ввод отдельно.
- Если витрина игнорирует часть Controls, оставьте только применимые: `parameters: { controls: { include: ['sizeScale', 'isDisabled'] } }`.

## 5. Обязательные stories

Проверяет `scripts/check-a11y-coverage.mjs` в CI (quality-gates). Имена экспортов:

| Story | Для каких компонентов |
|---|---|
| `Default` | Все |
| `Disabled` | Интерактивные с отключённым состоянием |
| `WithError` (или `Error`) | Поля форм. Экспорт `Error` затеняет глобальный `Error` — используйте `WithError` |
| `Loading` | Компоненты с состоянием загрузки |
| `Empty` | Компоненты со списком или значением, у которых есть пустое состояние |
| `LongContent` | Компоненты, где длинный текст ломает раскладку |
| play-функция с клавиатурой | Все интерактивные: `userEvent.tab`, `userEvent.keyboard` или `tabTo(...)` |

Типовой набор: `Default`, `Variants`, `Sizes`, `CustomColor`, состояния, 1–4 сценария, `Keyboard`. Обычно 8–14 stories. Больше — только если у компонента действительно много независимых режимов.

## 6. Play-функции

Play-функция утверждает наблюдаемое поведение:
- роль и доступное имя;
- атрибут (`aria-expanded`, `aria-selected`, `disabled`);
- значение поля;
- фокус;
- вызов события;
- видимость оверлея.

Правила:
- Контекст: `async ({ canvas, userEvent, args, canvasElement })`. `canvas` — запросы testing-library по области story, `userEvent` — уже настроенный экземпляр.
- Телепортированные элементы (Modal, Dropdown, Tooltip, Notification, панель DatePicker) рендерятся в `body` — ищите их через `screen` из `storybook/test`.
- Ищем по роли, имени, подписи (`getByRole`, `getByLabelText`). CSS-классы — только если у элемента нет роли.
- Асинхронное ждём через `await expect(...)` / `waitFor`, без фиксированных пауз.

Запрещено:
- проверки вида `expect(canvasElement).toBeInTheDocument()` или «элемент существует»;
- `try { … } catch {}` — ошибка play-функции должна падать;
- `dispatchEvent(new CustomEvent(...))` вместо действий пользователя;
- `playShiftTab` без проверки результата.

Stories, которые нужны только как проверка (клавиатура, крайние случаи), помечаются `tags: ['!autodocs']`: они видны в сайдбаре, но не загромождают Docs.

## 7. Детерминированность

Скриншоты и play-проверки должны давать одинаковый результат на любой машине, без сети и в любой день.

- **Изображения.** `placeholderImage()`, `STORY_IMAGES`, `avatarImage()` из `@/stories/helpers`. Без внешних URL (placehold.co, unsplash, picsum…). Для состояния ошибки загрузки — `BROKEN_IMAGE_SRC`.
- **Даты.** `STORY_TODAY` и `storyDate(±дней)` вместо `new Date()`. Visual-тесты дополнительно фиксируют время браузера на `STORY_TODAY`.
- **Случайности.** Без `Math.random()`. Данные таблиц, чатов, деревьев — фиксированные массивы.
- **Таймеры.** Без `setInterval`/`setTimeout`, меняющих картинку, если это не суть story (например, автопрокрутка слайдера).
- **Тексты.** На русском, реалистичные и короткие, без «Lorem ipsum» и «test123».

## 8. Оформление примеров

- Раскладка — классы из `build/storybook/preview.scss`:
  - `story-row` — ряд;
  - `story-col` — колонка по левому краю;
  - `story-stack` — колонка на всю ширину;
  - `story-grid` — сетка;
  - `story-label` — подпись строки;
  - `story-narrow` / `story-medium` — ширина 360/560px;
  - `story-frame` — рамка-контейнер.
- Inline `style` — только для размеров, которые важны примеру (ширина контейнера, чтобы показать обрезку).
- Тёмная тема — переключатель «Тема» на панели инструментов. Отдельные stories `DarkTheme` не нужны. Visual-тесты открывают story с `&globals=theme:dark`.
- Цвета в примерах — только токены `var(--rise-…)`. Исключение — story `CustomColor`: она демонстрирует проп `color`, поэтому в ней допустимы произвольные HEX брендовых цветов.
- Для витрин с кастомным `render` задайте `parameters.docs.source.code` — короткий код использования, который можно скопировать.

## 9. Visual- и e2e-тесты

**Visual-тест компонента** (`__tests__/BaseX.visual.spec.ts`) снимает 3–6 ключевых stories в двух темах через `src/__tests__/visual.ts`:

```ts
import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes', 'disabled'] as const

for (const theme of VISUAL_THEMES) {
  test.describe(`BaseX · ${theme}`, () => {
    for (const story of STORIES) {
      test(story, async ({ page }) => {
        await openStory(page, `element-basex--${story}`, { theme })
        await expectStoryScreenshot(page, `base-x-${story}-${theme}.png`)
      })
    }
  })
}
```

- Для оверлеев — `expectStoryScreenshot(page, name, 'page')`.
- Baseline-скриншоты создаются только осознанно: `npm run test:visual:update` локально или метка `visual:update-baselines` у PR (CI перегенерирует их на Linux).

**E2E-тесты** (`__tests__/BaseX.e2e.spec.ts`) открывают stories по id. При переименовании story или раздела обновите id в e2e. Сценарий теста не меняйте.

## 10. Чек-лист перед коммитом

- `npx eslint --max-warnings 0 <файлы>` и `npm run typecheck` — без ошибок.
- `node scripts/check-a11y-coverage.mjs` и `node scripts/check-stories-coverage.mjs` — зелёные.
- Каждая story открывается без ошибок в консоли, play-функции проходят в светлой и тёмной теме, axe без нарушений. Проверка — `npm run test:stories` по собранному Storybook (`npm run build-storybook`, затем `node scripts/serve-storybook-static.mjs`); для одного компонента — `npm run test:stories -- --filter=basebadge`. В CI она выполняется для всех stories в отдельном job.
- В stories нет внешних URL, `new Date()` без аргументов, `Math.random()`, `try/catch`, inline-цветов.
