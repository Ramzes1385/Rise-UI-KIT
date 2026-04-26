# План доработок BaseSlider v2

## Контекст

5 новых требований + 1 найденный баг. Затрагивают 6 существующих файлов + 3 новых файла (composable `useSlider`).

---

## Баг 0: Селектор `img` в thumbs не работает с BaseImage

### Диагноз

В [`BaseSlider.style.scss`](src/shared/ui/BaseSlider/BaseSlider.style.scss:297) строка 297:

```scss
&__thumb {
	// ...
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}
```

После замены `<img>` на `<BaseImage>` (итерация 1), селектор `img` не сработает — [`BaseImage`](src/shared/ui/BaseImage/BaseImage.vue:2) рендерит `<div class="base-image">` → `<picture>` → `<img class="base-image__img">`.

### Исправление

Заменить `img` на `.base-image`:

```scss
&__thumb {
	// ...
	.base-image {
		width: 100%;
		height: 100%;
	}
}
```

`object-fit: cover` убираем — BaseImage управляет им самостоятельно через проп `fit`.

---

## Требование 1: Тёмный текст в caption

### Диагноз

[`BaseText`](src/shared/ui/BaseText) внутри caption применяет собственный `color: var(--color-text)`, который перекрывает унаследованный `color: #ffffff` от [`&__caption`](src/shared/ui/BaseSlider/BaseSlider.style.scss:118).

Текущий CSS:

```scss
&__caption {
    color: #ffffff;  // наследуется, но BaseText перекрывает
}
&__title { font-size, font-weight }  // нет color
&__desc { font-size, opacity }       // нет color
```

### Исправление

Явно задать цвет на элементах title/desc:

```scss
&__title {
	margin: 0 0 sz(4px);
	font-size: sz(18px);
	font-weight: 700;
	color: #ffffff;
}

&__desc {
	margin: 0;
	font-size: sz(14px);
	opacity: 0.85;
	color: #ffffff;
}
```

---

## Требование 2: Слоты header и footer

### Диагноз

Текущие слоты (см. [`BaseSliderSlots`](src/shared/ui/BaseSlider/BaseSlider.types.ts:71)):

- `default` — заменяет содержимое слайда (scoped: item, index)
- `caption` — заменяет caption (scoped: item, index)

Нет слотов для добавления контента за пределами viewport.

### Решение

Добавить 2 layout-слота:

| Слот     | Позиция        | Props | Назначение                        |
| -------- | -------------- | ----- | --------------------------------- |
| `header` | Выше viewport  | —     | Заголовок, хлебные крошки, badges |
| `footer` | Ниже навигации | —     | Кастомные контролы, счётчик, инфо |

### Изменения в BaseSlider.types.ts

```ts
export interface BaseSliderSlots {
	default?: (props: { item: SliderItem; index: number }) => unknown
	caption?: (props: { item: SliderItem; index: number }) => unknown
	header?: () => unknown
	footer?: () => unknown
}
```

### Изменения в BaseSlider.vue template

```vue
<div class="base-slider" ...>
    <!-- Слот header -->
    <slot name="header" />

    <!-- Стрелки -->
    <div v-if="hasArrows" class="base-slider__arrows">...</div>

    <!-- Область слайдов -->
    <div ref="viewportRef" class="base-slider__viewport">...</div>

    <!-- Навигация (dots/thumbs) -->
    ...

    <!-- Слот footer -->
    <slot name="footer" />
</div>
```

### Изменения в BaseSlider.style.scss

```scss
&__header {
	padding: sz(8px) sz(16px);
}

&__footer {
	padding: sz(8px) sz(16px);
}
```

---

## Требование 3: Режим both — нормальный отступ

### Диагноз

При `navigation === 'both'` отображаются dots и thumbs подряд:

```
[viewport]
[dots: padding 12px 0]
[thumbs: padding 12px]
```

Суммарный отступ между dots и thumbs = 12px (bottom dots) + 12px (top thumbs) = **24px** — слишком много.

В вертикальном режиме оба блока в колонке сбоку — отступы тоже не согласованы.

### Решение

Использовать смежный селектор для уменьшения отступа:

```scss
/* Режим both — уменьшить отступ между dots и thumbs */
&__dots + &__thumbs {
	padding-top: sz(4px);
}

/* Вертикальный режим + both */
&--vertical &__dots + &__thumbs {
	padding-top: sz(4px);
}
```

Также добавить обёрточный контейнер навигации для лучшей семантики (опционально, не ломает обратную совместимость):

```vue
<!-- Навигация -->
<div v-if="hasNavigation" class="base-slider__navigation">
    <div v-if="navigation === 'dots' || navigation === 'both'" class="base-slider__dots">...</div>
    <div v-if="navigation === 'thumbnails' || navigation === 'both'" class="base-slider__thumbs">...</div>
</div>
```

С вычисляемым свойством `hasNavigation`:

```ts
const hasNavigation = computed(() => props.navigation !== 'none')
```

Стили для обёртки:

```scss
&__navigation {
	display: flex;
	flex-direction: column;
	align-items: center;

	.base-slider--vertical & {
		flex-direction: column;
	}
}
```

---

## Требование 4: Composable useSlider

### Диагноз

Вся логика слайдера (навигация, autoplay, drag, snap, trackStyle) захардкожена в [`BaseSlider.vue`](src/shared/ui/BaseSlider/BaseSlider.vue:116) (строки 116–306, ~190 строк script). Это нарушает SRP и делает невозможным переиспользование логики с кастомным UI.

### Решение

Вынести логику в composable `useSlider` по аналогии с [`useSwipe`](src/shared/composables/useSwipe/useSwipe.ts).

### Новый файл: `src/shared/composables/useSlider/useSlider.types.ts`

```ts
import type { ComputedRef, Ref } from 'vue'
import type { SliderAnimation } from '@/shared/ui/BaseSlider/BaseSlider.types'

/** Параметры composable useSlider */
interface UseSliderOptions {
	/** Количество элементов (геттер) */
	itemCount: () => number
	/** Анимация переключения (геттер) */
	animation?: () => SliderAnimation
	/** Автопроигрывание (геттер) */
	isAutoplay?: () => boolean
	/** Интервал автопроигрывания в мс (геттер) */
	autoplayInterval?: () => number
	/** Бесконечная прокрутка (геттер) */
	isLoop?: () => boolean
	/** Вертикальный режим (геттер) */
	isVertical?: () => boolean
	/** Начальный индекс (геттер) */
	initialIndex?: () => number
	/** Порог snap-переключения в процентах (по умолчанию 20) */
	snapThreshold?: number
	/** Callback при смене слайда */
	onChange?: (index: number) => void
	/** Callback при переходе вперёд */
	onNext?: () => void
	/** Callback при переходе назад */
	onPrev?: () => void
}

/** Возвращаемое значение composable useSlider */
interface UseSliderReturn {
	/** Текущий индекс слайда */
	currentIndex: Ref<number>
	/** Смещение при перетаскивании (px) */
	dragOffset: Ref<number>
	/** Флаг перетаскивания */
	isDragging: Ref<boolean>
	/** Ref на viewport элемент */
	viewportRef: Ref<HTMLElement | null>
	/** Стиль трека для transform */
	trackStyle: ComputedRef<Record<string, string>>
	/** Перейти к слайду по индексу */
	goTo: (index: number) => void
	/** Следующий слайд */
	goNext: () => void
	/** Предыдущий слайд */
	goPrev: () => void
	/** Пауза автопроигрывания */
	pauseAutoplay: () => void
	/** Возобновление автопроигрывания */
	resumeAutoplay: () => void
	/** Обработчик touchstart */
	onTouchStart: (event: TouchEvent) => void
	/** Обработчик touchmove */
	onTouchMove: (event: TouchEvent) => void
	/** Обработчик touchend */
	onTouchEnd: (event: TouchEvent) => void
	/** Обработчик начала перетаскивания мышью */
	onDragStart: (event: MouseEvent) => void
}

export type { UseSliderOptions, UseSliderReturn }
```

### Новый файл: `src/shared/composables/useSlider/useSlider.ts`

Логика, переносимая из BaseSlider.vue:

| Функция/состояние   | Строки в BaseSlider.vue | Примечание     |
| ------------------- | ----------------------- | -------------- |
| `clampIndex()`      | 146–148                 | Без изменений  |
| `currentIndex`      | 150                     | Без изменений  |
| `viewportRef`       | 151                     | Без изменений  |
| `getViewportSize()` | 157–160                 | Без изменений  |
| `dragOffset`        | 163                     | Без изменений  |
| `trackStyle`        | 166–177                 | Без изменений  |
| `handleDragEnd()`   | 180–188                 | Без изменений  |
| `useSwipe()` вызов  | 191–198                 | Без изменений  |
| `goTo()`            | 201–205                 | Без изменений  |
| `goNext()`          | 208–216                 | Без изменений  |
| `goPrev()`          | 219–227                 | Без изменений  |
| `startAutoplay()`   | 230–233                 | Без изменений  |
| `pauseAutoplay()`   | 236–241                 | Без изменений  |
| `resumeAutoplay()`  | 244–247                 | Без изменений  |
| Watchers            | 264–286                 | Без изменений  |
| `onMounted`         | 288–296                 | ResizeObserver |
| `onBeforeUnmount`   | 298–305                 | Очистка        |

**Остаётся в BaseSlider.vue:**

- Props/defaults
- `useSizeScale()`
- `startHold()` / `stopHold()` — UI-специфичный функционал стрелок
- Template (разметка + слоты)
- Стили

### Новый файл: `src/shared/composables/useSlider/index.ts`

```ts
export type { UseSliderOptions, UseSliderReturn } from './useSlider.types'
export { useSlider } from './useSlider'
```

### Рефакторинг BaseSlider.vue

Script setup сокращается с ~190 строк до ~50 строк:

```ts
<script setup lang="ts">
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useSlider } from '@/shared/composables/useSlider'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseImage } from '@/shared/ui/BaseImage'
import { BaseText } from '@/shared/ui/BaseText'
import { computed, ref } from 'vue'
import './BaseSlider.style.scss'
import type { BaseSliderEmits, BaseSliderProps } from './BaseSlider.types'

const props = withDefaults(defineProps<BaseSliderProps>(), { ... })
const emit = defineEmits<BaseSliderEmits>()
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })

const {
    currentIndex, dragOffset, isDragging, viewportRef, trackStyle,
    goTo, goNext, goPrev, pauseAutoplay, resumeAutoplay,
    onTouchStart, onTouchMove, onTouchEnd, onDragStart,
} = useSlider({
    itemCount: () => props.items.length,
    animation: () => props.animation,
    isAutoplay: () => props.isAutoplay,
    autoplayInterval: () => props.autoplayInterval,
    isLoop: () => props.isLoop,
    isVertical: () => props.isVertical,
    initialIndex: () => props.initialIndex,
    onChange: (index) => emit('change', index),
    onNext: () => emit('next'),
    onPrev: () => emit('prev'),
})

const hasNavigation = computed(() => props.navigation !== 'none')

let holdTimer: ReturnType<typeof setInterval> | null = null

function startHold(direction: 'prev' | 'next'): void {
    stopHold()
    const action = direction === 'next' ? goNext : goPrev
    holdTimer = setInterval(action, 150)
}

function stopHold(): void {
    if (holdTimer) {
        clearInterval(holdTimer)
        holdTimer = null
    }
}
</script>
```

---

## Требование 5: items в props storybook

### Диагноз

В [`BaseSlider.stories.ts`](src/shared/ui/BaseSlider/BaseSlider.stories.ts:54) строка 54:

```ts
items: { table: { disable: true } },
```

`items` отключён в controls panel — пользователь не может редактировать элементы слайдера из UI Storybook.

### Исправление

Заменить `disable: true` на `control: 'object'`:

```ts
items: { control: 'object' },
```

---

## Файлы для изменения

| #   | Файл                                                                        | Действие      | Изменения                                                                  |
| --- | --------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------- |
| 1   | [`useSlider.types.ts`](src/shared/composables/useSlider/useSlider.types.ts) | **Создать**   | Типы UseSliderOptions, UseSliderReturn                                     |
| 2   | [`useSlider.ts`](src/shared/composables/useSlider/useSlider.ts)             | **Создать**   | Логика слайдера (навигация, autoplay, drag, snap, trackStyle)              |
| 3   | [`index.ts`](src/shared/composables/useSlider/index.ts)                     | **Создать**   | Публичный API composable                                                   |
| 4   | [`BaseSlider.vue`](src/shared/ui/BaseSlider/BaseSlider.vue)                 | Изменить      | Рефакторинг на useSlider, слоты header/footer, обёртка navigation          |
| 5   | [`BaseSlider.style.scss`](src/shared/ui/BaseSlider/BaseSlider.style.scss)   | Изменить      | Цвет caption, img→.base-image, both отступ, стили header/footer/navigation |
| 6   | [`BaseSlider.types.ts`](src/shared/ui/BaseSlider/BaseSlider.types.ts)       | Изменить      | Добавить слоты header/footer в BaseSliderSlots                             |
| 7   | [`BaseSlider.stories.ts`](src/shared/ui/BaseSlider/BaseSlider.stories.ts)   | Изменить      | Включить items control, добавить story с useSlider                         |
| 8   | [`BaseSlider/index.ts`](src/shared/ui/BaseSlider/index.ts)                  | Без изменений | useSlider экспортируется из своего index.ts                                |

---

## Порядок реализации

1. **Создать** `useSlider.types.ts` — типы
2. **Создать** `useSlider.ts` — логика из BaseSlider.vue
3. **Создать** `useSlider/index.ts` — публичный API
4. **Изменить** `BaseSlider.types.ts` — слоты header/footer
5. **Изменить** `BaseSlider.vue` — рефакторинг на useSlider + слоты + navigation wrapper
6. **Изменить** `BaseSlider.style.scss` — все CSS-исправления (цвет, img, both, header/footer/navigation)
7. **Изменить** `BaseSlider.stories.ts` — items control + story с useSlider

---

## Граф зависимостей (проверка FSD)

```
useSwipe (shared/composables)  ←  useSlider (shared/composables)  ←  BaseSlider (shared/ui)
useSizeScale (shared/composables)  ←  BaseSlider (shared/ui)
BaseButton (shared/ui)  ←  BaseSlider (shared/ui)
BaseIcon (shared/ui)  ←  BaseSlider (shared/ui)
BaseImage (shared/ui)  ←  BaseSlider (shared/ui)
BaseText (shared/ui)  ←  BaseSlider (shared/ui)
```

Все импорты внутри слоя `shared` — правила FSD не нарушены.
`useSlider` импортирует `useSwipe` (composable ← composable, один слой) — корректно.
`BaseSlider` импортирует `useSlider` (ui ← composables, один слой shared) — корректно.

---

## Чеклист после реализации

- [ ] `npm run dev` — слайдер работает
- [ ] `npm run build` — без ошибок
- [ ] `npm run storybook` — все stories отображаются
- [ ] items редактируемый в Storybook controls
- [ ] Режим `both` — нормальный отступ между dots и thumbs
- [ ] Caption текст — белый на тёмном градиенте
- [ ] Слоты header/footer — работают
- [ ] `useSlider` — можно использовать без BaseSlider
- [ ] Thumbs — BaseImage отображается корректно
