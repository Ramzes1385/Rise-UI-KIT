---
name: ui-kit
description: >-
  Библиотека базовых UI-компонентов проекта. Следует принципам Nuxt UI:
  минимализм, доступность, поддержка тем и анимаций.
modeSlugs:
  - code
  - vue-component
  - architect
---

# UI Kit — Библиотека компонентов

## Общие принципы

1.  **Только PX**: Все размеры, отступы и шрифты указываются в пикселях. Использование `rem` запрещено.
2.  **Темизация**: Компоненты должны использовать CSS-переменные для цветов. Поддержка `[data-theme='dark']` обязательна.
3.  **БЭМ**: Строгое следование методологии БЭМ в SCSS.
4.  **Анимации**: Использование `BaseAnimation` для всех динамических элементов.
5.  **Типизация**: Каждый компонент должен иметь файл `.types.ts` с интерфейсами Props и Emits.
6.  **Обязательные composables**: Каждый компонент обязан использовать `useSizeScale` (проп `sizeScale`), `useCustomColor` (проп `color`) и `useVariant` (проп `variant`). Это обеспечивает единообразную масштабируемость, кастомизацию цветов и вариант отображения во всём UI Kit. `useVariant` устанавливает БЭМ-модификатор и CSS-переменную `--variant`, которая наследуется дочерними компонентами — позволяет рекурсивно применять стили варианта. **Исключения**: `BaseText` не использует `useVariant` (текст не имеет визуальных вариантов); `BaseSkeleton` не использует `useVariant` и `useCustomColor` (скелетон — неинтерактивный элемент-заглушка, цвет фона задаётся строкой через проп `color`).
7.  **Само-переиспользование**: Компоненты UI Kit обязаны переиспользовать друг друга вплоть до текста. Любой визуальный элемент внутри компонента должен быть реализован через другой компонент UI Kit, а не через сырой HTML. Текст всегда через `BaseText`, иконки через `BaseIcon`, изображения через `BaseImage`, кнопки через `BaseButton`, разделители через `BaseSeparator`, загрузка через `BaseLoader` и т.д. Это гарантирует единообразие темизации, масштабирования и кастомизации цветов на всех уровнях.
8.  **Унификация пропсов**: Проп `size` запрещён. Вместо него используется `sizeScale` для гибкого масштабирования. Проп `variant` должен быть унифицирован во всех компонентах и принимать значения: `default`, `ghost`, `outline`, `shadow`, `soft`. **Исключения**: компоненты с визуально специфичными вариантами могут определять собственный набор (например, `BaseTabs` — `underline`/`pills`/`rounded`/`arc`, `BaseSwitch` — `default`/`outline`/`shadow`).

## Список компонентов

### Ввод данных

- **BaseButton**: Кнопка с вариантами `default`, `ghost`, `outline`, `shadow`, `soft`, слотами `default`/`left`/`right`.
- **BaseInput**: Текстовое поле ввода с `prefix`, `postfix`, маской, вариантами `outline`/`filled`/`underline`.
- **BaseTextarea**: Многострочное поле ввода с `label`, `error`, `isAutosize`, вариантами `default`/`ghost`/`outline`/`shadow`/`soft`.
- **BaseSelect**: Выпадающий список (поиск, мультивыбор).
- **BaseCheckbox**: Флажок.
- **BaseRadio**: Радиокнопка.
- **BaseSwitch**: Переключатель с `label`, `error`, `isRequired`, `reverse`, слотами `default`/`label`/`error`, вариантами `default`/`outline`/`shadow`.
- **BasePin**: Ввод кода по цифрам.
- **BaseFileUpload**: Загрузка файлов.
- **BaseRange**: Ползунок (одиночный и двойной) с метками и тултипом.
- **BaseSearch**: Поле поиска с результатами, автопоиском, дебаунсом, режимами `default`/`modal`/`sidebar`.
- **BaseEditor**: WYSIWYG-редактор с панелью инструментов (форматирование, выравнивание, заголовки).

### Отображение

- **BaseCard**: Универсальный контейнер с заголовком, футером и изображением.
- **BaseAvatar**: Аватар пользователя (изображение или инициалы).
- **BaseBadge**: Информационный бейдж.
- **BaseChip**: Индикатор поверх элемента (число, текст) с позиционированием и вариантами цвета.
- **BaseSkeleton**: Заглушка для загрузки. Не использует `useVariant` и `useCustomColor` — скелетон неинтерактивный, цвет фона задаётся строкой через проп `color`.
- **BaseTooltip**: Всплывающая подсказка.
- **BaseNotification**: Уведомление (toast).
- **BaseIcon**: Иконка из SVG-спрайта с размерами, поворотом, отражением.
- **BaseImage**: Изображение с ленивой загрузкой, плейсхолдером, зумом, WebP-конвертацией.
- **BaseLoader**: Индикатор загрузки (`spinner`, `dots`, `pulse`, `bars`) с оверлеем.
- **BaseProgress**: Прогресс-бар (линейный и круговой) с анимациями.
- **BaseSeparator**: Разделитель (горизонтальный/вертикальный) с декораторами.
- **BaseText**: Типографический компонент с настраиваемой семантикой (tag), начертанием (weight), масштабированием (sizeScale) и обрезкой текста (truncate/maxLines).

### Навигация

- **BaseAccordion**: Раскрывающийся список с вариантами `default`/`ghost`/`outline`/`shadow`/`soft`.
- **BaseMenu**: Простое меню/выпадающий список действий.
- **BaseMegaMenu**: Сложное многоколоночное меню.
- **BaseStepper**: Пошаговый процесс.
- **BasePagination**: Пагинация.
- **BaseTabs**: Табы с вариантами `underline`/`pills`/`rounded`/`arc`.
- **BaseBreadcrumbs**: Хлебные крошки с разделителями и сворачиванием.
- **BaseSlider**: Карусель/слайдер с анимациями, навигацией и автопроигрыванием.

### Структура и Overlay

- **BaseForm**: Обертка для форм.
- **BaseFormField**: Контейнер для поля ввода с Label, Description и Error.
- **BaseModal**: Модальное окно (Teleport).
- **BasePopover**: Всплывающее окно по клику.
- **BaseSlideover**: Выдвижная панель слева/справа.
- **BaseDropdown**: Позиционированный выпадающий контейнер (обёртка для popover-паттернов).
- **BaseAnimation**: Утилита для анимаций (`fade`, `slide-*`, `scale`, `bounce`, `rotate`, `flip`, `zoom`, `collapse`, `list`).

### Данные и контент

- **BaseTable**: Таблица с сортировкой, фильтрацией, пагинацией, вложенными строками, ресайзом колонок.
- **BaseCalendar**: Календарь с выбором дат (single/range/multiple), событиями, временем.
- **BaseChat**: Чат-виджет с вариантами `bubble`/`modern`/`minimal`/`support`/`sidebar`/`thread`/`feed`.

## Правила стилизации

```scss
// Использование переменных
.my-component {
	background-color: var(--color-white);
	color: var(--color-text);
	border: 1px solid var(--color-border);
	border-radius: var(--border-radius-base);
	padding: 16px;

	&:hover {
		border-color: var(--color-accent);
	}
}
```

## Паттерн интерактивных состояний

Для компонентов с hover/active/focus состояниями используй **раздельные миксины** вместо `@content` с аргументами.

### Доступные миксины

- `@include interactive` — добавляет `transition` для типичных свойств (background-color, border-color, color, opacity, transform, box-shadow, filter)
- `@include hover { ... }` — стили при наведении (исключает disabled)
- `@include active { ... }` — стили при нажатии (исключает disabled)
- `@include focus { ... }` — стили при фокусе (focus-visible)
- `@include transition(prop1, prop2, ...)` — кастомные переходы

### Пример: кнопка

```scss
.base-button {
	@include interactive;

	@include hover {
		filter: brightness(1.1);
	}

	@include active {
		transform: scale(0.96);
		filter: brightness(0.9);
	}

	@include focus {
		box-shadow:
			0 0 0 2px var(--color-bg),
			0 0 0 4px var(--color-accent);
	}
}
```

### Пример: поле ввода

```scss
.base-input__field {
	@include interactive;

	@include hover {
		border-color: var(--color-text-muted);
	}

	@include focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-accent);
	}
}
```

### ❌ Запрещено

```scss
// Синтаксис `using` не поддерживается текущей версией Sass
@include interactive using ($state) {
	@if $state == 'hover' { ... }
}
```

### Важно

- `@include interactive` уже задаёт `transition` — не дублируй `@include transition` для тех же свойств
- `var(--transition-base)` уже содержит `cubic-bezier` — не добавляй его повторно в `transition`

## Компоненты — детали

### BaseButton

Кнопка с вариантами и слотами. Использует все три обязательных composable.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Тип кнопки |
| `variant` | `'default' \| 'ghost' \| 'outline' \| 'shadow' \| 'soft'` | `'default'` | Вариант отображения |
| `color` | `CustomColor` | — | Кастомный цвет компонента |
| `isLoading` | `boolean` | `false` | Состояние загрузки |
| `isDisabled` | `boolean` | `false` | Отключенное состояние |
| `sizeScale` | `number` | `100` | Масштаб размера |
| `padding` | `number?` | `10` | Базовый padding (px). Y = значение, X = значение × 2 |

#### Слоты

| Слот | Описание |
|------|----------|
| `default` | Основной контент кнопки |
| `left` | Контент слева от текста (иконка) |
| `right` | Контент справа от текста (иконка) |

#### Правила

1. **Вариант default** — `useVariant` пропускает `'default'` (не добавляет БЭМ-модификатор). Поэтому стили варианта `default` (box-shadow, hover-shadow) должны быть в базовом блоке `.base-button`, а не в `&--default`.
2. **Слоты left/right** — рендерятся только если переданы (`v-if="$slots.left"`). Обёрнуты в `__slot-left` / `__slot-right` с `flex-shrink: 0`.
3. **Загрузка** — при `isLoading=true` контент скрывается (`opacity: 0`), показывается абсолютный спиннер `__loader`. Кнопка становится `disabled`.
4. **Padding** — проп `padding` (число, px) задаёт отступы через CSS-переменные `--btn-pad-y` и `--btn-pad-x`. Y = значение, X = значение × 2. По умолчанию 10 → 10px 20px. Реализуется через `paddingStyle` computed, применяется через `:style`.

#### Примеры

```vue
<!-- Базовое использование -->
<BaseButton @click="handleClick">Отправить</BaseButton>

<!-- С иконками через слоты -->
<BaseButton variant="ghost">
  <template #left>💾</template>
  Сохранить
</BaseButton>

<!-- Кастомный цвет -->
<BaseButton :color="{ bg: { base: '#059669', hover: '#047857' }, text: { base: '#ffffff' } }">
  Зелёная кнопка
</BaseButton>
```

### BaseInput

Текстовое поле ввода. Поддерживает варианты, размеры, маски, prefix/postfix.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `modelValue` | `string \| number` | — | Значение поля |
| `type` | `'text' \| 'email' \| 'tel' \| 'number' \| 'password'` | `'text'` | Тип инпута |
| `placeholder` | `string` | `''` | Плейсхолдер |
| `label` | `string` | — | Заголовок поля |
| `error` | `string` | — | Текст ошибки |
| `isDisabled` | `boolean` | `false` | Отключенное состояние |
| `isRequired` | `boolean` | `false` | Обязательное поле |
| `variant` | `'outline' \| 'filled' \| 'underline'` | `'outline'` | Вариант отображения |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `prefix` | `string` | `''` | Префикс (код страны, символ валюты) |
| `postfix` | `string` | `''` | Постфикс (единица измерения) |
| `mask` | `string` | `''` | Маска ввода |
| `allowedChars` | `'digits' \| 'letters' \| 'alphanumeric'` | — | Фильтр символов |
| `passwordRules` | `PasswordRule[]` | — | Правила валидации пароля |

#### Слоты

| Слот | Описание |
|------|----------|
| `prefix` | Кастомный контент вместо prop `prefix` |
| `postfix` | Кастомный контент вместо prop `postfix` |
| `suffix` | Дополнительный контент после postfix |

#### Правила prefix/postfix

1. **Единая граница** — граница (`border`) задаётся на `__wrapper`, а не на отдельных элементах. Поле `__field`, `__prefix`, `__postfix` не имеют собственных границ (`border: none`). Это гарантирует одинаковую толщину и цвет линии по всему периметру.
2. **Высота** — wrapper использует `align-items: stretch`, padding prefix/postfix совпадает с `__field` для каждого размера.
3. **Нет hover на prefix/postfix** — hover и focus-within применяются к `__wrapper`, prefix/postfix не реагируют на наведение самостоятельно.
4. **Скругления** — `border-radius` задаётся на `__wrapper`; для filled — только сверху; для underline — 0.
5. **Вариант filled** — wrapper с `border: transparent`, при focus — акцентная нижняя граница. Prefix/postfix с фоном `--color-border`.
6. **Вариант underline** — wrapper без границ, только `border-bottom`. Prefix/postfix с прозрачным фоном.
7. **Ошибка** — `__wrapper` получает `border-color: var(--color-error)`.

#### Примеры

```vue
<!-- Префикс: код страны -->
<BaseInput v-model="phone" prefix="+7" placeholder="999 123-45-67" />

<!-- Постфикс: единица измерения -->
<BaseInput v-model="width" postfix="мм" placeholder="1000" />

<!-- Вместе -->
<BaseInput v-model="price" prefix="$" postfix="USD" />

<!-- Через слоты -->
<BaseInput v-model="search">
  <template #prefix><SearchIcon /></template>
  <template #postfix><span>кг</span></template>
</BaseInput>
```

### BaseText

Типографический компонент для отображения текста. Не использует `useVariant` — это единственное исключение из правила обязательных composables, так как текст не имеет визуальных вариантов отображения. Размер управляется через `sizeScale`, начертание через `weight` (число 100–900).

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `tag` | `'p' \| 'span' \| 'div' \| 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'label' \| 'small' \| 'strong' \| 'em'` | `'p'` | Семантический HTML-тег |
| `weight` | `number` | `400` | Начертание (100–900, например 400=regular, 600=semibold, 700=bold) |
| `color` | `CustomColor` | — | Кастомный цвет компонента |
| `nowrap` | `boolean` | `false` | Запрет переноса текста |
| `sizeScale` | `number` | `100` | Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) |
| `truncate` | `boolean` | `false` | Обрезка текста с многоточием |
| `maxLines` | `number` | `1` | Количество строк перед обрезкой (только с truncate) |

#### Правила

1. **Без variant** — BaseText не имеет пропа `variant` и не использует `useVariant`. Текст не имеет визуальных вариантов (ghost, outline и т.д.), только начертание через `weight`.
2. **Без lineHeight** — межстрочный интервал не вынесен в проп. При необходимости используйте inline style `style="line-height: 1.25"`.
3. **Weight — число** — `weight` принимает числовое значение 100–900 (CSS font-weight), а не строку ('regular', 'bold'). Рендерится через inline style `fontWeight`.
4. **Truncate** — при `truncate=true` и `maxLines=1` применяется CSS-класс `--truncate` (overflow + text-overflow + white-space: nowrap). При `maxLines > 1` применяется `-webkit-line-clamp` через inline style.
5. **SizeScale в Storybook** — `control: { type: 'range', min: 50, max: 200, step: 10 }`.
6. **Weight в Storybook** — `control: { type: 'range', min: 100, max: 900, step: 100 }`.
7. **MaxLines в Storybook** — `control: { type: 'range', min: 1, max: 10, step: 1 }`.
8. **Слоты в Storybook** — текст передавайте через slot (`<BaseText>Текст</BaseText>`), а не через `args.default`, иначе `v-bind="args"` передаст его как prop и текст не отобразится.

#### Примеры

```vue
<!-- Базовое использование -->
<BaseText>Обычный текст</BaseText>

<!-- Семантический тег -->
<BaseText tag="h1" :size-scale="188" :weight="700">Заголовок</BaseText>

<!-- Начертание -->
<BaseText :weight="600">Полужирный текст</BaseText>
<BaseText :weight="700">Жирный текст</BaseText>

<!-- Кастомный цвет -->
<BaseText :color="{ text: { base: '#dc2626' } }">Ошибка</BaseText>

<!-- Обрезка с многоточием (одна строка) -->
<BaseText truncate>Длинный текст обрезается...</BaseText>

<!-- Обрезка с многоточием (3 строки) -->
<BaseText truncate :max-lines="3">Длинный текст...</BaseText>

<!-- Без переноса -->
<BaseText nowrap>Текст без переноса</BaseText>
```

### BaseTextarea

Многострочное поле ввода с label, error, autosize. Структура аналогична BaseInput — обёртка `div.base-textarea` с элементами `__label`, `__field`, `__error-text`.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `modelValue` | `string` | — | Значение поля |
| `placeholder` | `string` | `''` | Плейсхолдер |
| `rows` | `number` | `4` | Количество строк |
| `maxlength` | `number` | — | Максимальное количество символов |
| `label` | `string` | — | Заголовок поля |
| `error` | `string` | — | Текст ошибки |
| `isDisabled` | `boolean` | `false` | Отключенное состояние |
| `isRequired` | `boolean` | `false` | Обязательное поле |
| `isReadonly` | `boolean` | `false` | Только для чтения |
| `variant` | `'default' \| 'ghost' \| 'outline' \| 'shadow' \| 'soft'` | `'default'` | Вариант отображения |
| `color` | `CustomColor` | — | Кастомный цвет компонента |
| `isAutosize` | `boolean` | `false` | Автоматическое изменение высоты |
| `sizeScale` | `number` | `100` | Масштаб размера |
| `name` | `string` | — | Имя поля для формы |

#### Правила

1. **Структура** — компонент обёрнут в `div.base-textarea` (как BaseInput обёрнут в `div.base-input`). Не голый `<textarea>`.
2. **Ошибка** — проп `error: string` вместо `hasError: boolean`. Текст ошибки выводится через `<BaseText class="base-textarea__error-text">` под полем. Класс `--error` вешается на корневой div, а не на textarea.
3. **Label** — выводится через `<BaseText class="base-textarea__label">`. Звёздочка `*` для обязательного поля через `<BaseText class="base-textarea__required">`.
4. **Autosize** — при `isAutosize=true` у textarea убирается `resize` и `overflow: hidden`, высота подстраивается под контент через `el.style.height = el.scrollHeight + 'px'`. Вызывается при input, при изменении modelValue через watch, и при onMounted.
5. **Rows** — не задавать `min-height` в стилях, иначе атрибут `rows` не работает. Высота определяется только атрибутом `rows`.
6. **Variant в Storybook** — `control: 'radio'` вместо `select`, чтобы видеть все варианты сразу.
7. **Нерабочие пропсы** — не добавлять `wrap`, `cols`, `spellcheck`, `autofocus` как пропсы — они не работают корректно через Vue props на textarea.

#### Примеры

```vue
<!-- Базовое использование -->
<BaseTextarea v-model="text" placeholder="Введите текст..." />

<!-- С меткой и ошибкой -->
<BaseTextarea v-model="text" label="Описание" is-required error="Обязательное поле" />

<!-- Автоизменение высоты -->
<BaseTextarea v-model="text" is-autosize :rows="2" />

<!-- Только для чтения -->
<BaseTextarea v-model="text" is-readonly />

<!-- С ограничением символов -->
<BaseTextarea v-model="text" :maxlength="100" label="Краткое описание" />
```

### BaseRange

Ползунок с поддержкой одиночного и двойного выбора, метками и тултипом.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `modelValue` | `number?` | — | Текущее значение (одиночное) |
| `rangeValue` | `[number, number]?` | — | Диапазон (двойной ползунок) |
| `min` | `number?` | — | Минимальное значение |
| `max` | `number?` | — | Максимальное значение |
| `step` | `number?` | — | Шаг |
| `variant` | `'primary' \| 'accent' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Вариант |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `isDisabled` | `boolean?` | `false` | Отключен |
| `hasTooltip` | `boolean?` | `false` | Показывать тултип |
| `marks` | `RangeMark[]?` | — | Метки на шкале |
| `isVertical` | `boolean?` | `false` | Вертикальный |
| `hasLabel` | `boolean?` | `false` | Показывать текущее значение |
| `sizeScale` | `number?` | `100` | Масштаб размера |

### BaseSearch

Поле поиска с результатами, автопоиском и дебаунсом.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `modelValue` | `string?` | — | Значение |
| `placeholder` | `string?` | — | Плейсхолдер |
| `variant` | `'outline' \| 'filled' \| 'underline'` | `'outline'` | Вариант |
| `mode` | `'default' \| 'modal' \| 'sidebar'` | `'default'` | Режим отображения |
| `results` | `SearchResult[]?` | — | Результаты поиска |
| `isInstant` | `boolean?` | `false` | Автопоиск при вводе |
| `debounceMs` | `number?` | — | Задержка автопоиска (мс) |
| `isLoading` | `boolean?` | `false` | Загрузка |
| `hasClear` | `boolean?` | `false` | Кнопка очистки |
| `hasIcon` | `boolean?` | `false` | Иконка поиска |
| `maxResults` | `number?` | — | Макс. количество результатов |
| `isAutofocus` | `boolean?` | `false` | Автофокус |
| `isDisabled` | `boolean?` | `false` | Отключено |

#### Слоты

| Слот | Описание |
|------|----------|
| `default` | Кастомный контент |
| `result` | Кастомный элемент результата (`{ item, index }`) |
| `empty` | Пустой результат |
| `loading` | Состояние загрузки |

### BaseEditor

WYSIWYG-редактор с панелью инструментов.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `modelValue` | `string?` | — | HTML-содержимое |
| `placeholder` | `string?` | — | Плейсхолдер |
| `isReadonly` | `boolean?` | `false` | Только чтение |
| `hasToolbar` | `boolean?` | `true` | Панель инструментов |
| `isAutofocus` | `boolean?` | `false` | Автофокус |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Слоты

| Слот | Описание |
|------|----------|
| `toolbar` | Кастомная панель инструментов |

### BaseChip

Индикатор поверх элемента (число или текст).

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `content` | `number \| string?` | — | Содержимое индикатора |
| `placement` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` | Позиция |
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'primary'` | Вариант цвета |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `isHiddenOnZero` | `boolean?` | `false` | Скрыть при content = 0 |
| `hasOverflow` | `boolean?` | `false` | Показывать '+' рядом с числом |
| `maxValue` | `number?` | — | Макс. число (если больше — max+) |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Слоты

| Слот | Описание |
|------|----------|
| `default` | Обёрнутый элемент |

### BaseIcon

Иконка из SVG-спрайта.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `name` | `string` | — | Имя иконки (SVG-файл без расширения) |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Размер |
| `color` | `string?` | — | Цвет (CSS-значение или переменная) |
| `rotate` | `number?` | — | Поворот (градусы) |
| `isFlipX` | `boolean?` | `false` | Отразить по горизонтали |
| `isFlipY` | `boolean?` | `false` | Отразить по вертикали |
| `ariaLabel` | `string?` | — | Метка для скринридеров |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Доступные иконки (спрайт)

`arrow-left`, `arrow-right`, `attach`, `check`, `chevron-down`, `chevron-left`, `chevron-right`, `chevron-up`, `close`, `menu`, `mic`, `pause`, `play`, `reply`, `search`, `send`, `sort-down`, `sort-up`, `sort`, `x-mark`

### BaseImage

Изображение с ленивой загрузкой, плейсхолдером и зумом.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `src` | `string` | — | URL изображения |
| `alt` | `string` | — | Альтернативный текст |
| `width` | `number \| string?` | — | Ширина |
| `height` | `number \| string?` | — | Высота |
| `fit` | `'cover' \| 'contain' \| 'fill' \| 'none'` | `'cover'` | Режим заполнения |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Ленивая загрузка |
| `borderRadius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'none'` | Скругление |
| `hasPlaceholder` | `boolean?` | `false` | Плейсхолдер при загрузке |
| `aspectRatio` | `string?` | — | Аспектное соотношение (напр. '16/9') |
| `srcWidth` | `number?` | — | URL-параметры для оптимизации |
| `hasZoom` | `boolean?` | `false` | Зум по клику |
| `closeOnOverlay` | `boolean?` | `true` | Закрытие зума по клику на оверлей |
| `initialScale` | `number?` | — | Начальный масштаб зума |
| `zoomStep` | `number?` | — | Шаг масштаба |
| `minScale` | `number?` | — | Мин. масштаб |
| `maxScale` | `number?` | — | Макс. масштаб |
| `showMinimap` | `boolean?` | `false` | Мини-карта при зуме |
| `convertToWebp` | `boolean?` | `false` | Конвертировать в WebP |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Слоты

| Слот | Описание |
|------|----------|
| `placeholder` | Кастомный плейсхолдер |
| `error` | Кастомная ошибка загрузки |

### BaseLoader

Индикатор загрузки с вариантами анимации.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `variant` | `'spinner' \| 'dots' \| 'pulse' \| 'bars'` | `'spinner'` | Вариант анимации |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `color` | `string?` | — | Цвет (CSS-значение) |
| `hasLabel` | `boolean?` | `false` | Показывать текст |
| `label` | `string?` | — | Текст загрузки |
| `isOverlay` | `boolean?` | `false` | Полноэкранный оверлей |
| `sizeScale` | `number?` | `100` | Масштаб размера |

### BaseProgress

Прогресс-бар (линейный и круговой).

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `value` | `number` | — | Значение (0–100) |
| `max` | `number?` | `100` | Максимальное значение |
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'primary'` | Вариант цвета |
| `shape` | `'line' \| 'circle'` | `'line'` | Форма |
| `animation` | `'none' \| 'striped' \| 'pulse' \| 'glow'` | `'none'` | Анимация |
| `hasLabel` | `boolean?` | `false` | Показывать значение |
| `isIndeterminate` | `boolean?` | `false` | Неопределённый прогресс |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Слоты

| Слот | Описание |
|------|----------|
| `default` | Кастомный контент (`{ value, percent }`) |

### BaseSeparator

Разделитель с ориентацией и декораторами.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Ориентация |
| `decorator` | `'none' \| 'dot' \| 'dash' \| 'star' \| 'ornament'` | `'none'` | Декоративный элемент |
| `label` | `string?` | — | Текст метки |
| `variant` | `'primary' \| 'secondary' \| 'accent'` | `'primary'` | Вариант цвета |
| `thickness` | `'thin' \| 'medium' \| 'thick'` | `'medium'` | Толщина |
| `isDashed` | `boolean?` | `false` | Пунктирная линия |
| `spacing` | `'sm' \| 'md' \| 'lg'` | `'md'` | Отступы |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Слоты

| Слот | Описание |
|------|----------|
| `default` | Кастомный контент |
| `decorator` | Кастомный декоратор |

### BaseTabs

Табы с вариантами отображения. Использует специфичные варианты вместо стандартных (`default`/`ghost`/`outline`/`shadow`/`soft`), так как визуальное оформление табов принципиально отличается.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `items` | `TabItem[]` | — | Список табов |
| `modelValue` | `string` | — | Активный таб (id) |
| `variant` | `'underline' \| 'pills' \| 'rounded' \| 'arc'` | `'underline'` | Вариант |
| `color` | `CustomColor?` | — | Кастомный цвет компонента |
| `isFullWidth` | `boolean?` | `false` | Растянуть на всю ширину |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Варианты

- **underline** — подчёркивание активного таба акцентной линией (по умолчанию). Без скруглений (`border-radius: 0`), табы выглядят как плоские кнопки с линией снизу.
- **pills** — табы в виде «пилюль» со скруглёнными углами (`border-radius: var(--border-radius-base)`), активный с заливкой акцентом.
- **rounded** — полоскруглые табы (`border-radius: var(--border-radius-full)`), фон через `var(--color-surface-muted)`, активный с заливкой акцентом.
- **arc** — арочные табы (скруглённые сверху: `border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0`), стыкующиеся с контентом.

#### Правила

1. **Специфичные варианты** — BaseTabs не использует стандартный набор `default`/`ghost`/`outline`/`shadow`/`soft`, так как визуальное оформление табов принципиально отличается от других компонентов.
2. **Нет isRounded** — скругление реализовано через вариант `rounded`, а не через отдельный проп. Проп `isRounded` удалён.
3. **useVariant + useCustomColor в шаблоне** — `variantClass`, `variantStyle`, `customColorStyle` привязаны к шаблону через `:class` и `:style`. Раньше вычислялись, но не использовались.
4. **TabItem** — каждый таб содержит `id`, `label`, опционально `icon` и `isDisabled`.
5. **CSS-переменные** — используются только реальные переменные из `_variables.scss`: `--color-surface-muted`, `--color-border`, `--color-bg`, `--border-radius-base` (8px), `--border-radius-lg` (12px), `--border-radius-full` (9999px).
6. **underline без скруглений** — вариант `underline` явно задаёт `border-radius: 0`, переопределяя базовое `border-radius: var(--border-radius-base)` на `__tab`.

#### Примеры

```vue
<!-- Подчёркивание (по умолчанию) -->
<BaseTabs v-model="tab" :items="items" />

<!-- Pills -->
<BaseTabs v-model="tab" :items="items" variant="pills" />

<!-- Rounded -->
<BaseTabs v-model="tab" :items="items" variant="rounded" />

<!-- Arc -->
<BaseTabs v-model="tab" :items="items" variant="arc" />

<!-- На всю ширину -->
<BaseTabs v-model="tab" :items="items" variant="pills" is-full-width />

<!-- С иконками -->
<BaseTabs v-model="tab" :items="iconItems" variant="rounded" />
```

#### История изменений

- **Варианты** — заменены стандартные `default`/`ghost`/`outline`/`shadow`/`soft` на специфичные `underline`/`pills`/`rounded`/`arc`.
- **isRounded** — проп удалён, скругление теперь через вариант `rounded`.
- **Шаблон** — `variantClass`, `variantStyle`, `customColorStyle` привязаны к шаблону (раньше вычислялись, но не использовались).
- **CSS-переменные** — заменены несуществующие (`--color-bg-secondary`, `--color-bg-tertiary`, `--color-bg-primary`, `--radius-md`, `--radius-full`, `--radius-lg`) на реальные из `_variables.scss` (`--color-surface-muted`, `--color-border`, `--color-bg`, `--border-radius-base`, `--border-radius-full`, `--border-radius-lg`).
- **underline** — явно задан `border-radius: 0`, чтобы убрать скругления на табах с подчёркиванием.
- **Базовый __tab** — добавлен `border-radius: var(--border-radius-base)`, чтобы табы не были квадратными по умолчанию.
- **Удалены стили** — старые варианты `default`, `ghost`, `outline`, `shadow`, `soft`, модификатор `isRounded`.
- **Storybook** — полная переработка: 16 stories с новыми вариантами, `items` виден в панели пропсов (control: 'object'), `variant` через radio.
- **Тесты** — обновлены под новые варианты и класс `base-button--disabled` для отключённых табов.

### BaseBreadcrumbs

Хлебные крошки с разделителями и сворачиванием.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `items` | `BreadcrumbItem[]` | — | Элементы крошек |
| `separator` | `'slash' \| 'chevron' \| 'dot' \| 'arrow'` | `'chevron'` | Разделитель |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `maxItems` | `number?` | `0` | Макс. видимых элементов (0 = все) |
| `showHome` | `boolean?` | `false` | Иконка дома вместо первой крошки |
| `homeIcon` | `string?` | — | Иконка дома (имя из спрайта) |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Слоты

| Слот | Описание |
|------|----------|
| `item` | Кастомный элемент крошки (`{ item, index }`) |
| `separator` | Кастомный разделитель (`{ index }`) |
| `home` | Кастомная иконка дома |

### BaseSlider

Карусель/слайдер с анимациями и навигацией.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `items` | `SliderItem[]` | — | Элементы слайдера |
| `animation` | `'slide' \| 'fade' \| 'scale' \| 'flip'` | `'slide'` | Анимация переключения |
| `navigation` | `'dots' \| 'thumbnails' \| 'both' \| 'none'` | `'dots'` | Тип навигации |
| `isAutoplay` | `boolean?` | `false` | Автоматическое воспроизведение |
| `autoplayInterval` | `number?` | — | Интервал автопроигрывания (мс) |
| `hasArrows` | `boolean?` | `false` | Показывать стрелки |
| `arrowsPosition` | `'center' \| 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'center'` | Позиция стрелок |
| `isLoop` | `boolean?` | `false` | Бесконечная прокрутка |
| `isVertical` | `boolean?` | `false` | Вертикальный режим |
| `initialIndex` | `number?` | `0` | Начальный слайд |
| `height` | `string?` | — | Высота слайдера |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Слоты

| Слот | Описание |
|------|----------|
| `default` | Кастомный слайд (`{ item, index }`) |
| `caption` | Подпись к слайду (`{ item, index }`) |

### BaseSlideover

Выдвижная панель слева/справа. Ширина панели управляется через числовой проп `width` — масштабирует только ширину, а не все элементы. Базовая ширина: 420px.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `isOpen` | `boolean` | — | Состояние открытия |
| `title` | `string?` | — | Заголовок |
| `side` | `'left' \| 'right'` | `'right'` | Сторона появления |
| `width` | `number?` | `100` | Масштаб ширины панели (100 = 420px, 150 = 630px, 75 = 315px) |
| `isFullWidth` | `boolean?` | `false` | Полноэкранная панель (100% ширины) |
| `closeOnOverlay` | `boolean?` | `true` | Закрытие по клику на оверлей |
| `closeOnEscape` | `boolean?` | `true` | Закрытие по Escape |

#### Слоты

| Слот | Описание |
|------|----------|
| `default` | Основной контент |
| `header` | Кастомный заголовок |
| `footer` | Кастомный футер |

#### Правила

1. **width — только ширина** — проп `width` устанавливает CSS-переменную `--slideover-width-scale` на корневом элементе. В SCSS ширина панели: `calc(420px * var(--slideover-width-scale, 1))`. Остальные элементы (заголовок, кнопки, отступы) не масштабируются.
2. **Нет sizeScale** — проп `sizeScale` удалён. Для масштабирования всех элементов используйте `useSizeScale` в родительском компоненте.
3. **isFullWidth** — при `true` панель занимает 100% ширины, `--slideover-width-scale` не устанавливается.
4. **Переиспользование** — кнопка закрытия через `BaseButton variant="ghost"`, иконка через `BaseIcon name="close"`, заголовок через `BaseText`. Без запрещённого пропа `size`.
5. **Скроллбар** — `useScrollLock` компенсирует ширину скроллбара через `padding-right` на body, чтобы контент не дёргался при открытии.
6. **width в Storybook** — `control: { type: 'range', min: 50, max: 200, step: 10 }`.

#### Примеры

```vue
<!-- Базовое использование -->
<BaseSlideover v-model:is-open="isOpen" title="Панель">
  <p>Контент</p>
</BaseSlideover>

<!-- Узкая панель (315px) -->
<BaseSlideover v-model:is-open="isOpen" :width="75" title="Фильтры">
  <p>Узкая панель</p>
</BaseSlideover>

<!-- Широкая панель (630px) -->
<BaseSlideover v-model:is-open="isOpen" :width="150" title="Детали">
  <p>Широкая панель</p>
</BaseSlideover>

<!-- Полноэкранная -->
<BaseSlideover v-model:is-open="isOpen" is-full-width title="Полный экран">
  <p>Полноэкранная панель</p>
</BaseSlideover>

<!-- Слева -->
<BaseSlideover v-model:is-open="isOpen" side="left" title="Навигация">
  <p>Панель слева</p>
</BaseSlideover>
```

#### История изменений

- **width** — заменён строковый тип `'sm' | 'md' | 'lg' | 'xl' | 'full'` на числовой `number`. Ширина панели масштабируется через CSS-переменную `--slideover-width-scale`, а не через `useSizeScale`.
- **sizeScale** — проп удалён. Его функцию для ширины берёт `width`.
- **isFullWidth** — новый проп для полноэкранной панели (замена `width: 'full'`).
- **useScrollLock** — компенсация ширины скроллбара через `padding-right` на body.
- **usePopup** — добавлен `{ immediate: true }` в watch для корректной начальной блокировки скролла.
- **Переиспользование** — `BaseButton` и `BaseIcon` без запрещённого пропа `size`.
- **Удалены** — `SlideoverWidth`, `BaseSlideoverSlots` (неиспользуемые типы), стили `__close` (кнопка — `BaseButton`).

### BaseDropdown

Позиционированный выпадающий контейнер.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `isOpen` | `boolean` | — | Открыт ли список |
| `position` | `DropdownPosition` | `'bottom-start'` | Позиция относительно триггера |
| `gap` | `number?` | — | Отступ от триггера (px) |
| `maxHeight` | `string?` | — | Максимальная высота |
| `matchWidth` | `boolean?` | `false` | Мин. ширина = ширина триггера |
| `closeOnEscape` | `boolean?` | `true` | Закрытие по Escape |
| `preventMousedown` | `boolean?` | `true` | Предотвращать mousedown внутри |
| `panelClass` | `string?` | — | CSS-класс панели |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### DropdownPosition

`'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top' | 'left-start' | 'left-end' | 'left' | 'right-start' | 'right-end' | 'right'`

### BaseTable

Таблица с сортировкой, фильтрацией, пагинацией, вложенными строками и инкрементальной подгрузкой.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `columns` | `TableColumn[]` | — | Колонки |
| `rows` | `TableRow[]` | — | Строки |
| `variant` | `'default' \| 'bordered' \| 'striped'` | `'default'` | Вариант |
| `color` | `CustomColor?` | — | Кастомный цвет компонента |
| `isLoading` | `boolean?` | `false` | Загрузка (оверлей + спиннер) |
| `emptyText` | `string?` | `'Нет данных'` | Пустое сообщение |
| `height` | `string?` | — | Высота (фиксированный заголовок) |
| `isSelectable` | `boolean?` | `false` | Выделяемые строки |
| `hasSearch` | `boolean?` | `false` | Показывать поиск |
| `hasFilters` | `boolean?` | `false` | Показывать фильтры |
| `pageSize` | `number?` | `0` | Размер страницы |
| `pageSizeOptions` | `number[]?` | `[]` | Варианты размера страницы |
| `loadMode` | `'pagination' \| 'infinite' \| 'button'` | `'pagination'` | Режим подгрузки |
| `searchDebounce` | `number?` | `300` | Дебаунс поиска (мс), реактивный |
| `nestedConfig` | `NestedTableConfig?` | — | Конфиг вложенной таблицы |
| `isMultiSort` | `boolean?` | `false` | Множественная сортировка |
| `hasColumnSettings` | `boolean?` | `false` | Настройки колонок |
| `hasRowNumber` | `boolean?` | `false` | Номер строки |
| `hasPageSizeSelector` | `boolean?` | `false` | Показывать селектор размера страницы |
| `sizeScale` | `number?` | `100` | Масштаб размера |
| `padding` | `number?` | `10` | Базовый padding ячеек (px). Y = значение, X = значение × 2 |

#### Правила

1. **Нет `size`** — проп `size` запрещён. Размер управляется через `sizeScale`.
2. **Нет `hasMore`** — проп удалён. `hasMoreRows` вычисляется автоматически в `useTableData`: для `button`/`infinite` — пока `loadedCount < processedRows.length`, для `pagination` — не используется.
3. **Инкрементальная подгрузка** — для `button` и `infinite` режимов composable `useTableData` отслеживает `loadedCount`. При вызове `loadMore()` увеличивает счётчик на `pageSize`. `displayedRows` режет `processedRows.slice(0, loadedCount)`.
4. **`isLoading`** — при `true` и наличии строк показывается полупрозрачный оверлей с `backdrop-filter: blur(4px)` поверх таблицы. При `true` и пустых строках — спиннер в ячейке.
5. **Header/Footer слоты** — находятся за пределами границ таблицы (вне `__body`).
6. **Чекбоксы** — все чекбоксы (заголовок + строки) имеют одинаковый размер 16×16px через стили `__th--check` и `__td--check`.
7. **Padding** — проп `padding` (число, px) задаёт отступы ячеек через CSS-переменные `--tbl-pad-y` и `--tbl-pad-x`. Y = значение, X = значение × 2. По умолчанию 10 → 10px 20px. Реализуется через `paddingStyle` computed, применяется через `:style`. Ячейка раскрытия nested-строки (`__td--expand`) имеет `padding: sz(10px) 0` для центрирования кнопки-стрелки.
8. **Нет `border`** — вместо `border` используются `outline` + `outline-offset: -1px` (для обводки) и `box-shadow: inset` (для разделителей сверху/снизу). Это предотвращает смещение размеров ячеек. Замены: `border: 1px solid` → `outline: 1px solid; outline-offset: -1px`, `border-bottom` → `box-shadow: inset 0 -Npx 0 0`, `border-top` → `box-shadow: inset 0 Npx 0 0`, `border: none` → `outline: none`, `border-color` → `outline-color`.

#### Слоты

| Слот | Описание |
|------|----------|
| `default` | Кастомный контент |
| `header` | Кастомный заголовок (за пределами границ) |
| `footer` | Кастомный футер (за пределами границ) |
| `empty` | Пустое состояние |
| `toolbar-prepend` | Контент перед тулбаром |
| `toolbar-append` | Контент после тулбара |
| `expanded-content` | Раскрытый контент строки (`{ row }`) |
| `pagination` | Кастомная пагинация (`{ currentPage, totalPages, visiblePages, pageSize, pageSizeOptions, paginationInfo, pageSizeSelectOptions, handlePageSizeChange }`) |

### BaseCalendar

Календарь с выбором дат, событиями и временем.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `modelValue` | `Date \| null?` | — | Выбранная дата / начало диапазона |
| `modelValueEnd` | `Date \| null?` | — | Конец диапазона (для range) |
| `selectedDates` | `Date[]?` | — | Выбранные даты (для multiple) |
| `selectionMode` | `'single' \| 'range' \| 'multiple'` | `'single'` | Режим выбора |
| `minDate` | `Date \| null?` | — | Минимальная дата |
| `maxDate` | `Date \| null?` | — | Максимальная дата |
| `disabledDates` | `Date[]?` | — | Выключенные даты |
| `disabledWeekdays` | `CalendarWeekday[]?` | — | Выключенные дни недели |
| `highlights` | `CalendarHighlight[]?` | — | Выделенные даты |
| `events` | `CalendarEvent[]?` | — | События |
| `weekends` | `CalendarWeekends \| null?` | — | Конфигурация выходных |
| `firstDayOfWeek` | `CalendarWeekday?` | `1` | Первый день недели |
| `showTime` | `boolean?` | `false` | Показывать выбор времени |
| `showSeconds` | `boolean?` | `false` | Показывать секунды |
| `is24Hour` | `boolean?` | `true` | Формат 24ч |
| `showWeekNumber` | `boolean?` | `false` | Номер недели |
| `locale` | `string?` | — | Локаль |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `showDatePopover` | `boolean?` | `false` | Popover при клике на дату |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Слоты

| Слот | Описание |
|------|----------|
| `day` | Кастомная ячейка дня (`{ date, isToday, isSelected, isDisabled, isWeekend, isInRange }`) |
| `header` | Кастомный заголовок (`{ month, year }`) |
| `event` | Кастомное событие (`{ event }`) |
| `navigation` | Кастомная навигация |

### BaseChat

Чат-виджет с вариантами отображения.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `messages` | `ChatMessage[]?` | — | Сообщения |
| `variant` | `'bubble' \| 'modern' \| 'minimal' \| 'support' \| 'sidebar' \| 'thread' \| 'feed'` | `'bubble'` | Вариант |
| `hasInput` | `boolean?` | `true` | Поле ввода |
| `hasHeader` | `boolean?` | `true` | Заголовок |
| `title` | `string?` | — | Заголовок чата |
| `subtitle` | `string?` | — | Подзаголовок |
| `companionAvatar` | `string?` | — | Аватар собеседника |
| `inputPlaceholder` | `string?` | — | Плейсхолдер ввода |
| `height` | `string?` | — | Высота чата |
| `isAutoScroll` | `boolean?` | `true` | Автопрокрутка |
| `participants` | `ChatParticipant[]?` | — | Участники группового чата |
| `isGroup` | `boolean?` | `false` | Групповой чат |
| `hasVoiceInput` | `boolean?` | `false` | Кнопка голосового ввода |
| `hasAttachInput` | `boolean?` | `false` | Кнопка вложений |
| `hasImageZoom` | `boolean?` | `false` | Зум изображений |
| `quickReplies` | `ChatQuickReply[]?` | — | Быстрые ответы (support) |
| `isOperatorOnline` | `boolean?` | `false` | Статус оператора (support) |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Слоты

| Слот | Описание |
|------|----------|
| `header` | Кастомный заголовок |
| `message` | Кастомное сообщение (`{ message, index }`) |
| `input` | Кастомное поле ввода |
| `empty` | Пустой чат |

### BaseAccordion

Раскрывающийся список с вариантами и кастомными цветами.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `items` | `BaseAccordionItem[]` | — | Список элементов |
| `isMultiple` | `boolean?` | `false` | Открывать несколько элементов |
| `variant` | `'default' \| 'ghost' \| 'bordered'` | `'default'` | Вариант отображения |
| `sizeScale` | `number?` | `100` | Масштаб размера |
| `color` | `CustomColor?` | — | Кастомный цвет |

### BaseAnimation

Утилита для анимаций (Transition / TransitionGroup).

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `show` | `boolean?` | `true` | Управление видимостью |
| `name` | `TransitionName` | `'fade'` | Имя анимации |
| `mode` | `'out-in' \| 'in-out' \| 'default'` | `'out-in'` | Режим анимации |
| `isGroup` | `boolean?` | `false` | TransitionGroup для списков |
| `tag` | `string?` | — | HTML-тег для TransitionGroup |

#### TransitionName

`'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'bounce' | 'rotate' | 'flip' | 'zoom' | 'collapse' | 'list'`

### BaseAvatar

Аватар пользователя (изображение или инициалы).

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `src` | `string?` | — | URL изображения |
| `alt` | `string?` | — | Альтернативный текст |
| `name` | `string?` | — | Текст для генерации инициалов |
| `shape` | `'circle' \| 'square'` | `'circle'` | Форма |
| `variant` | `'default' \| 'ghost' \| 'outline' \| 'shadow' \| 'soft'` | `'default'` | Вариант |
| `isOnline` | `boolean?` | `false` | Онлайн-статус |
| `sizeScale` | `number?` | `100` | Масштаб размера |

### BaseBadge

Информационный бейдж.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `label` | `string?` | — | Текст |
| `variant` | `'default' \| 'ghost' \| 'outline' \| 'shadow' \| 'soft'` | `'default'` | Вариант |
| `sizeScale` | `number?` | `100` | Масштаб размера |

### BaseSkeleton

Заглушка для загрузки. Не использует `useVariant` и `useCustomColor` — скелетон неинтерактивный элемент-заглушка, цвет фона задаётся строкой через проп `color`. Не использует `@include interactive` — нет hover/active/focus состояний.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `width` | `string \| number?` | — | Ширина (px или %) |
| `height` | `string \| number?` | — | Высота (px или %) |
| `shape` | `'text' \| 'circle' \| 'rect'` | `'rect'` | Форма |
| `isAnimated` | `boolean?` | `true` | Анимация shimmer |
| `color` | `string?` | — | Кастомный цвет фона (CSS-значение) |
| `isPulse` | `boolean?` | `false` | Пульсация |
| `sizeScale` | `number?` | `100` | Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) |

#### Правила

1. **Без variant** — BaseSkeleton не имеет пропа `variant` и не использует `useVariant`. Скелетон — неинтерактивный элемент-заглушка, визуальные варианты (ghost, outline и т.д.) не нужны.
2. **color — строка** — проп `color` принимает строку (CSS-значение цвета), а не `CustomColor`. Скелетону нужен только цвет фона, без состояний hover/active/focus. Применяется напрямую как `backgroundColor` через inline style.
3. **sizeScale — прямое масштабирование** — `sizeScale` масштабирует `width`/`height` напрямую через computed `skeletonStyle`: числовые значения умножаются на scale, строковые — через `calc()`. Также устанавливается CSS-переменная `--size-scale` для SCSS-функции `sz()` (border-radius, дефолтные размеры shape).
4. **Без interactive** — скелетон не использует `@include interactive`, так как не имеет hover/active/focus состояний.
5. **Единый computed стилей** — все inline-стили (width, height, color, --size-scale) вычисляются в одном `skeletonStyle` computed, а не через отдельные composables.

#### Примеры

```vue
<!-- Текстовая заглушка -->
<BaseSkeleton shape="text" width="100%" height="16px" />

<!-- Круглая заглушка (аватар) -->
<BaseSkeleton shape="circle" width="64px" height="64px" />

<!-- Прямоугольная заглушка (карточка) -->
<BaseSkeleton shape="rect" width="100%" height="180px" />

<!-- С пульсацией -->
<BaseSkeleton shape="text" width="80%" height="20px" :is-pulse="true" />

<!-- Без анимации -->
<BaseSkeleton shape="rect" width="100%" height="120px" :is-animated="false" />

<!-- Кастомный цвет фона -->
<BaseSkeleton shape="text" width="100%" height="16px" color="#e0e7ff" />

<!-- Масштабирование -->
<BaseSkeleton shape="text" width="100%" height="16px" :size-scale="150" />
```

### BaseCard

Универсальный контейнер с заголовком, футером и изображением.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `title` | `string?` | — | Заголовок |
| `subtitle` | `string?` | — | Подзаголовок |
| `image` | `string?` | — | URL изображения |
| `imageAlt` | `string?` | — | Альт. текст изображения |
| `isHoverable` | `boolean?` | `false` | Интерактивная карточка |
| `variant` | `'default' \| 'outline' \| 'ghost' \| 'elevated'` | `'default'` | Вариант |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `scroll` | `boolean?` | `false` | Прокрутка тела |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Слоты

| Слот | Описание |
|------|----------|
| `default` | Основной контент (`{ sizeScale }`) |
| `header` | Кастомный заголовок (`{ sizeScale }`) |
| `footer` | Кастомный футер (`{ sizeScale }`) |
| `overlay` | Контент поверх изображения (`{ sizeScale }`) |
| `actions` | Действия в заголовке (`{ sizeScale }`) |

### BaseCheckbox

Флажок.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `modelValue` | `boolean` | — | Состояние |
| `label` | `string?` | — | Заголовок |
| `isDisabled` | `boolean?` | `false` | Отключенное состояние |
| `hasError` | `boolean?` | `false` | Состояние ошибки |
| `sizeScale` | `number?` | `100` | Масштаб размера |

### BaseSwitch

Переключатель с label, error, isRequired, reverse и слотами. Структура: обёртка `div.base-switch` с элементами `__row`, `__wrapper`, `__slider`, `__handle`, `__content`, `__label`, `__required`, `__error-text`.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `modelValue` | `boolean` | — | Состояние |
| `label` | `string?` | — | Заголовок поля |
| `error` | `string?` | — | Текст ошибки |
| `isRequired` | `boolean?` | `false` | Обязательное поле |
| `isDisabled` | `boolean?` | `false` | Отключенное состояние |
| `reverse` | `boolean?` | `false` | Обратный порядок (контент слева, переключатель справа) |
| `variant` | `'default' \| 'outline' \| 'shadow'` | `'default'` | Вариант отображения |
| `color` | `CustomColor?` | — | Кастомный цвет компонента |
| `sizeScale` | `number?` | `100` | Масштаб размера |

#### Слоты

| Слот | Описание |
|------|----------|
| `default` | Контент рядом с переключателем (дополнение к label) |
| `label` | Кастомный заголовок поля (заменяет prop label) |
| `error` | Кастомный текст ошибки (заменяет prop error) |

#### Правила

1. **Структура** — компонент обёрнут в `div.base-switch` (не голый `<label>`). Внутри `__row` содержит переключатель и контент.
2. **Ошибка** — проп `error: string` вместо `hasError: boolean`. Текст ошибки выводится через `<BaseText class="base-switch__error-text">`. Класс `--error` вешается на корневой div.
3. **Label** — выводится через `<BaseText class="base-switch__label">`. Звёздочка `*` для обязательного поля через `<BaseText class="base-switch__required">`.
4. **isRequired** — показывает звёздочку `*` рядом с label. Не валидирует — только визуальный индикатор.
5. **Reverse** — модификатор `--reverse` меняет порядок через `flex-direction: row-reverse` на `__row`.
6. **Variant outline** — прозрачный фон слайдера, рамка 2px, handle серый в off-состоянии и белый в on. При включении фон заливается акцентным цветом, рамка тоже акцентная.
7. **Variant shadow** — добавляет `box-shadow` к слайдеру, при hover усиливается.
8. **Связь label-input** — `useId()` генерирует уникальный id для input, label ссылается через `:for="inputId"`.
9. **Варианты ghost/soft удалены** — не используются визуально для переключателя. Доступны только `default`, `outline`, `shadow`.

#### Примеры

```vue
<!-- Базовое использование -->
<BaseSwitch v-model="value" label="Уведомления" />

<!-- Обязательное поле -->
<BaseSwitch v-model="value" label="Согласие" is-required />

<!-- С ошибкой -->
<BaseSwitch v-model="value" label="Уведомления" error="Необходимо включить" />

<!-- Обратный порядок -->
<BaseSwitch v-model="value" label="Тёмная тема" reverse />

<!-- Вариант outline -->
<BaseSwitch v-model="value" label="Звуки" variant="outline" />

<!-- Слот default — доп. описание -->
<BaseSwitch v-model="value" label="Уведомления">
  <span style="color: var(--color-text-muted); font-size: 13px;">— получать push</span>
</BaseSwitch>

<!-- Слот label — кастомный заголовок -->
<BaseSwitch v-model="value">
  <template #label><strong>Кастомный лейбл</strong></template>
</BaseSwitch>

<!-- Слот error — кастомная ошибка -->
<BaseSwitch v-model="value" error=" ">
  <template #error><em>Необходимо принять условия</em></template>
</BaseSwitch>
```

### BaseFileUpload

Загрузка файлов.

#### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `accept` | `string?` | — | Принимаемые типы файлов |
| `isMultiple` | `boolean?` | `false` | Множественный выбор |
| `isDisabled` | `boolean?` | `false` | Отключенное состояние |
| `maxSize` | `number?` | — | Макс. размер файла (MB) |
| `maxCount` | `number?` | — | Макс. количество файлов |
| `label` | `string?` | — | Заголовок |
| `buttonText` | `string?` | — | Текст кнопки |
| `previewSize` | `number?` | — | Размер превью (px) |
| `allowPreview` | `boolean?` | `false` | Предпросмотр изображений |
| `emptyText` | `string?` | — | Текст пустой зоны |
| `sizeScale` | `number?` | `100` | Масштаб размера |

## Composables (утилиты)

### useSizeScale

Масштабирование размера компонента через CSS-переменную `--size-scale`.

```ts
import { useSizeScale } from '@/shared/composables/useSizeScale'

const props = withDefaults(defineProps<{ sizeScale?: number }>(), { sizeScale: 100 })
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
```

В SCSS используется функция `sz()` для умножения базовых значений на `--size-scale`.

### useIcon

Composable для работы с SVG-иконками из спрайта. Спрайт генерируется Vite-плагином из папки `src/assets/svg/`.

```ts
import { useIcon } from '@/shared/composables/useIcon'

const { spritePath, getIconUrl, isIconExists, getIconNames } = useIcon()
```

#### Возвращаемые значения

| Свойство | Тип | Описание |
|----------|-----|----------|
| `spritePath` | `string` | Путь к SVG-спрайту (`/icons.svg`) |
| `getIconUrl` | `(name: string) => string` | URL иконки из спрайта по имени |
| `isIconExists` | `(name: string, names: string[]) => boolean` | Проверка существования иконки |
| `getIconNames` | `() => string[]` | Список имён всех иконок из спрайта |

#### Плагин iconPlugin

Vue-плагин для глобальной регистрации `BaseIcon`. После `app.use(iconPlugin())` компонент доступен как `<BaseIcon>` без импорта.

```ts
import { createIconPlugin } from '@/shared/composables/useIcon'

app.use(createIconPlugin({ componentName: 'BaseIcon' }))
```

### useCustomColor

Кастомный цвет компонента: background и text раздельно, каждое со своими состояниями hover, active, focus.

```ts
import { useCustomColor } from '@/shared/composables/useCustomColor'
import type { CustomColor } from '@/shared/composables/useCustomColor'

const props = defineProps<{ color?: CustomColor }>()
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
```

#### Интерфейс CustomColor

| Поле | Тип | Описание |
|------|-----|----------|
| `bg` | `ColorStates?` | Кастомный цвет фона |
| `text` | `ColorStates?` | Кастомный цвет текста |

#### Интерфейс ColorStates

| Поле | Тип | Описание |
|------|-----|----------|
| `base` | `string?` | Базовый цвет (hex, rgb, CSS-переменная) |
| `hover` | `string?` | Цвет при наведении |
| `active` | `string?` | Цвет при нажатии |
| `focus` | `string?` | Цвет при фокусе |

#### CSS-переменные

| Переменная | Описание |
|------------|----------|
| `--custom-bg` | Базовый цвет фона |
| `--custom-bg-hover` | Цвет фона при наведении |
| `--custom-bg-active` | Цвет фона при нажатии |
| `--custom-bg-focus` | Цвет фона при фокусе |
| `--custom-text` | Базовый цвет текста |
| `--custom-text-hover` | Цвет текста при наведении |
| `--custom-text-active` | Цвет текста при нажатии |
| `--custom-text-focus` | Цвет текста при фокусе |

#### SCSS-миксины для custom-bg

| Миксин | Назначение |
|--------|-----------|
| `@include custom-bg($prop, $fallback)` | Базовый цвет фона с fallback |
| `@include custom-bg-hover($prop, $fallback)` | Hover фона (цепочка: hover → base → fallback) |
| `@include custom-bg-active($prop, $fallback)` | Active фона (цепочка: active → base → fallback) |
| `@include custom-bg-focus($prop, $fallback)` | Focus фона |
| `@include custom-bg-all($prop, $base, $hover, $active, $focus)` | Все состояния фона |

#### SCSS-миксины для custom-text

| Миксин | Назначение |
|--------|-----------|
| `@include custom-text($prop, $fallback)` | Базовый цвет текста с fallback |
| `@include custom-text-hover($prop, $fallback)` | Hover текста (цепочка: hover → base → fallback) |
| `@include custom-text-active($prop, $fallback)` | Active текста (цепочка: active → base → fallback) |
| `@include custom-text-focus($prop, $fallback)` | Focus текста |
| `@include custom-text-all($prop, $base, $hover, $active, $focus)` | Все состояния текста |

```scss
// Пример: кнопка с кастомным цветом
.base-button {
  @include custom-bg-all(background-color, var(--color-accent), var(--color-accent-hover), var(--color-accent));
  @include custom-text(color, #ffffff);
}

// Пример: аккордеон с кастомным акцентом
.base-accordion__header {
  @include custom-bg-hover(background-color, var(--color-surface-muted));
  @include custom-bg-focus(box-shadow, inset 0 0 0 2px var(--color-accent));
  @include custom-text(color, var(--color-accent));
}
```

#### Пример использования в компоненте

```vue
<!-- Только кастомный фон -->
<BaseAccordion :items="items" :color="{ bg: { base: '#8b5cf6', hover: '#7c3aed' } }" />

<!-- Фон и текст -->
<BaseButton :color="{ bg: { base: '#059669', hover: '#047857' }, text: { base: '#ffffff' } }">
  Зелёная кнопка
</BaseButton>

<!-- Только текст -->
<BaseText :color="{ text: { base: '#dc2626' } }">Ошибка</BaseText>
```

Когда `color` не передан — используются fallback-значения из темы. Когда передан — CSS-переменные переопределяют цвета. Каскадные fallback (`--custom-bg-hover → --custom-bg → $fallback`) обеспечивают разумные значения даже если указан только `base`.

### useAutoScroll

Автопрокрутка контейнера к низу при изменении данных.

```ts
import { useAutoScroll } from '@/shared/composables/useAutoScroll'

const containerRef = ref<HTMLElement | null>(null)
const { scrollToBottom } = useAutoScroll({
  container: containerRef,
  enabled: () => props.isAutoScroll,
  watchSource: () => props.messages.length,
})
```

#### Параметры (UseAutoScrollOptions)

| Параметр | Тип | Описание |
|----------|-----|----------|
| `container` | `Ref<HTMLElement \| null>` | Ref на контейнер для прокрутки |
| `enabled` | `() => boolean` | Включена ли автопрокрутка |
| `watchSource` | `() => unknown` | Источник данных для отслеживания изменений |

#### Возвращаемые значения

| Свойство | Тип | Описание |
|----------|-----|----------|
| `scrollToBottom` | `() => void` | Программная прокрутка к низу |

### useClickOutside

Отслеживание клика вне заданных элементов. Автоматически подписывается/отписывается на lifecycle-хуки.

```ts
import { useClickOutside } from '@/shared/composables/useClickOutside'

const wrapperRef = ref<HTMLElement | null>(null)
useClickOutside({
  targets: [wrapperRef],
  callback: () => emit('close'),
  isActive: () => props.isOpen,
})
```

#### Параметры (UseClickOutsideOptions)

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|----------|
| `targets` | `Ref<HTMLElement \| null>[]` | — | Массив ref-ов на отслеживаемые элементы |
| `callback` | `() => void` | — | Callback при клике вне элементов |
| `isCapture` | `boolean?` | `false` | Использовать capture-фазу |
| `isActive` | `() => boolean?` | — | Активен ли слушатель |

### useDebounce / useDebounceFn

Дебаунс значения или функции.

```ts
import { useDebounce, useDebounceFn } from '@/shared/composables/useDebounce'

// Дебаунс ref-значения
const debouncedQuery = useDebounce(searchQuery, 300)
watch(debouncedQuery, (val) => { emit('search', val) })

// Дебаунс функции
const debouncedSearch = useDebounceFn((query: string) => {
  emit('search', query)
}, 300)
```

| Функция | Сигнатура | Описание |
|---------|-----------|----------|
| `useDebounce` | `<T>(value: T, delay: number) => Ref<T>` | Возвращает ref, обновляющийся с задержкой |
| `useDebounceFn` | `<A>(fn: (...args: A) => void, delay: number) => (...args: A) => void` | Возвращает обёрнутую функцию с задержкой |

### useDropdownPosition

Позиционирование выпадающей панели относительно триггера. Поддерживает 12 позиций.

```ts
import { useDropdownPosition } from '@/shared/composables/useDropdownPosition'

const { panelStyle, updatePosition } = useDropdownPosition({
  wrapperRef,
  dropdownRef,
  position: () => props.position,
  gap: () => props.gap,
  matchWidth: () => props.matchWidth,
  maxHeight: () => props.maxHeight,
  isOpen: () => props.isOpen,
})
```

#### Параметры (UseDropdownPositionOptions)

| Параметр | Тип | Описание |
|----------|-----|----------|
| `wrapperRef` | `Ref<HTMLElement \| null>` | Ref на wrapper-элемент (содержит триггер) |
| `dropdownRef` | `Ref<HTMLElement \| null>` | Ref на dropdown-панель |
| `position` | `() => DropdownPosition` | Позиция выпадающего списка |
| `gap` | `() => number` | Отступ от триггера (px) |
| `matchWidth` | `() => boolean` | Мин. ширина панели = ширина триггера |
| `maxHeight` | `() => string` | Максимальная высота панели |
| `isOpen` | `() => boolean` | Открыт ли dropdown |

#### Возвращаемые значения

| Свойство | Тип | Описание |
|----------|-----|----------|
| `panelStyle` | `ComputedRef<Record<string, string>>` | CSS-стили панели |
| `updatePosition` | `() => void` | Пересчитать позицию |

### useEscapeKey

Закрытие по клавише Escape. Автоматически подписывается/отписывается на lifecycle-хуки.

```ts
import { useEscapeKey } from '@/shared/composables/useEscapeKey'

useEscapeKey({
  isActive: () => props.isOpen,
  callback: () => emit('close'),
})
```

#### Параметры (UseEscapeKeyOptions)

| Параметр | Тип | Описание |
|----------|-----|----------|
| `isActive` | `() => boolean` | Активен ли слушатель (компонент открыт) |
| `callback` | `() => void` | Callback при нажатии Escape |

### useImageZoom

Зум изображения: масштаб, поворот, перетаскивание, мини-карта.

```ts
import { useImageZoom } from '@/shared/composables/useImageZoom'

const zoom = useImageZoom({
  initialScale: () => props.initialScale,
  zoomStep: () => props.zoomStep,
  minScale: () => props.minScale,
  maxScale: () => props.maxScale,
  closeOnOverlay: () => props.closeOnOverlay,
  onZoom: (scale) => emit('zoom', scale),
})
```

#### Параметры (UseImageZoomOptions)

| Параметр | Тип | Описание |
|----------|-----|----------|
| `initialScale` | `() => number` | Начальный масштаб |
| `zoomStep` | `() => number` | Шаг изменения масштаба |
| `minScale` | `() => number` | Минимальный масштаб |
| `maxScale` | `() => number` | Максимальный масштаб |
| `closeOnOverlay` | `() => boolean` | Закрывать по клику на оверлей |
| `onZoom` | `(scale: number) => void?` | Callback при изменении масштаба |

#### Возвращаемые значения

| Свойство | Тип | Описание |
|----------|-----|----------|
| `isZoomOpen` | `Ref<boolean>` | Открыт ли зум |
| `currentScale` | `Ref<number>` | Текущий масштаб |
| `scalePercent` | `ComputedRef<number>` | Процент масштаба |
| `isMinScale` | `ComputedRef<boolean>` | Достигнут мин. масштаб |
| `isMaxScale` | `ComputedRef<boolean>` | Достигнут макс. масштаб |
| `rotation` | `Ref<number>` | Угол поворота |
| `zoomImageStyle` | `ComputedRef<Record<string, string>>` | Стили изображения в зуме |
| `minimapViewportStyle` | `ComputedRef<Record<string, string>>` | Стили viewport мини-карты |
| `minimapImageStyle` | `ComputedRef<Record<string, string>>` | Стили изображения мини-карты |
| `openZoom` | `() => void` | Открыть зум |
| `closeZoom` | `() => void` | Закрыть зум |
| `zoomIn` | `() => void` | Приблизить |
| `zoomOut` | `() => void` | Отдалить |
| `resetZoom` | `() => void` | Сбросить масштаб |
| `rotateLeft` | `() => void` | Повернуть влево |
| `rotateRight` | `() => void` | Повернуть вправо |
| `handleOverlayClick` | `() => void` | Клик по оверлею |
| `handleImageMouseDown` | `(e: MouseEvent) => void` | Начало перетаскивания |
| `handleImageMouseMove` | `(e: MouseEvent) => void` | Перетаскивание |
| `handleImageMouseUp` | `() => void` | Конец перетаскивания |

### useInputMask

Маска ввода: фиксированные (#, @, *) и жадные (N, A, X) токены.

```ts
import { useInputMask } from '@/shared/composables/useInputMask'

const { maskedValue, handleInput, handleKeydown } = useInputMask({
  getMask: () => props.mask,
})
```

#### Токены маски

| Токен | Описание |
|-------|----------|
| `#` | Цифра (ровно 1) |
| `@` | Буква (ровно 1) |
| `*` | Любой непробельный символ (ровно 1) |
| `N` | Цифры (1 или более) |
| `A` | Буквы (1 или более) |
| `X` | Буквы и цифры (1 или более) |
| `\x` | Экранирование литерала |

#### Параметры (UseInputMaskOptions)

| Параметр | Тип | Описание |
|----------|-----|----------|
| `getMask` | `() => string` | Маска ввода |

### useListNavigation

Навигация по списку клавишами ArrowUp/ArrowDown/Enter/Escape.

```ts
import { useListNavigation } from '@/shared/composables/useListNavigation'

const { highlightedIndex, handleKeydown, reset } = useListNavigation({
  itemCount: () => visibleResults.value.length,
  onSelect: (index) => handleSelect(visibleResults.value[index]),
  onEscape: () => emit('close'),
})
```

#### Параметры (UseListNavigationOptions)

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|----------|
| `itemCount` | `() => number` | — | Количество элементов в списке |
| `onSelect` | `(index: number) => void` | — | Callback при выборе (Enter) |
| `onEscape` | `() => void?` | — | Callback при нажатии Escape |
| `isLoop` | `boolean?` | `false` | Циклическая навигация |

#### Возвращаемые значения

| Свойство | Тип | Описание |
|----------|-----|----------|
| `highlightedIndex` | `Ref<number>` | Индекс подсвеченного элемента (-1 = нет) |
| `handleKeydown` | `(e: KeyboardEvent) => void` | Обработчик клавиш |
| `reset` | `() => void` | Сбросить подсветку |

### usePopup

Паттерн popup: оверлей, Escape, блокировка скролла. Комбинирует `useEscapeKey` и `useScrollLock`.

```ts
import { usePopup } from '@/shared/composables/usePopup'

const { handleOverlayClick, close } = usePopup({
  isOpen: () => props.isOpen,
  closeOnOverlay: () => props.closeOnOverlay,
  closeOnEscape: () => props.closeOnEscape,
  onClose: () => {
    emit('update:isOpen', false)
    emit('close')
  },
})
```

#### Параметры (UsePopupOptions)

| Параметр | Тип | Описание |
|----------|-----|----------|
| `isOpen` | `() => boolean` | Открыт ли popup |
| `closeOnOverlay` | `() => boolean` | Закрытие по клику на оверлей |
| `closeOnEscape` | `() => boolean` | Закрытие по Escape |
| `onClose` | `() => void` | Callback при закрытии |

#### Возвращаемые значения

| Свойство | Тип | Описание |
|----------|-----|----------|
| `handleOverlayClick` | `() => void` | Клик по оверлею |
| `close` | `() => void` | Закрыть popup |

### useScrollLock

Блокировка скролла body. Идемпотентный: повторный lock/unlock безопасен.

```ts
import { useScrollLock } from '@/shared/composables/useScrollLock'

const { lock, unlock } = useScrollLock()
watch(() => props.isOpen, (value) => {
  value ? lock() : unlock()
})
```

#### Возвращаемые значения

| Свойство | Тип | Описание |
|----------|-----|----------|
| `lock` | `() => void` | Заблокировать скролл body |
| `unlock` | `() => void` | Разблокировать скролл body |

### useSwipe

Обработка свайпа и перетаскивания (touch + mouse). RAF-оптимизация.

```ts
import { useSwipe } from '@/shared/composables/useSwipe'

const { isDragging, dragOffset, onTouchStart, onTouchMove, onTouchEnd, onDragStart } = useSwipe({
  isVertical: () => props.isVertical,
  threshold: 50,
  onSwipeNext: goNext,
  onSwipePrev: goPrev,
  onDragOffset: (offset) => { dragOffset.value = offset },
})
```

#### Параметры (UseSwipeOptions)

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|----------|
| `isVertical` | `() => boolean` | — | Вертикальный режим |
| `threshold` | `number?` | `50` | Порог срабатывания свайпа (px) |
| `onSwipeNext` | `() => void` | — | Callback при свайпе вперёд |
| `onSwipePrev` | `() => void` | — | Callback при свайпе назад |
| `onDragOffset` | `(offset: number) => void?` | — | Callback при обновлении смещения |

#### Возвращаемые значения

| Свойство | Тип | Описание |
|----------|-----|----------|
| `isDragging` | `Ref<boolean>` | Идёт ли перетаскивание |
| `dragOffset` | `Ref<number>` | Текущее смещение перетаскивания |
| `onTouchStart` | `(e: TouchEvent) => void` | Обработчик начала касания |
| `onTouchMove` | `(e: TouchEvent) => void` | Обработчик движения касания |
| `onTouchEnd` | `(e: TouchEvent) => void` | Обработчик окончания касания |
| `onDragStart` | `(e: MouseEvent) => void` | Обработчик начала перетаскивания мышью |

### useTableData

Сортировка, фильтрация, пагинация, поиск и инкрементальная подгрузка таблицы.

```ts
import { useTableData } from '@/shared/composables/useTableData'

const {
  searchQuery, sortStates, activeFilters,
  processedRows, displayedRows, currentPage, totalPages, visiblePages,
  hasMoreRows,
  getSortDirection, handleSort, handleSearchInput, addFilter, removeFilter,
  loadMore,
} = useTableData({
  rows: computed(() => props.rows),
  columns: localColumns,
  loadMode: () => props.loadMode,
  pageSize: computed(() => props.pageSize),
  isMultiSort: () => props.isMultiSort,
  searchDebounce: () => props.searchDebounce,
  onSearch: (q) => emit('search', q),
  onSort: (s) => emit('sort', s),
  onFilter: (f) => emit('filter', f),
  onPageSizeChange: (size) => emit('page-size-change', size),
})
```

#### Параметры (UseTableDataOptions)

| Параметр | Тип | Описание |
|----------|-----|----------|
| `rows` | `Ref<TableRow[]>` | Строки данных |
| `columns` | `Ref<TableColumn[]>` | Колонки |
| `loadMode` | `() => string` | Режим подгрузки |
| `pageSize` | `Ref<number>` | Размер страницы |
| `isMultiSort` | `() => boolean` | Множественная сортировка |
| `searchDebounce` | `() => number` | Дебаунс поиска (мс), реактивный getter |
| `onSearch` | `(query: string) => void?` | Callback при поиске |
| `onSort` | `(states: SortState[]) => void?` | Callback при сортировке |
| `onFilter` | `(filters: ColumnFilter[]) => void?` | Callback при фильтрации |
| `onPageSizeChange` | `(size: number) => void?` | Callback при изменении размера страницы |

#### Возвращаемые значения

| Свойство | Тип | Описание |
|----------|-----|----------|
| `searchQuery` | `Ref<string>` | Текущий поисковый запрос |
| `sortStates` | `Ref<SortState[]>` | Состояния сортировки |
| `activeFilters` | `Ref<ColumnFilter[]>` | Активные фильтры |
| `processedRows` | `ComputedRef<TableRow[]>` | Строки после сортировки/фильтрации/поиска |
| `displayedRows` | `ComputedRef<TableRow[]>` | Отображаемые строки (с учётом пагинации/подгрузки) |
| `currentPage` | `Ref<number>` | Текущая страница |
| `totalPages` | `ComputedRef<number>` | Общее количество страниц |
| `visiblePages` | `ComputedRef<number[]>` | Видимые номера страниц |
| `isAllSelected` | `ComputedRef<boolean>` | Все ли строки выбраны |
| `hasMoreRows` | `ComputedRef<boolean>` | Есть ли ещё данные для подгрузки (автоматически) |
| `loadMore` | `() => void` | Подгрузить ещё данные (увеличивает loadedCount) |
| `onPageSizeChange` | `(size: number) => void?` | Callback при изменении размера страницы |

## Утилиты (utils)

### dateUtils

Работа с датами для BaseCalendar и других компонентов.

```ts
import { isSameDay, toDateOnly, daysInMonth, getWeekday, getWeekNumber, buildDateWithTime, isToday, isDateInRange } from '@/shared/utils/dateUtils'
```

| Функция | Сигнатура | Описание |
|---------|-----------|----------|
| `isSameDay` | `(a: Date, b: Date) => boolean` | Сравнить две даты без учёта времени |
| `toDateOnly` | `(d: Date) => Date` | Дата без времени (обнулить часы, минуты, секунды) |
| `daysInMonth` | `(year: number, month: number) => number` | Количество дней в месяце |
| `getWeekday` | `(date: Date) => number` | День недели (0 = воскресенье) |
| `getWeekNumber` | `(date: Date) => number` | Номер недели по ISO 8601 |
| `buildDateWithTime` | `(options: BuildDateOptions) => Date` | Собрать дату с указанным временем |
| `isToday` | `(date: Date) => boolean` | Является ли дата сегодняшней |
| `isDateInRange` | `(date: Date, start: Date, end: Date) => boolean` | Дата в диапазоне (исключая границы) |

### fileUtils

Работа с файлами для BaseFileUpload.

```ts
import { getExtension, formatFileSize, getFileIcon, validateFile, formatAcceptHint, createImagePreview } from '@/shared/utils/fileUtils'
```

| Функция | Сигнатура | Описание |
|---------|-----------|----------|
| `getExtension` | `(name: string) => string` | Расширение файла из имени |
| `formatFileSize` | `(bytes: number) => string` | Форматирование размера (Б/КБ/МБ) |
| `getFileIcon` | `(extension: string) => string` | Эмодзи-иконка по расширению |
| `validateFile` | `(file: File, options: FileValidationOptions) => FileValidationResult` | Валидация файла по размеру и типу |
| `formatAcceptHint` | `(accept: string) => string` | Подсказка по допустимым форматам |
| `createImagePreview` | `(file: File) => Promise<string \| null>` | Превью изображения через FileReader |

### formatUtils

Форматирование данных для компонентов отображения.

```ts
import { formatMessageStatus, formatUrl, formatDateLong, formatCellValue } from '@/shared/utils/formatUtils'
```

| Функция | Сигнатура | Описание |
|---------|-----------|----------|
| `formatMessageStatus` | `(status: string) => string` | Иконка статуса доставки сообщения |
| `formatUrl` | `(url: string) => string` | URL для отображения (только hostname) |
| `formatDateLong` | `(date: Date, locale: string) => string` | Дата для popover-подсказки |
| `formatCellValue` | `(value: unknown, formatter?: (val: unknown) => string) => string` | Значение ячейки таблицы |

### imageUtils

Оптимизация изображений для BaseImage.

```ts
import { isExternalImage, replaceExtension, buildOptimizedSrc, buildSrcset } from '@/shared/utils/imageUtils'
```

| Функция | Сигнатура | Описание |
|---------|-----------|----------|
| `isExternalImage` | `(src: string) => boolean` | Проверить, является ли URL внешним |
| `replaceExtension` | `(src: string, newExt: string) => string` | Заменить расширение файла, сохраняя query |
| `buildOptimizedSrc` | `(src: string, srcWidth?: number) => string` | Оптимизированный src с параметром ширины |
| `buildSrcset` | `(src: string, srcWidth?: number) => string \| undefined` | Srcset для адаптивных изображений |

### navigationUtils

Навигация для BaseBreadcrumbs, BaseMenu и ссылок.

```ts
import { openExternalUrl, resolveNavigation } from '@/shared/utils/navigationUtils'
```

| Функция | Сигнатура | Описание |
|---------|-----------|----------|
| `openExternalUrl` | `(url: string, target?: '_blank' \| '_self') => void` | Открыть внешнюю ссылку безопасно (noopener) |
| `resolveNavigation` | `(options: NavigateOptions) => { type, url }` | Определить тип навигации (internal/external/none) |

### paginationUtils

Расчёт пагинации для BasePagination и BaseTable.

```ts
import { calcTotalPages, calcVisiblePages, calcPageInfo } from '@/shared/utils/paginationUtils'
```

| Функция | Сигнатура | Описание |
|---------|-----------|----------|
| `calcTotalPages` | `(total: number, pageSize: number) => number` | Общее количество страниц |
| `calcVisiblePages` | `(options: VisiblePagesOptions) => number[]` | Массив видимых номеров страниц |
| `calcPageInfo` | `(options: PageInfoOptions) => string` | Строка информации о странице («1–10 из 100») |

### rangeUtils

Расчёты для BaseRange.

```ts
import { toPercent, snapToStep, calcFillStyle, calcThumbStyle } from '@/shared/utils/rangeUtils'
```

| Функция | Сигнатура | Описание |
|---------|-----------|----------|
| `toPercent` | `(options: RangeScaleOptions) => number` | Процент значения на шкале (0–100) |
| `snapToStep` | `(options: SnapToStepOptions) => number` | Привязать значение к ближайшему шагу |
| `calcFillStyle` | `(firstPercent: number, secondPercent?: number) => Record<string, string>` | CSS-стиль заливки трека |
| `calcThumbStyle` | `(percent: number) => Record<string, string>` | CSS-стиль позиции ползунка |

### schemaUtils

Schema.org JSON-LD для SEO.

```ts
import { buildBreadcrumbsSchema } from '@/shared/utils/schemaUtils'
```

| Функция | Сигнатура | Описание |
|---------|-----------|----------|
| `buildBreadcrumbsSchema` | `(items: SchemaBreadcrumbItem[]) => string` | Schema.org JSON-LD для BreadcrumbList |

### tableUtils

Расчёты для BaseTable.

```ts
import { calcRowNumber, getColumnStyle, calcTotalColumns, calcColumnWidths } from '@/shared/utils/tableUtils'
```

| Функция | Сигнатура | Описание |
|---------|-----------|----------|
| `calcRowNumber` | `(options: RowNumberOptions) => number` | Номер строки с учётом пагинации |
| `getColumnStyle` | `(options: ColumnStyleOptions) => Record<string, string>` | CSS-стиль колонки (min/max width) |
| `calcTotalColumns` | `(visibleCount, isSelectable, hasRowNumber, hasExpandableRows) => number` | Общее количество колонок |
| `calcColumnWidths` | `(columns: Array<{ width?, flex? }>) => string[]` | Ширины колонок для colgroup |

### tooltipUtils

Расчёты для BaseTooltip.

```ts
import { calcTooltipPosition, getTooltipTransition } from '@/shared/utils/tooltipUtils'
```

| Функция | Сигнатура | Описание |
|---------|-----------|----------|
| `calcTooltipPosition` | `(options: TooltipPositionOptions) => Record<string, string>` | CSS-координаты тултипа относительно триггера |
| `getTooltipTransition` | `(position: string) => string` | Имя CSS-перехода по позиции тултипа |

## Цветовая палитра (переменные)

- `--color-primary`: Основной цвет бренда.
- `--color-accent`: Акцентный цвет (кнопки, ссылки).
- `--color-text`: Основной цвет текста.
- `--color-bg`: Фоновый цвет страницы.
- `--color-white`: Цвет поверхностей (карточки, инпуты).
- `--color-border`: Цвет границ.
- `--color-error`: Цвет ошибок.
- `--color-success`: Цвет успеха.
