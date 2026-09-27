<template>
	<span class="base-icon" :class="classes.root" :style="sizeScaleStyle">
		<!-- Иконка, заменённая компонентом через плагин (icons): компонент рисует свой <svg> -->
		<component
			:is="icon.component"
			v-if="icon.component"
			class="base-icon__svg"
			:class="classes.svg"
			:style="iconStyle"
			:aria-hidden="isDecorative ? true : undefined"
			:aria-label="ariaLabel || undefined"
			:role="isDecorative ? 'presentation' : 'img'"
			focusable="false" />
		<svg
			v-else
			class="base-icon__svg"
			:class="classes.svg"
			:style="iconStyle"
			:aria-hidden="isDecorative ? true : undefined"
			:aria-label="ariaLabel || undefined"
			:role="isDecorative ? 'presentation' : 'img'"
			focusable="false">
			<use :href="icon.url" />
		</svg>
	</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useIcon } from '@composables/useIcon'
import '../styles/BaseIcon.style.scss'
import { SIZE_SCALE_DEFAULT } from '@constants'
import type { BaseIconProps } from '../model/BaseIcon.types'

const props = withDefaults(defineProps<BaseIconProps>(), kitDefaults('BaseIcon', {
	color: '',
	rotate: 0,
	isFlipX: false,
	isFlipY: false,
	ariaLabel: '',
	sizeScale: SIZE_SCALE_DEFAULT,
}))
const { sizeScaleStyle, classes } = useStandardBaseComponent(
	'base-icon',
	props,
	['root', 'svg'],
)

const { resolveIcon } = useIcon()

/** Символ спрайта или замена из плагина (`icons`) */
const icon = computed(() => resolveIcon(props.name))

const isDecorative = computed(() => !props.ariaLabel)

const iconStyle = computed(() => {
	const styles: Record<string, string> = {}

	if (props.color) styles.color = props.color

	const transforms: string[] = []
	if (props.rotate) transforms.push(`rotate(${props.rotate}deg)`)
	if (props.isFlipX) transforms.push('scaleX(-1)')
	if (props.isFlipY) transforms.push('scaleY(-1)')
	if (transforms.length) styles.transform = transforms.join(' ')

	return styles
})
</script>
