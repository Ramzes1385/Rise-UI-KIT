<template>
	<div
		:class="[ui('root'), variantClass, classes.root, `base-map--${status}`]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, rootStyle]"
		role="region"
		:aria-label="label"
		:aria-busy="status === 'loading' ? 'true' : undefined"
		@keydown.esc="onEscape">
		<component :is="'script'" v-if="structuredData" type="application/ld+json" v-html="structuredData" />
		<div v-show="status === 'loading' || status === 'ready'" ref="canvasRef" :class="[ui('canvas'), classes.canvas]" />
		<Teleport v-for="host in hosts" :key="host.marker.id" :to="host.button">
			<slot name="marker" :marker="host.marker">
				<span v-if="host.marker.icon" class="base-map__marker-icon">
					<BaseIcon :name="host.marker.icon" :size-scale="sizeScale" />
				</span>
			</slot>
		</Teleport>
		<Teleport v-if="selectedHost && $slots.balloon" :to="selectedHost.anchor">
			<div
				:id="balloonId"
				:class="[ui('balloon'), classes.balloon]"
				role="dialog"
				tabindex="-1"
				:aria-label="selectedHost.button.getAttribute('aria-label') ?? undefined">
				<slot name="balloon" :marker="selectedHost.marker" :close="closeBalloon" />
			</div>
		</Teleport>
		<Transition name="base-map-loader">
			<BaseLoader v-if="status === 'loading'" is-overlay has-label :label="UI_MAP.LOADING" />
		</Transition>
		<Transition name="base-map-placeholder">
			<div v-if="isPlaceholder" :class="[ui('placeholder'), classes.placeholder]">
				<slot name="placeholder" :status="status">
					<BaseEmpty
						variant="ghost"
						icon="map-pin"
						:title="placeholderTitle"
						:description="placeholderText"
						:size-scale="sizeScale" />
				</slot>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseMap.style.scss'
import { UI_MAP } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
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
		seo: false,
		height: '400px',
		sizeScale: SIZE_SCALE_DEFAULT,
		scheme: 'auto',
		selected: null,
	}),
)

const emit = defineEmits<BaseMapEmits>()

const slots = defineSlots<BaseMapSlots>()

const {
	ui,
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
	structuredData,
	hosts,
	selectedHost,
	balloonId,
	closeBalloon,
	onEscape,
} = useBaseMap(props, emit, slots)
</script>
