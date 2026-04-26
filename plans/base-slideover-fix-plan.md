# План исправлений BaseSlideover

## Анализ проблем

### Проблема 1: isOpen не работает

**Корневая причина**: В Storybook-сторис `v-bind="args"` передаёт `isOpen: false` как статическое значение из args. Хотя `v-model:is-open="isOpen"` должен переопределять его, Storybook может генерировать обработчик `onUpdate:isOpen`, который конфликтует с `v-model`.

**Дополнительно**: `usePopup` → `watch(isOpen, ...)` не имеет `{ immediate: true }`, поэтому при начальном `isOpen=true` блокировка скролла не применяется.

**Решение**:

- В сторисах убрать `isOpen` из `args` (не передавать через `v-bind`)
- Добавить `{ immediate: true }` в `watch` внутри `usePopup`

### Проблема 2: width сделать как sizeScale

**Текущее состояние**: `width: 'sm' | 'md' | 'lg' | 'xl' | 'full'` — строковые пресеты.

**Решение**: Заменить `width` на числовой проп (как `sizeScale`), который работает через `useSizeScale`. Базовая ширина панели — 420px (было `md`). При `width: 100` → 420px, `width: 150` → 630px, `width: 75` → 315px. Для полноэкранного режима добавить `isFullWidth: boolean`.

### Проблема 3: sizeScale убрать

**Решение**: Удалить проп `sizeScale`. Его функцию берёт `width` — числовой масштаб, который через `useSizeScale` устанавливает `--size-scale` на корневом элементе. Дочерние компоненты получают `:size-scale="width"`.

### Проблема 4: при открытии пропадает scroll и body дёргается

**Корневая причина**: `useScrollLock` устанавливает `overflow: hidden` на body, но не компенсирует ширину скроллбара (15-17px на Windows). Контент смещается вправо → визуальный «рывок».

**Решение**: В `useScrollLock` при `lock()` вычислять ширину скроллбара и добавлять `padding-right` на body. При `unlock()` — восстанавливать предыдущее значение.

```ts
function lock(): void {
	if (isLocked) return
	previousOverflow = document.body.style.overflow
	previousPaddingRight = document.body.style.paddingRight
	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
	document.body.style.overflow = 'hidden'
	if (scrollbarWidth > 0) {
		document.body.style.paddingRight = `${scrollbarWidth}px`
	}
	isLocked = true
}
```

### Проблема 5: переиспользуемость компонентов

**Нарушения принципа само-переиспования**:

| Элемент           | Сейчас                                 | Должно быть                                                             |
| ----------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| Кнопка закрытия   | `BaseButton variant="ghost" size="sm"` | `BaseButton variant="ghost" :size-scale="width"` (проп `size` запрещён) |
| Иконка закрытия   | `BaseIcon name="close" size="sm"`      | `BaseIcon name="close" :size-scale="width"` (проп `size` запрещён)      |
| Кнопки в сторисах | Сырые `<button>`                       | `BaseButton`                                                            |
| Текст в сторисах  | Сырые `<p>`, `<label>`                 | `BaseText`                                                              |

### Проблема 6: актуализировать Storybook

**Изменения**:

- Убрать `sizeScale` из argTypes
- `width` → `control: { type: 'range', min: 50, max: 200, step: 10 }`
- Добавить `isFullWidth` в argTypes
- Заменить сырые HTML-элементы на UI Kit компоненты
- Удалить сторис `Widths` (больше нет пресетов)
- Добавить сторис `FullWidth`
- Обновить сторис `WithForm` — использовать `BaseInput` вместо сырых `<input>`

### Проблема 7: убрать неиспользуемый код

| Что                               | Где                                           | Почему                                                 |
| --------------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| `BaseSlideoverSlots`              | `BaseSlideover.types.ts`, `index.ts`          | Не используется — слоты проверяются через `useSlots()` |
| `SlideoverWidth`                  | `BaseSlideover.types.ts`, `index.ts`          | Удаляется — `width` становится числом                  |
| `__close` стили (строки 72-96)    | `BaseSlideover.style.scss`                    | Кнопка закрытия — `BaseButton`, не сырой элемент       |
| `@include transition` без импорта | `BaseSlideover.style.scss:85`                 | Не работает — нет `@use` миксинов                      |
| `sizeScale` проп                  | `BaseSlideover.vue`, `BaseSlideover.types.ts` | Заменён на `width`                                     |

---

## Изменения по файлам

### 1. `src/shared/composables/useScrollLock/useScrollLock.ts`

**Что**: Компенсация ширины скроллбара при блокировке.

```ts
function useScrollLock(): {
	lock: () => void
	unlock: () => void
} {
	let previousOverflow = ''
	let previousPaddingRight = ''
	let isLocked = false

	function lock(): void {
		if (isLocked) return
		previousOverflow = document.body.style.overflow
		previousPaddingRight = document.body.style.paddingRight
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
		document.body.style.overflow = 'hidden'
		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `${scrollbarWidth}px`
		}
		isLocked = true
	}

	function unlock(): void {
		if (!isLocked) return
		document.body.style.overflow = previousOverflow
		document.body.style.paddingRight = previousPaddingRight
		previousOverflow = ''
		previousPaddingRight = ''
		isLocked = false
	}

	return { lock, unlock }
}
```

### 2. `src/shared/composables/usePopup/usePopup.ts`

**Что**: Добавить `{ immediate: true }` в watch для корректной начальной блокировки скролла.

```diff
- watch(isOpen, value => {
-   if (value) {
-     lock()
-   } else {
-     unlock()
-   }
- })
+ watch(isOpen, value => {
+   if (value) {
+     lock()
+   } else {
+     unlock()
+   }
+ }, { immediate: true })
```

### 3. `src/shared/ui/BaseSlideover/BaseSlideover.types.ts`

**Что**: Удалить `SlideoverWidth`, `BaseSlideoverSlots`. Заменить `width` на number. Удалить `sizeScale`. Добавить `isFullWidth`.

```ts
/** Сторона появления slideover */
export type SlideoverSide = 'left' | 'right'

/** Пропсы компонента BaseSlideover */
export interface BaseSlideoverProps {
	/** Состояние открытия */
	isOpen: boolean
	/** Заголовок */
	title?: string
	/** Сторона появления */
	side?: SlideoverSide
	/** Масштаб ширины панели (100 = 100%, 150 = 150%, 75 = 75%) */
	width?: number
	/** Полноэкранная панель */
	isFullWidth?: boolean
	/** Закрытие по клику на оверлей */
	closeOnOverlay?: boolean
	/** Закрытие по Escape */
	closeOnEscape?: boolean
}

/** События компонента BaseSlideover */
export interface BaseSlideoverEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
}
```

### 4. `src/shared/ui/BaseSlideover/BaseSlideover.vue`

**Что**:

- Удалить `sizeScale`, использовать `width` с `useSizeScale`
- `width` по умолчанию = 100
- Убрать `size="sm"` у `BaseButton` и `BaseIcon`
- Передавать `:size-scale="width"` дочерним компонентам
- Добавить модификатор `--full` при `isFullWidth`

```vue
<template>
	<teleport to="body">
		<transition name="slideover">
			<div
				v-if="isOpen"
				class="base-slideover"
				:class="[`base-slideover--${side}`, isFullWidth && 'base-slideover--full']"
				:style="sizeScaleStyle"
				@click.self="handleOverlayClick">
				<div
					class="base-slideover__panel"
					:class="[`base-slideover__panel--${side}`, isFullWidth && 'base-slideover__panel--full']">
					<!-- Заголовок -->
					<div v-if="hasHeader" class="base-slideover__header">
						<slot name="header">
							<BaseText v-if="title" tag="h3" :size-scale="width" :weight="600" class="base-slideover__title">{{
								title
							}}</BaseText>
						</slot>
						<BaseButton variant="ghost" :size-scale="width" aria-label="Закрыть" @click="handleClose">
							<BaseIcon name="close" :size-scale="width" />
						</BaseButton>
					</div>

					<!-- Тело -->
					<div class="base-slideover__body">
						<slot />
					</div>

					<!-- Подвал -->
					<footer v-if="hasFooter" class="base-slideover__footer">
						<slot name="footer" />
					</footer>
				</div>
			</div>
		</transition>
	</teleport>
</template>

<script setup lang="ts">
import { usePopup } from '@/shared/composables/usePopup'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseText } from '@/shared/ui/BaseText'
import { useSlots } from 'vue'
import './BaseSlideover.style.scss'
import type { BaseSlideoverEmits, BaseSlideoverProps } from './BaseSlideover.types'

const props = withDefaults(defineProps<BaseSlideoverProps>(), {
	side: 'right',
	width: 100,
	isFullWidth: false,
	closeOnOverlay: true,
	closeOnEscape: true,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.width })

const emit = defineEmits<BaseSlideoverEmits>()
const slots = useSlots()

/** Есть ли header */
const hasHeader = !!slots.header || !!props.title

/** Есть ли footer */
const hasFooter = !!slots.footer

/** Popup-паттерн: оверлей, Escape, блокировка скролла */
const { handleOverlayClick, close: handleClose } = usePopup({
	isOpen: () => props.isOpen,
	closeOnOverlay: () => props.closeOnOverlay ?? true,
	closeOnEscape: () => props.closeOnEscape ?? true,
	onClose: () => {
		emit('update:isOpen', false)
		emit('close')
	},
})
</script>
```

### 5. `src/shared/ui/BaseSlideover/BaseSlideover.style.scss`

**Что**:

- Добавить `@use` для functions и mixins
- Заменить фиксированные px на `sz()`
- Удалить модификаторы ширины `--sm/md/lg/xl/full` с панели
- Удалить стили `__close`
- Базовая ширина панели через `sz(420px)`
- Полноэкранный режим через `--full`

```scss
@use '@/shared/assets/styles/functions' as *;
@use '@/shared/assets/styles/mixins' as *;

.base-slideover {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 1000;
	backdrop-filter: blur(4px);

	&--full {
		.base-slideover__panel {
			width: 100%;
			border-radius: 0;
		}
	}

	&__panel {
		position: absolute;
		top: 0;
		height: 100%;
		width: sz(420px);
		background-color: var(--color-surface);
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		overflow: hidden;

		/* Сторона появления */
		&--right {
			right: 0;
			border-radius: var(--border-radius-lg) 0 0 var(--border-radius-lg);
		}

		&--left {
			left: 0;
			border-radius: 0 var(--border-radius-lg) var(--border-radius-lg) 0;
		}

		&--full {
			width: 100%;
			border-radius: 0;
		}
	}

	&__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: sz(16px) sz(24px);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface-muted);
		min-height: sz(60px);
	}

	&__title {
		margin: 0;
		font-size: sz(18px);
		font-weight: 700;
		color: var(--color-primary);
	}

	&__body {
		flex: 1;
		padding: sz(24px);
		overflow-y: auto;
		color: var(--color-text);
	}

	&__footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: sz(12px);
		padding: sz(16px) sz(24px);
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface-muted);
	}
}

/* Адаптивность — на мобильных панель на всю ширину */
@media (max-width: 640px) {
	.base-slideover__panel:not(.base-slideover__panel--full) {
		width: 100% !important;
		border-radius: 0;
	}
}

/* Анимация */
.slideover-enter-active,
.slideover-leave-active {
	transition: opacity 0.3s ease;

	.base-slideover__panel--right {
		transition: transform 0.3s ease;
	}

	.base-slideover__panel--left {
		transition: transform 0.3s ease;
	}
}

.slideover-enter-from,
.slideover-leave-to {
	opacity: 0;

	.base-slideover__panel--right {
		transform: translateX(100%);
	}

	.base-slideover__panel--left {
		transform: translateX(-100%);
	}
}
```

### 6. `src/shared/ui/BaseSlideover/index.ts`

```ts
export type { BaseSlideoverEmits, BaseSlideoverProps, SlideoverSide } from './BaseSlideover.types'
export { default as BaseSlideover } from './BaseSlideover.vue'
```

### 7. `src/shared/ui/BaseSlideover/BaseSlideover.stories.ts`

Полная переработка: использование UI Kit компонентов, числовой `width`, `isFullWidth`.

### 8. `src/shared/ui/BaseSlideover/BaseSlideover.spec.ts`

Обновить тесты: `width` — число, нет `sizeScale`, добавить тест `isFullWidth`.

### 9. `src/shared/ui/BaseSlideover/BaseSlideover.integration.spec.ts`

Без изменений (проверяет взаимодействие, а не пропсы).

---

## Граф зависимостей

```
useScrollLock ← usePopup ← BaseSlideover
                            BaseModal (тоже использует usePopup — получит фикс скролла)
useSizeScale ← BaseSlideover
BaseButton   ← BaseSlideover (кнопка закрытия)
BaseIcon     ← BaseSlideover (иконка закрытия)
BaseText     ← BaseSlideover (заголовок)
```

**Порядок реализации** (shared → entities → features → widgets → pages):

1. `useScrollLock` — компенсация скроллбара
2. `usePopup` — `{ immediate: true }`
3. `BaseSlideover.types.ts` — новые типы
4. `BaseSlideover.style.scss` — новые стили
5. `BaseSlideover.vue` — новый компонент
6. `index.ts` — обновить экспорты
7. `BaseSlideover.stories.ts` — актуализация
8. `BaseSlideover.spec.ts` — актуализация тестов

## Список файлов для создания/изменения в режиме Code

1. `src/shared/composables/useScrollLock/useScrollLock.ts` — изменить
2. `src/shared/composables/usePopup/usePopup.ts` — изменить
3. `src/shared/ui/BaseSlideover/BaseSlideover.types.ts` — изменить
4. `src/shared/ui/BaseSlideover/BaseSlideover.style.scss` — изменить
5. `src/shared/ui/BaseSlideover/BaseSlideover.vue` — изменить
6. `src/shared/ui/BaseSlideover/index.ts` — изменить
7. `src/shared/ui/BaseSlideover/BaseSlideover.stories.ts` — изменить
8. `src/shared/ui/BaseSlideover/BaseSlideover.spec.ts` — изменить

## Чеклист после изменений

- [ ] `npm run dev` — компонент рендерится
- [ ] `npm run build` — сборка без ошибок
- [ ] `npm run preview` — продакшн-версия работает
- [ ] `npx vue-tsc --noEmit` — типы без ошибок
- [ ] Алиасы `@` работают в IDE
- [ ] Storybook: все сторисы отображаются
- [ ] Скроллбар: body не дёргается при открытии/закрытии
- [ ] `width: 100` → панель 420px, `width: 150` → 630px
- [ ] `isFullWidth` → панель на 100% ширины
