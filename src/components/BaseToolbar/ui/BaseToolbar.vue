<template>
	<!--
		Панель инструментов по образцу APG Toolbar: в порядке Tab один элемент (последний с фокусом), стрелки ведут по
		элементам с переходом через край, Home/End — первый и последний. В текстовом поле стрелки двигают курсор
	-->
	<div
		ref="rootRef"
		class="base-toolbar"
		:class="[variantClass, `base-toolbar--${orientation}`, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="toolbar"
		:aria-label="ariaLabel"
		:aria-orientation="orientation"
		@keydown="handleKeydown"
		@focusin="handleFocusin">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseToolbar.style.scss'
import type { BaseToolbarProps, BaseToolbarSlots } from '../model/BaseToolbar.types'

const props = withDefaults(
	defineProps<BaseToolbarProps>(),
	kitDefaults('BaseToolbar', {
		variant: DEFAULT_VARIANT,
		orientation: 'horizontal',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseToolbarSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-toolbar', props, ['root'])

const rootRef = ref<HTMLElement | null>(null)

/** Элементы панели: фокусируемые и не отключённые; помеченные панелью — даже с tabindex="-1" */
const ITEM_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [data-toolbar-item]'

/** Элемент в порядке Tab: последний с фокусом */
let active: HTMLElement | null = null

function getItems(): HTMLElement[] {
	return [...(rootRef.value?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])].filter(
		element => !element.matches(':disabled') && !element.closest('[inert], [aria-hidden="true"]'),
	)
}

/** Один элемент в порядке Tab: активный (или первый), остальные — tabindex="-1" */
function syncTabIndex(): void {
	const items = getItems()
	if (!active || !items.includes(active)) active = items[0] ?? null
	for (const item of items) {
		item.setAttribute('data-toolbar-item', '')
		item.tabIndex = item === active ? 0 : -1
	}
}

function focusItem(item: HTMLElement): void {
	active = item
	syncTabIndex()
	item.focus()
}

/** Текстовое поле: стрелки в нём двигают курсор, а не фокус панели */
function isTextEntry(element: HTMLElement): boolean {
	if (element.matches('textarea, [contenteditable]:not([contenteditable="false"])')) return true
	return element instanceof HTMLInputElement && !['button', 'checkbox', 'radio', 'submit', 'reset', 'image'].includes(element.type)
}

function handleKeydown(event: KeyboardEvent): void {
	const target = event.target as HTMLElement
	const items = getItems()
	const index = items.indexOf(target)
	if (index === -1 || isTextEntry(target)) return
	const next = props.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
	const prev = props.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
	let targetIndex: number
	switch (event.key) {
		case next:
			targetIndex = (index + 1) % items.length
			break
		case prev:
			targetIndex = (index - 1 + items.length) % items.length
			break
		case 'Home':
			targetIndex = 0
			break
		case 'End':
			targetIndex = items.length - 1
			break
		default:
			return
	}
	event.preventDefault()
	focusItem(items[targetIndex])
}

/** Фокус пришёл мышью или Tab'ом — этот элемент становится элементом в порядке Tab */
function handleFocusin(event: FocusEvent): void {
	const target = event.target as HTMLElement
	if (!getItems().includes(target) || target === active) return
	active = target
	syncTabIndex()
}

/** Кнопки появляются, исчезают и отключаются — порядок Tab пересчитывается */
let observer: MutationObserver | null = null

onMounted(() => {
	syncTabIndex()
	observer = new MutationObserver(syncTabIndex)
	observer.observe(rootRef.value as HTMLElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] })
})

onBeforeUnmount(() => observer?.disconnect())
</script>
