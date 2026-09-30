<template>
	<div
		class="base-map"
		:class="[variantClass, classes.root, `base-map--${status}`]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, rootStyle]"
		role="region"
		:aria-label="label"
		:aria-busy="status === 'loading' ? 'true' : undefined">
		<div v-show="status === 'loading' || status === 'ready'" ref="canvasRef" class="base-map__canvas" :class="classes.canvas" />
		<BaseLoader v-if="status === 'loading'" is-overlay has-label :label="UI_MAP.LOADING" />
		<div v-if="isPlaceholder" class="base-map__placeholder" :class="classes.placeholder">
			<slot name="placeholder" :status="status">
				<BaseEmpty
					variant="ghost"
					icon="map-pin"
					:title="placeholderTitle"
					:description="placeholderText"
					:size-scale="sizeScale" />
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseMap.style.scss'
import { UI_MAP } from '@/locales/messages'
import { useBaseMap } from '../model/useBaseMap'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseLoader } from '@components/BaseLoader'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseMapEmits, BaseMapProps, BaseMapSlots } from '../types/BaseMap.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseMapProps>(),
	kitDefaults('BaseMap', {
		variant: DEFAULT_VARIANT,
		provider: 'yandex',
		apiKey: undefined,
		mapId: undefined,
		zoom: 10,
		height: '400px',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseMapEmits>()

defineSlots<BaseMapSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	canvasRef,
	status,
	label,
	rootStyle,
	isPlaceholder,
	placeholderTitle,
	placeholderText,
} = useBaseMap(props, emit)
</script>
