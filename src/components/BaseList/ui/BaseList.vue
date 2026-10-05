<template>
	<div
		class="base-list"
		:class="[
			variantClass,
			classes.root,
			{
				'base-list--error': Boolean(error),
				'base-list--disabled': isDisabled,
				'base-list--sortable': isSortable && !isDisabled,
				'base-list--virtual': isVirtual,
				'base-list--dragging': Boolean(drag),
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<span v-if="label" :id="ids.label" class="base-list__label" :class="classes.label">{{ label }}</span>
		<div ref="viewportRef" class="base-list__viewport" :style="viewportStyle">
			<ul
				v-if="rows.length"
				ref="listRef"
				class="base-list__list"
				:class="classes.list"
				:style="listStyle"
				:role="isSelectable ? 'listbox' : 'list'"
				:aria-labelledby="label ? ids.label : undefined"
				:aria-label="label ? undefined : ariaLabel"
				:aria-multiselectable="selectionMode === 'multiple' ? 'true' : undefined"
				:aria-disabled="isSelectable && isDisabled ? 'true' : undefined"
				:aria-invalid="isSelectable && error ? 'true' : undefined"
				:aria-describedby="describedBy">
				<li
					v-for="row in rows"
					:key="row.item.id"
					:ref="element => measureRow(element, row.index)"
					class="base-list__item"
					:class="[
						classes.item,
						{
							'base-list__item--selected': isSelected(row.item),
							'base-list__item--disabled': isDisabled || row.item.isDisabled,
							'base-list__item--grabbed': row.item.id === grabbedId,
							'base-list__item--placeholder': drag?.item.id === row.item.id,
						},
					]"
					:style="rowStyle(row)"
					:role="isSelectable ? 'option' : 'listitem'"
					:tabindex="row.item.id === tabbableId ? 0 : -1"
					:data-list-id="row.item.id"
					:data-list-index="row.index"
					:aria-selected="isSelectable ? isSelected(row.item) : undefined"
					:aria-disabled="isDisabled || row.item.isDisabled ? 'true' : undefined"
					:aria-setsize="isVirtual ? listSize : undefined"
					:aria-posinset="isVirtual ? row.index + 1 : undefined"
					:aria-describedby="hint ? ids.hint : undefined"
					@focus="handleItemFocus(row.item)"
					@keydown="handleItemKeydown($event, row.item)"
					@pointerdown="handlePointerDown($event, row.item)"
					@click="handleItemClick($event, row.item)">
					<BaseIcon v-if="isSortable && !isDisabled" class="base-list__grip" name="grip-vertical" />
					<slot name="item" v-bind="slotProps(row)">
						<span v-if="$slots.prefix || row.item.avatar || row.item.icon" class="base-list__prefix">
							<slot name="prefix" v-bind="slotProps(row)">
								<BaseAvatar v-if="row.item.avatar" :src="row.item.avatar" :name="row.item.title" alt="" :size-scale="80" />
								<BaseIcon v-else-if="row.item.icon" :name="row.item.icon" />
							</slot>
						</span>
						<span class="base-list__text">
							<span class="base-list__title">{{ row.item.title }}</span>
							<span v-if="row.item.description" class="base-list__description">{{ row.item.description }}</span>
						</span>
						<span v-if="row.item.meta" class="base-list__meta">{{ row.item.meta }}</span>
					</slot>
					<BaseIcon v-if="isSelectable" class="base-list__check" name="check" />
					<span v-if="!isSelectable && $slots.actions" class="base-list__actions" @click.stop @pointerdown.stop @keydown.stop>
						<slot name="actions" v-bind="slotProps(row)" />
					</span>
				</li>
			</ul>
			<div v-else class="base-list__empty">
				<slot name="empty">{{ emptyText ?? UI_LIST.EMPTY }}</slot>
			</div>
		</div>
		<p v-if="error" :id="ids.error" class="base-list__error" :class="classes.error">{{ error }}</p>
		<span v-if="hint" :id="ids.hint" class="base-list__hint">{{ hint }}</span>
		<span class="base-list__status" role="status">{{ announcement }}</span>
		<Teleport defer :to="teleportTarget">
			<div
				v-if="drag"
				ref="ghostRef"
				class="base-list__ghost"
				:class="variantClass"
				:style="[sizeScaleStyle, ghostStyle]"
				v-bind="inheritedTheme"
				aria-hidden="true">
				<div class="base-list__ghost-item">
					<BaseIcon class="base-list__grip" name="grip-vertical" />
					<span class="base-list__text">
						<span class="base-list__title">{{ drag.item.title }}</span>
						<span v-if="drag.item.description" class="base-list__description">{{ drag.item.description }}</span>
					</span>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts" generic="T extends ListItem">
import '../styles/BaseList.style.scss'
import { UI_LIST } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseList } from '../model/useBaseList'
import { BaseAvatar } from '@components/BaseAvatar'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseListEmits, BaseListExpose, BaseListProps, BaseListSlots, ListItem } from '../types/BaseList.types'

const props = withDefaults(
	defineProps<BaseListProps<T>>(),
	kitDefaults('BaseList', {
		variant: DEFAULT_VARIANT,
		selectionMode: 'none',
		itemSize: 56,
		overscan: 5,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseListEmits<T>>()

defineSlots<BaseListSlots<T>>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	ids,
	describedBy,
	hint,
	viewportRef,
	viewportStyle,
	listRef,
	listStyle,
	listSize,
	rows,
	rowStyle,
	measureRow,
	tabbableId,
	isSelectable,
	isSelected,
	grabbedId,
	drag,
	ghostRef,
	ghostStyle,
	slotProps,
	announcement,
	teleportTarget,
	inheritedTheme,
	handleItemFocus,
	handleItemKeydown,
	handleItemClick,
	handlePointerDown,
	exposed,
} = useBaseList(props, emit)

defineExpose<BaseListExpose>(exposed)
</script>
