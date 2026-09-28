<template>
	<BaseDropdown
		:is-open="isOpenState"
		:position="position"
		:variant="variant"
		:color="color"
		:size-scale="sizeScale"
		:prevent-mousedown="false"
		panel-class="base-dropdown-menu__panel"
		:custom-class="{ root: rootClass, panel: classes.panel }"
		@update:is-open="setOpen">
		<!-- Кнопка — из слота. Кит ставит ей aria-haspopup, aria-expanded и aria-controls и слушает клик и клавиши -->
		<span
			ref="triggerRef"
			class="base-dropdown-menu__trigger"
			:class="classes.trigger"
			@click="handleTriggerClick"
			@keydown="handleTriggerKeydown">
			<slot :is-open="isOpenState" :trigger-props="triggerAttributes" />
		</span>

		<template #dropdown>
			<DropdownMenuContent
				:id="menuId"
				ref="contentRef"
				:items="items"
				:labelled-by="ariaLabel ? undefined : triggerId"
				:aria-label="ariaLabel"
				:variant="variant"
				:size-scale="sizeScale"
				:classes="classes"
				@select="handleSelect" />
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { kitDefaults } from '@composables/useDefaults'
import { BaseDropdown } from '@components/BaseDropdown'
import { useCustomClass } from '@composables/useCustomClass'
import { useTriggerAttributes } from '@composables/useTriggerAttributes'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import DropdownMenuContent from './DropdownMenuContent.vue'
import '../styles/BaseDropdownMenu.style.scss'
import type { BaseDropdownMenuEmits, BaseDropdownMenuProps, BaseDropdownMenuSlots, DropdownMenuItem } from '../model/BaseDropdownMenu.types'

defineOptions({ name: 'BaseDropdownMenu' })

type FocusTarget = 'first' | 'last' | 'menu'

const props = withDefaults(
	defineProps<BaseDropdownMenuProps>(),
	kitDefaults('BaseDropdownMenu', {
		isOpen: undefined,
		position: 'bottom-start',
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseDropdownMenuEmits>()
defineSlots<BaseDropdownMenuSlots>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'trigger', 'panel', 'item', 'label', 'separator'],
})

const rootClass = computed((): string => ['base-dropdown-menu', classes.value.root].filter(Boolean).join(' '))

const menuId = `rise-menu-${useId()}`
const triggerRef = ref<HTMLElement | null>(null)
const contentRef = ref<InstanceType<typeof DropdownMenuContent> | null>(null)

/** Открыто ли меню. Без пропа isOpen состояние хранит компонент */
const isOpenLocal = ref(props.isOpen ?? false)
const isOpenState = computed(() => isOpenLocal.value)

watch(
	() => props.isOpen,
	isOpen => {
		if (isOpen !== undefined) isOpenLocal.value = isOpen
	},
)

/** Куда поставить фокус после открытия */
let pendingFocus: FocusTarget = 'menu'

const triggerAttributes = computed(() => ({
	'aria-haspopup': 'menu',
	'aria-expanded': isOpenState.value ? 'true' : 'false',
	'aria-controls': isOpenState.value ? menuId : undefined,
}))

const { triggerId, getTrigger } = useTriggerAttributes(
	() => triggerRef.value,
	() => triggerAttributes.value,
	{ withId: true },
)

function setOpen(value: boolean, focus: FocusTarget = 'menu'): void {
	if (value === isOpenLocal.value) return
	pendingFocus = focus
	isOpenLocal.value = value
	emit('update:isOpen', value)
	if (!value) emit('close')
}

/** Фокус в меню после его отрисовки: с клавиатуры — на первый или последний пункт, мышью — на само меню */
watch(isOpenLocal, async isOpen => {
	if (!isOpen) return
	await nextTick()
	// Меню могли закрыть раньше, чем оно отрисовалось: тогда фокус не трогаем
	const content = contentRef.value
	if (pendingFocus === 'first') content?.focusFirst()
	else if (pendingFocus === 'last') content?.focusLast()
	else content?.focusMenu()
})

function handleTriggerClick(): void {
	setOpen(!isOpenLocal.value)
}

/** Кнопка меню по APG: Enter, Space и стрелка вниз открывают меню на первом пункте, стрелка вверх — на последнем */
function focusTargetFor(key: string): FocusTarget | null {
	if (['Enter', ' ', 'ArrowDown'].includes(key)) return 'first'
	if (key === 'ArrowUp') return 'last'
	return null
}

function handleTriggerKeydown(event: KeyboardEvent): void {
	const focus = focusTargetFor(event.key)
	if (!focus) return
	// preventDefault: иначе Enter и Space ещё и кликнут по кнопке и закроют только что открытое меню
	event.preventDefault()
	if (isOpenLocal.value) {
		if (focus === 'first') contentRef.value?.focusFirst()
		else contentRef.value?.focusLast()
		return
	}
	setOpen(true, focus)
}

/** Выбор пункта: обычный пункт закрывает меню и возвращает фокус на кнопку */
function handleSelect(item: DropdownMenuItem, event: Event, shouldClose: boolean): void {
	emit('select', item, event)
	if (!shouldClose) return
	setOpen(false)
	getTrigger()?.focus()
}

defineExpose({
	open: (focus: FocusTarget = 'first') => setOpen(true, focus),
	close: () => setOpen(false),
})
</script>
