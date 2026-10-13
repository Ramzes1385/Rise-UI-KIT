<template>
	<div
		:class="[ui('root'), variantClass, classes.root, `base-map--${status}`]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, rootStyle]"
		role="region"
		:aria-label="label"
		:aria-busy="status === 'loading' ? 'true' : undefined"
		@keydown.esc="onEscape"
		@wheel="onWheel">
		<component :is="'script'" v-if="structuredData" type="application/ld+json" v-html="structuredData" />
		<div v-show="status === 'loading' || status === 'ready'" ref="canvasRef" :class="[ui('canvas'), classes.canvas]" />
		<Transition name="base-map-preview">
			<img v-if="isPreview" :src="staticPreview" :class="[ui('preview'), classes.preview]" alt="" loading="lazy" decoding="async" />
		</Transition>
		<Teleport v-for="host in hosts" :key="host.marker.id" :to="host.button">
			<span v-if="host.marker.count" class="base-map__marker-count">{{ host.marker.count }}</span>
			<slot v-else name="marker" :marker="host.marker">
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
		<ul v-if="shapeLabels.length" class="base-map__shapes" :aria-label="UI_MAP.SHAPES">
			<li v-for="(shape, index) in shapeLabels" :key="index">{{ shape }}</li>
		</ul>
		<div v-if="hasControls && status === 'ready'" class="base-map__controls" role="group" :aria-label="UI_MAP.CONTROLS">
			<BaseButton
				variant="outline"
				:size-scale="sizeScale"
				:aria-label="UI_MAP.ZOOM_IN"
				:is-disabled="!canZoomIn"
				is-focusable-when-disabled
				@click="zoomBy(1)">
				<BaseIcon name="plus" :size-scale="calcIconScale('md', sizeScale)" />
			</BaseButton>
			<BaseButton
				variant="outline"
				:size-scale="sizeScale"
				:aria-label="UI_MAP.ZOOM_OUT"
				:is-disabled="!canZoomOut"
				is-focusable-when-disabled
				@click="zoomBy(-1)">
				<BaseIcon name="minus" :size-scale="calcIconScale('md', sizeScale)" />
			</BaseButton>
			<BaseButton variant="outline" :size-scale="sizeScale" :aria-label="UI_MAP.LOCATE" :is-loading="isLocating" @click="locate">
				<BaseIcon name="map-pin" :size-scale="calcIconScale('md', sizeScale)" />
			</BaseButton>
		</div>
		<div v-if="hasControls || !isScrollZoom" class="base-map__notice" role="status">
			<span v-if="notice" class="base-map__notice-text">{{ notice }}</span>
		</div>
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
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { calcIconScale } from '@utils/media/iconUtils'
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
		hasControls: false,
		fitMarkers: false,
		boundsPadding: 40,
		isClustered: false,
		layer: 'scheme',
		isDraggable: true,
		isScrollZoom: true,
		staticPreview: undefined,
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
	shapeLabels,
	notice,
	isLocating,
	canZoomIn,
	canZoomOut,
	zoomBy,
	locate,
	onWheel,
	isPreview,
} = useBaseMap(props, emit, slots)
</script>
