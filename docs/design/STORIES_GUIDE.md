# Как писать stories

Stories — одновременно документация (вкладка Docs), песочница (Controls) и проверки: play-функции, visual- и e2e-тесты открывают stories по id. Все папки `stories/` устроены одинаково, чтобы было сразу видно, какая story за что отвечает. Эталоны: `BaseButton/stories/` (действие) и `BaseInput/stories/` (поле с v-model).

## 1. Структура папки

Stories компонента лежат в папке `stories/`, у каждого файла одно назначение:

```
stories/
├── BaseX.stories.ts   # meta и список stories
├── parameters.ts      # описание компонента: docs.description.component
├── argTypes.ts        # таблица props: группы, контролы
├── args.ts            # значения песочницы
├── render.ts          # общий render, если есть (раздел 4)
├── decorators.ts      # декораторы, если есть
├── shared.ts          # данные и хелперы, нужные нескольким stories
└── cases/
    ├── Default.ts     # одна story на файл
    └── index.ts       # реэкспорт stories
```

```ts
// BaseX.stories.ts
import * as cases from './cases'
import { args } from './args'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseX from '../ui/BaseX.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
  title: '<Раздел>/BaseX',
  component: BaseX,
  parameters,
  argTypes,
  args,
} satisfies Meta<typeof BaseX>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
```

```ts
// cases/Variants.ts
import type meta from '../BaseX.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Variants: StoryObj<typeof meta> = {
  parameters: { docs: { description: { story: 'Все варианты оформления…' } } },
  render: args => ({ … }),
}
```

- Каждая story перечислена в `BaseX.stories.ts` строкой `export const X = cases.X`: Storybook читает названия и порядок stories из этого файла статически. С `export { X } from './cases/X'` сайдбар покажет «CustomColor» вместо «Custom Color».
- Порядок stories: песочница `Default` → внешний вид (Variants, Sizes, CustomColor) → состояния (Disabled, Loading, WithError, Empty, Readonly…) → содержимое (слоты, иконки, LongContent) → сценарии → доступность (`Keyboard` с `tags: ['!autodocs']`).
- Части meta типизируются через `satisfies Meta<typeof BaseX>['args']`, story — через `StoryObj<typeof meta>`.
- Комментариев в файлах stories нет: описание story — в `parameters.docs.description.story`, описание компонента — в `parameters.docs.description.component`.

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
- **Описание story** — `parameters.docs.description.story`. Первое предложение говорит, что показывает пример. Storybook выводит этот текст над примером в Docs. Описание в несколько строк — массив строк с `.join('\n')`.
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
- Компонент с v-model получает свой `render`: значение живёт в args и синхронизируется с Controls через `useStorySetup` — ввод пользователя виден в Controls, изменение в Controls — в компоненте. Шаблон и `models` общие с `storySource`, поэтому «Show code» показывает тот же код с `v-model` и текущим значением:

  ```ts
  const MODELS = { phone: 'modelValue' } as const
  const template = `<BaseX v-bind="args" v-model="phone" />`

  export const Default: StoryObj<typeof meta> = {
    parameters: { docs: { source: storySource({ template, imports: ['BaseX'], models: MODELS }) } },
    render: args => ({ components: { BaseX }, setup: useStorySetup(args, { models: MODELS }), template }),
  }
  ```

- В кастомном `render` args передаются через `useStorySetup(args, …)`: он убирает из `v-bind="args"` слоты (`slots`, по умолчанию `default`). Иначе текст слота из args (`default: '…'`) попадёт в HTML-атрибут корня.
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
- Язык кита — переключатель «Язык» на панели (`&globals=locale:en`). Пропы, которые по умолчанию берутся из языка (`locale`, `firstDayOfWeek` календаря), в общие args не пишите — иначе переключатель на историю не действует; задавайте их только в истории, которая их показывает.
- Цвета в примерах — только токены `var(--rise-…)`. Исключение — story `CustomColor`: она демонстрирует проп `color`, поэтому в ней допустимы произвольные HEX брендовых цветов.
- **«Show code» — точный код превью.** Скопированный код должен рисовать ровно то, что показано в превью: те же компоненты, пропсы, разметка и данные. У истории со своим `render` шаблон — константа, общая для `render` и `parameters.docs.source`:
  - `storySource({ template, imports, models, state, script, omit, vue, importsFrom })` собирает файл Vue: импорты из пакета, переменные `v-model` и состояния, константы и строки `script`. `v-bind="args"` раскрывается в каждом теге в пропсы из Controls — без значений по умолчанию, слотов и обработчиков; атрибут, который тег задаёт сам (`:variant="variant"`), из Controls не повторяется; подпись варианта из `mapping` в Controls — значением, которое получает компонент. Код меняется вместе с Controls;
  - текст слота из Controls в шаблоне — `{{ slots.default }}`: в коде он стоит прямо в теге;
  - состояние шаблона — `state: { isOpen: false }`, одно и то же в `storySource` и `useStorySetup`: в коде `const isOpen = ref(false)`, в превью у каждого показа свой `ref`. Тип для кода — `types: { values: 'Record<string, string>' }` → `ref<Record<string, string>>({})`. Не храните `ref` в константе модуля: состояние переживёт перезапуск истории и не попадёт в код;
  - `useStorySetup(args, { models, state, data, slots, setup })` — `setup` для того же шаблона: `args` для `v-bind` без слотов, тексты слотов, переменные `v-model`, связанные с Controls, состояние, данные и логика шаблона;
  - данные шаблона — константы кита (`X_VARIANTS`) в `imports` или своё значение, выведенное в `script` через `literal(...)` из тех же данных, что в `setup`, — чтобы код не расходился с примером;
  - логика шаблона (обработчики, таймеры, запросы) — функция `setup` в `useStorySetup`, своя у каждого показа, и тот же код строками `script`; импорты из vue — в `vue: ['ref', 'onMounted']`, типы — в `imports` как `'type AutocompleteOption'`, из других входов пакета — в `importsFrom` (`{ '@ramzes1385/rise-ui-kit/utils': ['type StandardSchemaV1'] }`);
  - разметку пишите прямо в шаблоне: вставка общей константы с несколькими строками (`${BUTTON}`) ломает отступы в коде;
  - история без Controls — `staticStorySource(...)`. Картинки data URI уходят в константы `<script setup>`, длинные — сокращаются: `const before = 'data:image/svg+xml,…'`;
  - общий `render` у meta (`stories/render.ts`) экспортирует и `source`; `parameters.ts` компонента ставит его в `docs.source` — так код получают все истории без своего `render`;
  - проверка — `npm run test:story-source` (один раздел — `-- --group=Element`): история со своим `render` без `storySource()`, код, написанный вручную, и общий `render` без `docs.source` — ошибка;
  - классы-помощники (`story-row`, `story-label` и другие из списка выше) в шаблоне можно оставлять: «Show code» добавит их правила блоком `<style scoped>`. Правила лежат в `src/stories/helpers/render/storyStyles.ts`, тест сверяет их с `build/storybook/preview.scss` — новый класс-помощник добавляйте в оба места.

## 9. Visual- и e2e-тесты

**Visual-тест компонента** (`__tests__/BaseX.visual.spec.ts`) снимает 3–6 ключевых stories в двух темах через `build/tests/visual.ts`:

```ts
import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

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
- «Show code» каждой story показывает точный код её превью (раздел 8): `npm run test:story-source -- --group=<раздел>`.
- Каждая story открывается без ошибок в консоли, play-функции проходят в светлой и тёмной теме, axe без нарушений. Проверка — `npm run test:stories` по собранному Storybook (`npm run build-storybook`, затем `node scripts/serve-storybook-static.mjs`); для одного компонента — `npm run test:stories -- --filter=basebadge`. В CI она выполняется для всех stories в отдельном job.
- В stories нет внешних URL, `new Date()` без аргументов, `Math.random()`, `try/catch`, inline-цветов.
