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

Порядок разделов в сайдбаре задаёт `storySort` в `build/storybook/preview.ts`.

| Раздел | Компоненты |
|---|---|
| `Introduction` | Вводная страница `src/stories/Introduction.mdx` |
| `Foundations` | Страницы токенов: Colors, Typography, Radius & Shadows, Sizing, Theming (`src/stories/foundations/`) |
| `Blocks` | Готовые экраны из компонентов: Auth (вход, регистрация), Settings, Dashboard (`src/stories/blocks/`) |
| `Element` | BaseAlert, BaseAnimation, BaseAvatar, BaseAvatarGroup, BaseBadge, BaseButton, BaseButtonGroup, BaseCard, BaseChip, BaseColorModeButton, BaseFab, BaseIcon, BaseImage, BaseKbd, BaseLoader, BaseMarkdown, BaseProgress, BaseQrCode, BaseSeparator, BaseSkeleton, BaseSplitButton, BaseText, BaseUser |
| `Form` | BaseAddressInput, BaseAutocomplete, BaseAvatarCropper, BaseCheckbox, BaseCheckboxGroup, BaseColorPicker, BaseDadataInput, BaseDatePicker, BaseFileUpload, BaseForm, BaseFormField, BaseInplace, BaseInput, BaseInputNumber, BaseInputTags, BaseMention, BaseMoneyInput, BasePhoneInput, BasePin, BaseRadio, BaseRange, BaseRating, BaseRequisiteInput, BaseSearch, BaseSegmented, BaseSelect, BaseSignaturePad, BaseSwitch, BaseTextarea, BaseTimePicker |
| `Data` | BaseAccordion, BaseCalendar, BaseChecklist, BaseEmpty, BaseFilterBuilder, BaseHeatmap, BaseInfiniteScroll, BaseJsonViewer, BaseKanban, BaseList, BasePieChart, BaseSlider, BaseSparkline, BaseTable, BaseTextDiff, BaseTimeline, BaseTree, BaseVirtualList |
| `Navigation` | BaseBackTop, BaseBreadcrumbs, BaseLink, BaseMegaMenu, BaseMenu, BasePagination, BaseSideBar, BaseStepper, BaseTabs, BaseToolbar |
| `Layout` | BaseContainer, BaseFooter, BaseHeader, BaseLayout, BaseScrollArea, BaseSplitter |
| `Overlay` | BaseApp, BaseCommandPalette, BaseConfirm, BaseContextMenu, BaseDrawer, BaseDropdown, BaseDropdownMenu, BaseModal, BaseNotification, BaseNotificationCenter, BasePopconfirm, BasePopover, BaseSlideover, BaseTooltip, BaseTour |
| `Chat` | BaseAiMessage, BaseChat, BaseCommentThread, BaseEmojiPicker, BasePromptInput, BaseReasoning, BaseToolCall |
| `Editor` | BaseEditor |
| `Media` | BaseAudioPlayer, BaseImageCompare, BaseMap, BaseMediaPlayer, BaseSubtitleEditor, BaseVoiceRecorder, BaseWaveform |
| `Composables` | Демо composables для своих компонентов приложения: useSortable, useCryptoPro (`src/stories/composables/`). Страница — витрина без компонента, как Blocks: истории и `parameters.ts` — в `<Имя>/`, логика — модулем `cases/<История>.setup.ts`, стили — классы `cmp-*` в `composables.scss`; «Show code» — через `scriptSource`, импорт из `@ramzes1385/rise-ui-kit/composables` — в `importsFrom`. У useCryptoPro `window.cadesplugin` один на страницу Docs — эмуляция ставится только на время `check()` |

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
- Компонент с v-model получает свой `render`: значение синхронизируется с Controls через `models` в `useStorySetup` — ввод пользователя виден в Controls, изменение в Controls — в компоненте. Переменная меняется сразу и лишь потом уходит в Controls: на странице Docs Storybook не перерисовывает историю после `updateArgs`, и пример, который ждёт ответа Controls, там не отвечает на ввод. Шаблон и `models` общие с `storySource`, поэтому «Show code» показывает тот же код с `v-model` и текущим значением:

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
- **Ключи внешних сервисов** (Яндекс Карты) — только из `.env.local` через помощник и только на dev-сервере; в автоматических прогонах и в статической сборке — без ключа (раздел «Задача storybook-yandex-key» в конце).

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
  - логика шаблона (обработчики, таймеры, запросы) — функция `setup` в `useStorySetup`, своя у каждого показа, и тот же код строками `script`. Большую логику (формы со схемой, витрины Blocks) пишите один раз — модулем `<История>.setup.ts` рядом с историей: данные и типы на верхнем уровне, состояние и обработчики — в `export function setup()`, который возвращает всё для шаблона. Превью берёт `setup` (`useStorySetup(args, { setup })`), код — `script: scriptSource(raw)` из `import raw from './X.setup.ts?raw'`: импорты и `export` убираются, тело `setup` встаёт на верхний уровень без `return`. Не `fn.toString()`: в собранном Storybook функции минифицированы и без типов; импорты из vue — в `vue: ['ref', 'onMounted']`, типы — в `imports` как `'type AutocompleteOption'`, из других входов пакета — в `importsFrom` (`{ '@ramzes1385/rise-ui-kit/utils': ['type StandardSchemaV1'] }`);
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
- Скриншот-тесты запускаются только с `--update-snapshots=none`: `npx playwright test --config build/tests/playwright.config.ts --project=visual-chromium --update-snapshots=none`. Эталоны снимков создаёт и обновляет только владелец; `test:visual:update` и метку `visual:update-baselines` не используйте. Каждое ожидаемое визуальное изменение опишите в [VISUAL_CHANGES.md](./VISUAL_CHANGES.md).

**E2E-тесты** (`__tests__/BaseX.e2e.spec.ts`) открывают stories по id. При переименовании story или раздела обновите id в e2e. Сценарий теста не меняйте.

## 10. Чек-лист перед коммитом

- `npx eslint --max-warnings 0 <файлы>` и `npm run typecheck` — без ошибок.
- `node scripts/check-a11y-coverage.mjs` и `node scripts/check-stories-coverage.mjs` — зелёные.
- «Show code» каждой story показывает точный код её превью (раздел 8): `npm run test:story-source -- --group=<раздел>`.
- Каждая story открывается без ошибок в консоли, play-функции проходят в светлой и тёмной теме, axe без нарушений. Проверка — `npm run test:stories` по собранному Storybook (`npm run build-storybook`, затем `node scripts/serve-storybook-static.mjs`); для одного компонента — `npm run test:stories -- --filter=basebadge`. В CI она выполняется для всех stories в отдельном job.
- В stories нет внешних URL, `new Date()` без аргументов, `Math.random()`, `try/catch`, inline-цветов.

## Эпик cross (slots): слоты в Docs

- Описание слота в таблице параметров — JSDoc члена интерфейса `defineSlots<BaseXSlots>()` в `types/*.types.ts`. Плагин `build/plugins/slotDocs.ts` (в `build/storybook/main.ts`, после docgen) берёт слоты из интерфейса и шаблона: слоты в кавычках (`'date-popover'`), `extends` и шаблоны имён (`` [name: `cell-${string}`] `` → строка `cell-{key}`) получают описания, которые vue-docgen-api теряет; поля объекта-параметра слота с JSDoc — привязки слота.
- `slotArgType('…')` в `argTypes.ts` — для слота, текст которого редактируется в Controls; описание можно не дублировать в JSDoc.
- Слот, который компонент объявляет, но не показывает, скрывается `hiddenArgTypes('default')` (FOLLOW_UPS, S1).
- Проверка — `npm run test:slot-docs` (`--component=BaseTable` — один компонент): `<slot>` без объявления в интерфейсе или без `defineSlots`, слот или шаблон имён без описания, динамический `<slot :name>` без шаблона имён, слот в таблице, который компонент не показывает.

## Эпик show-code (Ш.3–Ш.6): дополнения к разделу 8

- **Проверка — по всем разделам.** `npm run test:story-source` проверяет истории всех компонентов и витрины `src/stories/blocks`, `src/stories/composables` и `src/stories/foundations` (у витрин истории и `parameters.ts` лежат прямо в папке `<раздел>/<Имя>/`). Ошибок нет ни в одном разделе; проверка идёт в CI (job «Stories & A11y Coverage»).
- **Свои компоненты примера — `components`.** Когда логика должна жить внутри `<BaseApp>` (`useToast()`, `useOverlay()`, `useConfirm()` находят ближайший `BaseApp` через inject), пример состоит из нескольких файлов. `storySource({ …, components: { ToastButtons: { template, imports, script, vue, state, types, components } } })`: основной файл получает `import ToastButtons from './ToastButtons.vue'`, файлы идут следом под комментарием `<!-- ToastButtons.vue -->`, вложенные `components` — тоже. В превью дочерний компонент — `defineComponent` с тем же шаблоном и той же логикой, что строки `script` (BaseApp, BaseConfirm FromCode, Foundations/Theming).
- **Корневой импорт пакета** не пишется, если `imports` пуст (компонент только из `@ramzes1385/rise-ui-kit/media`, `importsFrom`).
- **`types` — и для `models`:** `models: { messages: 'messages' }, types: { messages: 'ChatMessage[]' }` → `const messages = ref<ChatMessage[]>(…)`.
- **Обработчики через дефис.** Шпионы из args с именем события через дефис (`onDelete-messages`) `useStorySetup` отдаёт в `v-bind="args"` как `onDeleteMessages` — так же, как шаблон называет `@delete-messages`. Иначе ключи разные, и Vue при `emit` вызывает только шпион, а обработчик шаблона молчит.
- **v-model и шпионы.** История, чья play проверяет вызовы шпиона `onUpdate:*` после ввода, держит значение в `state` (`slots: ['modelValue']` в `useStorySetup`, `omit: ['modelValue']` в `storySource`), а не в `models`: `updateArgs` запускает `resetAllMocksLoader`, и вызовы стираются (BaseCalendar MultipleSelection, WithTime, Time12Hour; BaseChat, BaseEditor).
- **Что остаётся только в превью.** Подмена роутера (`linkComponent: StoryRouterLink`) в код не попадает — `omit`. Id, уникальные для страницы Docs (`feed-<id истории>`), в коде — простым значением. Функции в данных (форматтеры колонок, `onClick` кнопок уведомления) `literal()` не печатает — их пишите строками `script` рядом с теми же данными или замените шпион на `() => {}`, если play его не проверяет.
- **Одинаковая логика — дважды.** Обработчики и данные с функциями живут в `setup` превью и строками `script` для кода. Меняете одно — меняйте и второе.

## Задача fix-command-palette-docs: оверлеи на Docs

- История, где оверлей открыт при монтировании (`args: { isOpen: true }`) и рисуется поверх страницы (BaseModal, BaseConfirm, BaseCommandPalette), — `tags: ['!autodocs']`: на Docs окно открывается только кнопкой. Открытое состояние на Docs допустимо только в рамке (`docs.story.inline: false`) — для показа вида (Variants, Positions, Sizes).
- В рамке на Docs play не запускается, программный фокус, `autofocus` и `scrollIntoView` ждут первого нажатия или клика пользователя на странице (`build/storybook/preview.ts`, `holdPlayInDocsFrame` и `guardDocsFrameFocus`). На холсте, в check-stories и скриншот-тестах — как прежде. Поэтому начальное состояние истории в рамке должно быть осмысленным без play.
- Горячие клавиши в истории: на странице Docs все истории — один документ, слушатель на `window` ловит нажатия во всех историях. Сочетание с `window` — только у одной истории страницы (песочница); остальным — `hotkey: null` или область (`hotkeyScope="container"` у BaseCommandPalette).
## Задача motion-core: история «Анимации» и переключатель «Движение»

- **Переключатель «Движение»** в панели Storybook (глобальная переменная `motion`: Нет, Сдержанно, Стандарт, Выразительно) ставит `data-rise-motion` на `<html>`, как «Тема» ставит `data-theme`. По умолчанию — `standard`. Скриншот-тесты открывают истории с `globals=theme:…;motion:none` (`build/tests/visual.ts`): JS-анимации сразу в конечном состоянии, CSS останавливает `animations: 'disabled'`.
- **История `Animations`** («Анимации») — у каждого компонента, файл `cases/behavior/Animations.ts` (у компонентов со старой раскладкой `cases/` — `cases/Animations.ts`), экспорт `export const Animations` в `BaseX.stories.ts`. Внутри — одни и те же примеры в колонках четырёх пресетов и кнопка «Повторить». Помощник — `motionPresetsStory` из `@/stories/helpers`:

```ts
const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" v-bind="args">
			<div class="story-frame">Заказ оформлен</div>
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton },
	imports: ['BaseAnimation'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: { docs: { description: { story: '…' }, source: motion.source } },
	render: motion.render,
	play: async ({ canvas, userEvent }) => { await userEvent.click(canvas.getByRole('button', { name: 'Повторить' })) /* … */ },
}
```

  - `item` — разметка одной колонки. Перезапуск — `:key="replay"` (кнопка делает `replay++`) или своё действие: `action: 'isOpen = !isOpen'`, `trigger: 'Открыть'`, `state: { isOpen: false }`. В `item` нет `id`: колонок четыре.
  - `components` — с `BaseButton` (кнопка «Повторить»); в `imports` для «Show code» он добавляется сам.
  - **«Show code» — точный шаблон превью** (раздел 8): обёртки `<div class="story-motion__preset" data-rise-motion="…">`, кнопка и `replay` в коде те же, что на экране.
  - В описании — какие токены управляют движением и как выключить его в приложении (`motion: 'none'`, `reducedMotion: 'always'`).
  - Play — только конечное состояние через `waitFor` (не середину кадра); `check-stories` прогоняет истории с «уменьшить движение», середину перехода проверяет e2e (`src/stories/foundations/Motion/__tests__/motion.e2e.spec.ts`: анимации ставятся на паузу на середине через `getAnimations()`).
  - Статичным компонентам (Text, Kbd, Separator, Container…) — появление через BaseAnimation (`fade`, `slide-up`, `scale`) тем же помощником.
- **Проверка покрытия**: `npm run test:stories-coverage` перечисляет компоненты без истории `Animations` — пока предупреждением; последняя группа движения переведёт его в ошибку.
- Пример — `Element/BaseAnimation` → «Анимации», страница `Foundations/Motion` («Токены», «Кривые», «Появление»).

## Задача storybook-yandex-key: ключ Яндекс Карт в историях BaseMap

Ключ лежит только в `.env.local` владельца: `STORYBOOK_YANDEX_MAPS_API_KEY=…` (шаблон — `.env.example`; `.env.*` в `.gitignore`). Storybook отдаёт в браузер только переменные с префиксом `STORYBOOK_`. Значение ключа не попадает в репозиторий, код, истории, снимки и документы. В кабинете разработчика Яндекса у ключа обязательно заполнено «Ограничение по HTTP Referer» (для Storybook — `localhost`): JS API 3.0 работает только с такими ключами, без него продукт JavaScript API у ключа «Не настроен», а история показывает «Карта не загрузилась».

- **Где читается.** `STORY_YANDEX_MAPS_KEY` и декоратор `withYandexMapsKey` из `@/stories/helpers` (`render/yandexMapsKey.ts`). История с живой картой — `decorators: [withYandexMapsKey]` (все истории BaseMap с картой, кроме Loading и Placeholder). Шаблон и «Show code» не меняются: ключа нет ни в `args`, ни в Controls, ни в URL истории, ни в коде примера.
- **Живая карта или демо.** Интерактивные истории (Markers, Navigation, ClickToAdd, OfficeList, Theming) с ключом работают на Яндекс Картах, без него — на демо-поставщике без сети: помощник `liveOrDemo` из `stories/shared.ts` (`args: { apiKey: 'demo' }` и `beforeEach: installDemoYandex()` только без ключа) и флаг `isLiveMap` для play с двумя ветками (Default, Providers, ClickToAdd). В автоматических прогонах ключа нет — ветка демо детерминирована. `installDemoYandex({ isFailing: true })` отвечает отказом — для статуса `error` (Placeholder).
- **Как подаётся.** Как `defaults: { BaseMap: { apiKey } }` плагина (`DEFAULTS_KEY`) — тем же путём, каким приложение задаёт ключ. Явный `apiKey` в `args` перекрывает его: `'demo'` у Markers и Loading (демо-поставщик без сети), ввод в Controls. Истории с заглушкой по замыслу (Providers, Seo) декоратор не подключают.
- **`window.ymaps3` один на страницу.** На странице Docs все истории — один документ (как с горячими клавишами, раздел fix-command-palette-docs): демо-поставщик Markers и Loading (`installDemoYandex`) подменяет `window.ymaps3`, и история с ключом рядом с ними получила бы демо вместо настоящего API (у Loading `ready` не отвечает никогда — «Загрузка карты…» навсегда, так до этой задачи висел и Markers на Docs). Поэтому каждая история с `installDemoYandex` (Markers, Loading, Navigation, ClickToAdd, Placeholder, Theming, OfficeList) и Default открываются на Docs в своих рамках (`docs.story.inline: false`, высота по `height` карты плюс подпись), как истории BaseCryptoProSign с `window.cadesplugin`. Декоратор у истории прямо на странице Docs (`viewMode: 'docs'`) не даёт ни ключа, ни подсказки. `installDemoYandex` при очистке возвращает прежний `window.ymaps3`, а не удаляет его: `loadScript` помнит, что скрипт Яндекса уже загружен, и после удаления настоящего API Default на холсте падал бы в ошибку после перехода через Markers или Loading.
- **Только dev-сервер.** Сборщик подставляет значение переменной в код строкой, поэтому чтение стоит за `import.meta.env.DEV`: в статической сборке ветка с ключом вырезается вместе со значением (проверка — `grep` по `storybook-static` с подставным ключом). Переменную и условие держите в одном выражении — `import.meta.env.DEV ? import.meta.env.STORYBOOK_… : undefined`; значение, переданное аргументом функции, остаётся в сборке строкой.
- **Автоматические прогоны — без ключа.** При `navigator.webdriver` (Playwright: скриншот-тесты, e2e, `check-stories`) ключ не используется: снимки и play не зависят от сети и тайлов Яндекса, а `.env.local` владельца их не меняет.
- **Без ключа** — заглушка BaseMap и под превью подсказка «Положите его в .env.local…» (стиль `.story-hint`, текст в помощнике: это строка Storybook, в словари кита она не входит). Play `Default` проверяет подсказку и то, что скрипт Яндекса не загружен; с ключом — что скрипт запрошен и заглушки «Нужен ключ API» нет.
- **Новая история с внешним сервисом, которому нужен ключ:** переменная `STORYBOOK_…` в `.env.example`, чтение за `import.meta.env.DEV`, подсказка без ключа, play обеих веток.
