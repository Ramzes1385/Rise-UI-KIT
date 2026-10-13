<template>
	<div
		:class="[ui('root'), variantClass, { 'base-gantt--disabled': isDisabled }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, rootStyle]">
		<div v-if="isLoading" role="status" aria-busy="true" :aria-label="UI_GANTT.LOADING" class="base-gantt__loading">
			<div v-for="(width, index) in skeletonRows" :key="index" class="base-gantt__loading-row">
				<BaseSkeleton shape="rect" :width="`${width}%`" :height="14" :size-scale="sizeScale" />
				<BaseSkeleton shape="rect" :width="`${width}%`" :height="18" :size-scale="sizeScale" />
			</div>
		</div>

		<BaseEmpty v-else-if="!items.length" :title="UI_GANTT.EMPTY" :size-scale="sizeScale" class="base-gantt__empty">
			<template v-if="$slots.empty" #default><slot name="empty" /></template>
		</BaseEmpty>

		<template v-else>
			<div ref="scroller" :class="[ui('viewport'), classes.viewport]" @scroll.passive="onScroll">
				<div class="base-gantt__canvas" :style="canvasStyle">
					<div class="base-gantt__layer" aria-hidden="true" :style="layerStyle">
						<svg :class="[ui('dependencies'), classes.dependencies]" :width="chartWidth" :height="bodyHeight">
							<path class="base-gantt__grid-lines" :d="gridPath" />
							<path class="base-gantt__arrow-lines" :d="arrowLines" />
							<path class="base-gantt__arrow-heads" :d="arrowHeads" />
						</svg>
						<div v-if="isTodayShown" :class="[ui('today'), classes.today]" :style="{ left: `${todayLeft}px` }" />
					</div>

					<div
						ref="grid"
						role="treegrid"
						class="base-gantt__grid"
						:aria-label="gridLabel"
						:aria-rowcount="rows.length + 1"
						:aria-colcount="2"
						:aria-disabled="isDisabled || undefined">
						<div role="row" aria-rowindex="1" :class="[ui('header'), classes.header]">
							<div role="columnheader" class="base-gantt__header-name">{{ UI_GANTT.TASK_COLUMN }}</div>
							<div
								role="columnheader"
								class="base-gantt__header-timeline"
								:aria-label="UI_GANTT.TIMELINE"
								:style="timelineStyle">
								<span
									v-for="cell in headerTop"
									:key="cell.key"
									aria-hidden="true"
									class="base-gantt__scale-cell base-gantt__scale-cell--top"
									:style="{ left: `${cell.left}px`, width: `${cell.width}px` }">
									{{ cell.label }}
								</span>
								<span
									v-for="cell in headerBottom"
									:key="cell.key"
									aria-hidden="true"
									class="base-gantt__scale-cell base-gantt__scale-cell--bottom"
									:style="{ left: `${cell.left}px`, width: `${cell.width}px` }">
									{{ cell.label }}
								</span>
							</div>
						</div>

						<div
							v-for="row in rowViews"
							:key="row.item.id"
							role="row"
							:data-row-index="row.index"
							:aria-rowindex="row.index + 2"
							:aria-level="row.item.level + 1"
							:aria-posinset="row.item.position"
							:aria-setsize="row.item.setSize"
							:aria-expanded="row.item.hasChildren ? !row.isCollapsed : undefined"
							:tabindex="row.isActive && !isDisabled ? 0 : -1"
							:class="[
								ui('row'),
								{ 'base-gantt__row--summary': row.item.hasChildren, 'base-gantt__row--editing': row.isEditing },
								classes.row,
							]"
							:style="{ top: `${row.top}px`, '--gantt-level': row.item.level }"
							@focusin="setActive(row.index)"
							@keydown="onKeydown($event, row.index)">
							<div role="gridcell" :class="[ui('name'), classes.name]" @click="onNameClick(row.item, $event)">
								<span
									aria-hidden="true"
									class="base-gantt__toggle"
									:class="{
										'base-gantt__toggle--expanded': !row.isCollapsed,
										'base-gantt__toggle--leaf': !row.item.hasChildren,
									}"
									@click.stop="toggle(row.item)">
									<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', sizeScale)" />
								</span>
								<span class="base-gantt__name-text">
									<slot name="name" :task="row.item.task" :level="row.item.level" :is-collapsed="row.isCollapsed">
										{{ row.item.name }}
									</slot>
								</span>
							</div>
							<div role="gridcell" :class="[ui('timeline'), classes.timeline]" :style="timelineStyle">
								<div
									data-gantt-bar
									role="button"
									tabindex="-1"
									:aria-label="row.label"
									:aria-describedby="isEditable ? hintId : undefined"
									:aria-disabled="isDisabled || undefined"
									:class="[
										row.item.isMilestone ? ui('milestone') : ui('bar'),
										{
											'base-gantt__bar--summary': row.item.hasChildren,
											'base-gantt__bar--editable': isEditable && !isDisabled,
											'base-gantt__bar--dragging': row.isEditing,
										},
										row.item.isMilestone ? classes.milestone : classes.bar,
									]"
									:style="row.barStyle"
									@click="onBarClick($event, row.item)"
									@pointerdown="onPointerDown($event, row.item)">
									<template v-if="!row.item.isMilestone">
										<span :class="[ui('progress'), classes.progress]" :style="row.progressStyle" />
										<template v-if="isEditable">
											<span class="base-gantt__handle base-gantt__handle--start" data-gantt-handle="resize-start" />
											<span class="base-gantt__handle base-gantt__handle--end" data-gantt-handle="resize-end" />
										</template>
									</template>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<span v-if="isEditable" :id="hintId" class="base-gantt__hint">{{ UI_GANTT.EDIT_HINT }}</span>
		</template>
		<div role="status" :class="[ui('status'), classes.status]">{{ status }}</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseGantt.style.scss'
import { UI_GANTT } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseEmpty } from '@components/BaseEmpty'
import { useBaseGantt } from '../model/useBaseGantt'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseGanttEmits, BaseGanttProps, BaseGanttSlots } from '../types/BaseGantt.types'

const props = withDefaults(
	defineProps<BaseGanttProps>(),
	kitDefaults('BaseGantt', {
		variant: DEFAULT_VARIANT,
		tasks: () => [],
		scale: 'week',
		rowHeight: 36,
		listWidth: 280,
		height: 420,
		isTodayVisible: true,
		isEditable: false,
		isDisabled: false,
		isLoading: false,
		collapsedIds: () => [],
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseGanttEmits>()
defineSlots<BaseGanttSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	items,
	rows,
	hintId,
	skeletonRows,
	gridLabel,
	rootStyle,
	canvasStyle,
	layerStyle,
	timelineStyle,
	headerTop,
	headerBottom,
	chartWidth,
	bodyHeight,
	gridPath,
	isTodayShown,
	todayLeft,
	rowViews,
	arrowLines,
	arrowHeads,
	scroller,
	grid,
	status,
	onScroll,
	setActive,
	onKeydown,
	onPointerDown,
	onNameClick,
	onBarClick,
	toggle,
} = useBaseGantt(props, emit)
</script>
