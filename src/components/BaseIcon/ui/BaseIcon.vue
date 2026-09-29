<template>
	<span class="base-icon" :class="classes.root" :style="sizeScaleStyle">
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
import '../styles/BaseIcon.style.scss'
import { useBaseIcon } from '../model/useBaseIcon'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseIconProps } from '../types/BaseIcon.types'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseIconProps>(),
	kitDefaults('BaseIcon', {
		color: '',
		rotate: 0,
		isFlipX: false,
		isFlipY: false,
		ariaLabel: '',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const { sizeScaleStyle, classes, icon, isDecorative, iconStyle } = useBaseIcon(props)
</script>
