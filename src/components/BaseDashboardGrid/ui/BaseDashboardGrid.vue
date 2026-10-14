<template>
	<div
		ref="rootRef"
		role="group"
		:class="[
			ui('root'),
			variantClass,
			classes.root,
			{
				'base-dashboard-grid--editable': isInteractive,
				'base-dashboard-grid--disabled': isDisabled,
				'base-dashboard-grid--dragging': dragId !== null,
				'base-dashboard-grid--empty': isEmpty,
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, heightStyle]"
		:aria-label="gridLabel"
		:aria-disabled="isDisabled ? true : undefined"
		@keydown="handleKeydown"
		@focusout="handleFocusOut"
		@pointermove="handlePointerMove"
		@pointerup="handlePointerUp"
		@pointercancel="handlePointerCancel"
		@lostpointercapture="handlePointerCancel">
		<template v-if="!isEmpty">
			<div v-if="placeholderStyle" aria-hidden="true" :class="[ui('placeholder'), classes.placeholder]" :style="placeholderStyle" />

			<div
				v-for="item in items"
				:key="item.id"
				role="group"
				:data-item-id="item.id"
				:tabindex="isFocusable(item) ? 0 : undefined"
				:aria-label="itemName(item)"
				:aria-describedby="isFocusable(item) ? hintId : undefined"
				:class="[
					ui('item'),
					classes.item,
					{
						'base-dashboard-grid__item--editable': isFocusable(item),
						'base-dashboard-grid__item--static': item.isStatic,
						'base-dashboard-grid__item--dragging': dragId === item.id,
						'base-dashboard-grid__item--grabbed': grabbedId === item.id,
					},
				]"
				:style="itemStyle(item)"
				@pointerdown="handlePointerDown($event, item, 'move')">
				<DashboardGridBody :class="[ui('body'), classes.body]">
					<slot name="item" :item="item" :is-dragging="dragId === item.id" :is-grabbed="grabbedId === item.id">
						{{ item.label ?? item.id }}
					</slot>
				</DashboardGridBody>

				<template v-if="isFocusable(item)">
					<span data-handle aria-hidden="true" :class="[ui('handle'), classes.handle]">
						<slot name="handle" :item="item">
							<BaseIcon name="grip-vertical" :size-scale="calcIconScale('xs', sizeScale)" />
						</slot>
					</span>
					<span
						data-resize
						aria-hidden="true"
						:class="[ui('resize'), classes.resize]"
						@pointerdown.stop="handlePointerDown($event, item, 'resize')" />
				</template>
			</div>
		</template>

		<div v-else :class="[ui('empty'), classes.empty]">
			<slot name="empty">
				<BaseEmpty :title="emptyText" :size-scale="sizeScale" />
			</slot>
		</div>

		<span v-if="isInteractive" :id="hintId" :class="[ui('hint'), classes.hint]">{{ hintText }}</span>
		<span role="status" :class="[ui('status'), classes.status]">{{ announcement }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseDashboardGrid.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseEmpty } from '@components/BaseEmpty'
import { calcIconScale } from '@utils/media/iconUtils'
import DashboardGridBody from './DashboardGridBody.vue'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseDashboardGrid } from '../model/useBaseDashboardGrid'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseDashboardGridEmits, BaseDashboardGridProps, BaseDashboardGridSlots } from '../types/BaseDashboardGrid.types'

const props = withDefaults(
	defineProps<BaseDashboardGridProps>(),
	kitDefaults('BaseDashboardGrid', {
		variant: DEFAULT_VARIANT,
		cols: 12,
		rowHeight: 80,
		gap: 16,
		compactType: 'vertical',
		isEditable: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseDashboardGridEmits>()
defineSlots<BaseDashboardGridSlots>()

const {
	ui,
	rootRef,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	hintId,
	items,
	announcement,
	dragId,
	grabbedId,
	isInteractive,
	isEmpty,
	gridLabel,
	hintText,
	emptyText,
	heightStyle,
	placeholderStyle,
	isFocusable,
	itemName,
	itemStyle,
	handleKeydown,
	handleFocusOut,
	handlePointerDown,
	handlePointerMove,
	handlePointerUp,
	handlePointerCancel,
} = useBaseDashboardGrid(props, emit)
</script>
