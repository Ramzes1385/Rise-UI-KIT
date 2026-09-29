<template>
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
import '../styles/BaseKbd.style.scss'
import { useBaseKbd } from '../model/useBaseKbd'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseKbdProps, BaseKbdSlots } from '../types/BaseKbd.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseKbdProps>(),
	kitDefaults('BaseKbd', {
		variant: DEFAULT_VARIANT,
		value: '',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseKbdSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, key } = useBaseKbd(props)
</script>
