<template>
	<div
		class="base-transfer"
		:class="[variantClass, classes.root, { 'base-transfer--error': Boolean(error), 'base-transfer--disabled': isDisabled }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="group"
		:aria-labelledby="label ? ids.label : undefined"
		:aria-label="label ? undefined : ariaLabel">
		<span v-if="label" :id="ids.label" class="base-transfer__label" :class="classes.label">{{ label }}</span>
		<div class="base-transfer__body">
			<template v-for="panel in panels" :key="panel.side">
				<section
					class="base-transfer__panel"
					:class="[`base-transfer__panel--${panel.side}`, classes.panel]"
					role="group"
					:aria-labelledby="titleId(panel.side)"
					:aria-describedby="describedBy(panel.side)">
					<div class="base-transfer__header" :class="classes.header">
						<span :id="titleId(panel.side)" class="base-transfer__title">{{ panel.title }}</span>
						<span class="base-transfer__count">{{ formatCount(panel) }}</span>
					</div>
					<BaseInput
						v-if="isSearchable"
						class="base-transfer__search"
						:model-value="panel.query"
						:placeholder="UI_TRANSFER.SEARCH"
						:aria-label="formatSearchLabel(panel)"
						:is-disabled="isDisabled"
						:size-scale="sizeScale"
						@update:model-value="setQuery(panel.side, $event)">
						<template #prefix>
							<BaseIcon class="base-transfer__search-icon" name="search" />
						</template>
					</BaseInput>
					<BaseCheckbox
						class="base-transfer__all"
						:model-value="panel.isAllChecked"
						:is-indeterminate="panel.isSomeChecked"
						:label="UI_TRANSFER.SELECT_ALL"
						:is-disabled="isDisabled || !panel.shownCount"
						:size-scale="sizeScale"
						@update:model-value="toggleAll(panel.side)" />
					<div class="base-transfer__list" :class="classes.list" @keydown="handleListKeydown($event, panel.side)">
						<BaseList
							:ref="list => setListRef(panel.side, list)"
							:items="panel.items"
							:model-value="panel.checked"
							selection-mode="multiple"
							variant="ghost"
							:aria-label="panel.title"
							:filter="filterOf(panel.side)"
							:is-sortable="isSortable && panel.side === 'target'"
							:is-disabled="isDisabled"
							:is-virtual="isVirtual"
							:height="height"
							:empty-text="panel.emptyText"
							:color="color"
							:size-scale="sizeScale"
							@update:model-value="setChecked(panel.side, $event)"
							@update:items="reorder">
							<template v-if="$slots.item" #item="itemProps">
								<slot name="item" v-bind="itemProps" :side="panel.side" />
							</template>
							<template v-if="$slots.empty" #empty>
								<slot name="empty" :side="panel.side" />
							</template>
						</BaseList>
					</div>
					<span :id="hintId(panel.side)" class="base-transfer__hint">{{ panel.hint }}</span>
				</section>
				<div v-if="panel.side === 'source'" class="base-transfer__actions" :class="classes.actions">
					<BaseButton
						class="base-transfer__move"
						variant="outline"
						:is-disabled="!canMove('target')"
						:is-focusable-when-disabled="!isDisabled"
						:aria-label="formatMoveLabel('target')"
						:size-scale="sizeScale"
						@click="handleMoveClick('target')">
						<BaseIcon class="base-transfer__move-icon" name="chevron-right" />
					</BaseButton>
					<BaseButton
						class="base-transfer__move"
						variant="outline"
						:is-disabled="!canMove('source')"
						:is-focusable-when-disabled="!isDisabled"
						:aria-label="formatMoveLabel('source')"
						:size-scale="sizeScale"
						@click="handleMoveClick('source')">
						<BaseIcon class="base-transfer__move-icon" name="chevron-left" />
					</BaseButton>
				</div>
			</template>
		</div>
		<p v-if="error" :id="ids.error" class="base-transfer__error" :class="classes.error">{{ error }}</p>
		<span class="base-transfer__status" role="status">{{ announcement }}</span>
	</div>
</template>

<script setup lang="ts" generic="T extends ListItem">
import '../styles/BaseTransfer.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseList } from '@components/BaseList'
import { UI_TRANSFER } from '@/locales/messages'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { ListItem } from '@components/BaseList'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { useBaseTransfer } from '../model/useBaseTransfer'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseTransferEmits, BaseTransferExpose, BaseTransferProps, BaseTransferSlots } from '../types/BaseTransfer.types'

const props = withDefaults(
	defineProps<BaseTransferProps<T>>(),
	kitDefaults('BaseTransfer', {
		variant: DEFAULT_VARIANT,
		modelValue: () => [],
		height: 280,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseTransferEmits>()

defineSlots<BaseTransferSlots<T>>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	ids,
	titleId,
	hintId,
	describedBy,
	panels,
	filterOf,
	setQuery,
	setChecked,
	toggleAll,
	canMove,
	reorder,
	announcement,
	setListRef,
	formatCount,
	formatSearchLabel,
	formatMoveLabel,
	handleMoveClick,
	handleListKeydown,
	exposed,
} = useBaseTransfer(props, emit)

defineExpose<BaseTransferExpose>(exposed)
</script>
