<template>
	<div class="base-context-menu" :class="classes.root" @contextmenu="handleContextMenu" @keydown="handleKeydown">
		<slot />

		<!-- Меню привязано к невидимой точке у указателя (или у элемента с фокусом) и сдвигается от края окна -->
		<BaseDropdown
			:is-open="isOpen"
			position="bottom-start"
			:gap="0"
			:variant="variant"
			:color="color"
			:size-scale="sizeScale"
			:prevent-mousedown="false"
			panel-class="base-dropdown-menu__panel"
			:custom-class="{ root: 'base-context-menu__layer', panel: classes.panel }"
			@update:is-open="setOpen">
			<span class="base-context-menu__anchor" :style="anchorStyle" aria-hidden="true" />
			<template #dropdown>
				<DropdownMenuContent
					ref="contentRef"
					:items="items"
					:aria-label="ariaLabel ?? UI_ARIA.CONTEXT_MENU"
					:variant="variant"
					:size-scale="sizeScale"
					:classes="classes"
					@select="handleSelect" />
			</template>
		</BaseDropdown>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { kitDefaults } from '@composables/useDefaults'
import { BaseDropdown } from '@components/BaseDropdown'
import { useCustomClass } from '@composables/useCustomClass'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import DropdownMenuContent from '@components/BaseDropdownMenu/ui/DropdownMenuContent.vue'
import '@components/BaseDropdownMenu/styles/BaseDropdownMenu.style.scss'
import '../styles/BaseContextMenu.style.scss'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu/types/BaseDropdownMenu.types'
import type { BaseContextMenuEmits, BaseContextMenuProps, BaseContextMenuSlots } from '../types/BaseContextMenu.types'

defineOptions({ name: 'BaseContextMenu' })

const props = withDefaults(
	defineProps<BaseContextMenuProps>(),
	kitDefaults('BaseContextMenu', {
		isDisabled: false,
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseContextMenuEmits>()
defineSlots<BaseContextMenuSlots>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'panel', 'item', 'label', 'separator'],
})

const contentRef = ref<InstanceType<typeof DropdownMenuContent> | null>(null)
const isOpen = ref(false)
const point = ref({ x: 0, y: 0 })
/** Элемент с фокусом до открытия: после выбора пункта фокус возвращается на него */
let returnFocus: HTMLElement | null = null

const anchorStyle = computed(() => ({ left: `${point.value.x}px`, top: `${point.value.y}px` }))

function setOpen(value: boolean): void {
	if (value === isOpen.value) return
	isOpen.value = value
	emit('update:isOpen', value)
}

/** Открыть меню в точке окна; с клавиатуры фокус — на первом пункте, мышью — на самом меню */
async function openAt(x: number, y: number, focusFirst = false): Promise<void> {
	returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
	point.value = { x, y }
	setOpen(true)
	await nextTick()
	if (focusFirst) contentRef.value?.focusFirst()
	else contentRef.value?.focusMenu()
}

function handleContextMenu(event: MouseEvent): void {
	if (props.isDisabled) return
	event.preventDefault()
	void openAt(event.clientX, event.clientY)
}

/** Клавиша «Меню» и Shift+F10 — как правый клик: меню у элемента с фокусом */
function handleKeydown(event: KeyboardEvent): void {
	const isMenuKey = event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)
	if (!isMenuKey || props.isDisabled) return
	event.preventDefault()
	const rect = (event.target as Element).getBoundingClientRect()
	void openAt(rect.left, rect.bottom, true)
}

function handleSelect(item: DropdownMenuItem, event: Event, shouldClose: boolean): void {
	emit('select', item, event)
	if (!shouldClose) return
	setOpen(false)
	if (returnFocus?.isConnected) returnFocus.focus()
}

defineExpose({
	openAt: (x: number, y: number) => void openAt(x, y),
	close: () => setOpen(false),
})
</script>
