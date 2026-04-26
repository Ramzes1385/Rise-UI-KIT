# План исправлений BaseSlider

## Контекст

Компонент `BaseSlider` имеет 7 проблем + 3 доработки по skill ui-kit. План затрагивает 2 файла компонента (useSwipe уже исправлен).

---

## Проблема 1: Захват мышкой — плавное следование за курсором

### ✅ Реализовано (итерация 1)

- `viewportRef` вместо `document.querySelector`
- `onDragEnd` в useSwipe
- Snap-логика с порогом 20%
- ResizeObserver

### 🔴 Баг: Инвертированный drag

В [`trackStyle`](src/shared/ui/BaseSlider/BaseSlider.vue:164) формула:

```ts
transform: `translate${direction}(-${base + offsetPercent}%)`
```

Когда тянем вправо: `dragOffset > 0` → `offsetPercent > 0` → трек уходит **влево** вместо **вправо**.

**Исправление:** заменить `+` на `-`:

```ts
transform: `translate${direction}(-${base - offsetPercent}%)`
```

Проверка:

- `currentIndex = 1`, `base = 100`, тянем вправо: `offsetPercent = 12.5`
- Было: `translateX(-(100 + 12.5)%)` = `translateX(-112.5%)` — уходит влево ❌
- Стало: `translateX(-(100 - 12.5)%)` = `translateX(-87.5%)` — идёт вправо ✅

---

## Проблема 2: Navigation dots слишком большие

### ✅ Реализовано (итерация 1)

- Нативный `<button>` вместо BaseButton
- Размер `6px × 6px`

### 🔴 Нарушение skill ui-kit: dots должны использовать BaseButton

Согласно правилу 7 skill ui-kit: «кнопки через BaseButton». Dots — это кнопки навигации, должны использовать `BaseButton` с `padding=0`.

**Исправление:**

```vue
<BaseButton
	v-for="(_, index) in items"
	:key="index"
	variant="ghost"
	class="base-slider__dot"
	:class="{ 'base-slider__dot--active': index === currentIndex }"
	:padding="0"
	:size-scale="sizeScale"
	@click="goTo(index)" />
```

CSS для dot переопределяет BaseButton стили:

```scss
&__dot.base-button {
	width: sz(6px);
	height: sz(6px);
	min-width: sz(6px);
	padding: 0;
	border: none;
	border-radius: var(--border-radius-full);
	background-color: var(--color-border);
	cursor: pointer;
	@include transition(background-color, transform);

	&--active {
		background-color: var(--color-accent);
		transform: scale(1.3);
	}

	&:hover:not(&--active) {
		background-color: var(--color-text-muted);
	}
}
```

---

## Проблема 3: isVertical — верстка поехала

### ✅ Реализовано (итерация 1)

- `flex-direction: column` для dots/thumbs
- `flex: 0 0 100%` для slide
- `min-height: 0` для viewport

---

## Проблема 4: Стрелки за пределами слайдера при corner-позициях

### ✅ Реализовано (итерация 1)

- `overflow: visible` на корне
- Отрицательные координаты для corner-позиций

---

## Проблема 5: SizeScale не работает + range в storybook

### ✅ Реализовано (итерация 1)

- Все размеры через `sz()`
- Range-контроль в storybook

---

## Проблема 6: initialIndex не работает

### ✅ Реализовано (итерация 1)

- `clampIndex()` + watch на `props.initialIndex` и `props.items.length`

---

## Проблема 7: Актуализировать storybook

### ✅ Реализовано (итерация 1)

- sizeScale range, initialIndex, height, новые stories

---

## Доработка A: Иконки не используются

### Диагноз

Стрелки используют текстовые символы `‹` / `›` вместо `BaseIcon` с иконками из спрайта. Нарушение правила 7 skill ui-kit: «иконки через BaseIcon».

Доступные иконки: `chevron-left`, `chevron-right`, `chevron-up`, `chevron-down`.

### Решение

Заменить текст на `BaseIcon` в стрелках:

```vue
<!-- Предыдущий слайд -->
<BaseButton variant="ghost" class="base-slider__arrow base-slider__arrow--prev" ...>
  <BaseIcon :name="isVertical ? 'chevron-up' : 'chevron-left'" size="sm" :size-scale="sizeScale" />
</BaseButton>

<!-- Следующий слайд -->
<BaseButton variant="ghost" class="base-slider__arrow base-slider__arrow--next" ...>
  <BaseIcon :name="isVertical ? 'chevron-down' : 'chevron-right'" size="sm" :size-scale="sizeScale" />
</BaseButton>
```

Убрать `transform: rotate(90deg)` для вертикальных стрелок в SCSS — иконки сами правильной ориентации.

---

## Доработка B: Переиспользуемость компонентов

### Диагноз

Нарушение правила 7 skill ui-kit: «Компоненты UI Kit обязаны переиспользовать друг друга вплоть до текста».

Текущие нарушения:

1. `<img>` в слайдах и миниатюрах → должен быть `BaseImage`
2. `<h3>` для title → должен быть `BaseText tag="h3"`
3. `<p>` для desc → должен быть `BaseText`

### Решение

#### 1. Изображения → BaseImage

```vue
<!-- В слайдах -->
<BaseImage v-else :src="item.src" :alt="item.alt || ''" class="base-slider__image" loading="lazy" />

<!-- В миниатюрах -->
<BaseImage v-if="item.type !== 'video'" :src="item.src" :alt="item.alt || ''" />
<BaseImage v-else :src="item.poster || ''" :alt="item.alt || 'Video thumbnail'" />
```

#### 2. Текст caption → BaseText

```vue
<BaseText
	v-if="item.title"
	tag="h3"
	class="base-slider__title"
	:size-scale="sizeScale"
	:weight="700">{{ item.title }}</BaseText>
<BaseText v-if="item.description" class="base-slider__desc" :size-scale="sizeScale">{{ item.description }}</BaseText>
```

---

## Файлы для изменения (итерация 2)

| #   | Файл                                                                      | Изменения                                                                                                                                         |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [`BaseSlider.vue`](src/shared/ui/BaseSlider/BaseSlider.vue)               | Исправить инверсию drag (`base - offsetPercent`), BaseIcon для стрелок, BaseImage для слайдов/миниатюр, BaseText для caption, BaseButton для dots |
| 2   | [`BaseSlider.style.scss`](src/shared/ui/BaseSlider/BaseSlider.style.scss) | Убрать rotate(90deg) для вертикальных стрелок, стили для `&__dot.base-button`                                                                     |

---

## Порядок реализации (итерация 2)

1. `BaseSlider.vue` — исправить инверсию drag, заменить иконки, BaseImage, BaseText, BaseButton для dots
2. `BaseSlider.style.scss` — убрать rotate для вертикальных стрелок, стили dot.base-button

---

## Граф зависимостей (проверка FSD)

```
useSwipe (shared/composables)  ←  BaseSlider (shared/ui)
useSizeScale (shared/composables)  ←  BaseSlider (shared/ui)
BaseButton (shared/ui)  ←  BaseSlider (shared/ui) — стрелки + dots
BaseIcon (shared/ui)  ←  BaseSlider (shared/ui) — стрелки + thumb-play
BaseImage (shared/ui)  ←  BaseSlider (shared/ui) — слайды + миниатюры
BaseText (shared/ui)  ←  BaseSlider (shared/ui) — caption title/desc
```

Все импорты идут внутри слоя `shared` — правила FSD не нарушены.
