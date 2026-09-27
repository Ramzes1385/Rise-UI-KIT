<template>
	<!-- Клавиша: символ служебной клавиши скрыт от скринридера, её название — скрытым текстом -->
	<kbd class="base-kbd" :class="[variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<slot>
			<template v-if="key.name">
				<span aria-hidden="true">{{ key.text }}</span>
				<span class="base-kbd__name">{{ key.name }}</span>
			</template>
			<template v-else>{{ key.text }}</template>
		</slot>
	</kbd>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, UI_ARIA } from '@constants'
import '../styles/BaseKbd.style.scss'
import type { BaseKbdProps, BaseKbdSlots } from '../model/BaseKbd.types'

const props = withDefaults(defineProps<BaseKbdProps>(), kitDefaults('BaseKbd', {
	variant: DEFAULT_VARIANT,
	value: '',
	sizeScale: SIZE_SCALE_DEFAULT,
}))

defineSlots<BaseKbdSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-kbd', props, ['root'])

/** macOS: ⌘ и ⌥ вместо Ctrl и Alt */
function detectMac(): boolean {
	if (typeof navigator === 'undefined') return false
	return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)
}

const isMac = computed(() => (props.platform ? props.platform === 'mac' : detectMac()))

/** Показ клавиши: текст на экране и название для скринридера (у символов) */
const key = computed((): { text: string; name?: string } => {
	const mac = isMac.value
	switch (props.value.toLowerCase()) {
		case 'meta':
			return mac ? { text: '⌘', name: UI_ARIA.KEY_COMMAND } : { text: 'Ctrl' }
		case 'ctrl':
		case 'control':
			return mac ? { text: '⌃', name: UI_ARIA.KEY_CONTROL } : { text: 'Ctrl' }
		case 'alt':
		case 'option':
			return mac ? { text: '⌥', name: UI_ARIA.KEY_OPTION } : { text: 'Alt' }
		case 'shift':
			return { text: '⇧', name: UI_ARIA.KEY_SHIFT }
		case 'enter':
			return { text: '↵', name: UI_ARIA.KEY_ENTER }
		case 'backspace':
			return { text: '⌫', name: UI_ARIA.KEY_BACKSPACE }
		case 'delete':
			return { text: '⌦', name: UI_ARIA.KEY_DELETE }
		case 'arrowup':
			return { text: '↑', name: UI_ARIA.KEY_UP }
		case 'arrowdown':
			return { text: '↓', name: UI_ARIA.KEY_DOWN }
		case 'arrowleft':
			return { text: '←', name: UI_ARIA.KEY_LEFT }
		case 'arrowright':
			return { text: '→', name: UI_ARIA.KEY_RIGHT }
		case 'escape':
			return { text: 'Esc' }
		case 'tab':
			return { text: 'Tab' }
		case 'space':
			return { text: 'Space' }
		default:
			return { text: props.value }
	}
})
</script>
