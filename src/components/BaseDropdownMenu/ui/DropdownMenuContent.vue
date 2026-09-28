<template>
	<div
		:id="id"
		ref="menuRef"
		class="base-dropdown-menu__content"
		role="menu"
		tabindex="-1"
		aria-orientation="vertical"
		:aria-labelledby="labelledBy"
		:aria-label="labelledBy ? undefined : ariaLabel"
		@keydown="handleKeydown"
		@contextmenu.prevent
		@pointerenter="emit('pointerenter')">
		<template v-for="(group, groupIndex) in groups" :key="groupIndex">
			<div v-if="groupIndex > 0" class="base-dropdown-menu__separator" :class="classes.separator" role="separator" />
			<div class="base-dropdown-menu__group" role="group" :aria-labelledby="groupLabelId(group, groupIndex)">
				<template v-for="(item, itemIndex) in group" :key="itemIndex">
					<div
						v-if="item.type === 'separator'"
						class="base-dropdown-menu__separator"
						:class="classes.separator"
						role="separator" />
					<div
						v-else-if="item.type === 'label'"
						:id="labelId(groupIndex, itemIndex)"
						class="base-dropdown-menu__label"
						:class="classes.label">
						{{ item.label }}
					</div>
					<BaseDropdown
						v-else-if="item.children?.length"
						:is-open="openSubmenu === keyOf(groupIndex, itemIndex)"
						position="right-start"
						:gap="4"
						:variant="variant"
						:size-scale="sizeScale"
						:prevent-mousedown="false"
						panel-class="base-dropdown-menu__panel"
						:custom-class="{ root: 'base-dropdown-menu__submenu', panel: classes.panel }"
						@update:is-open="handleSubmenuUpdate">
						<div
							:id="itemId(groupIndex, itemIndex)"
							:ref="element => registerItem(keyOf(groupIndex, itemIndex), element)"
							class="base-dropdown-menu__item"
							:class="itemClasses(item)"
							role="menuitem"
							:tabindex="tabIndexOf(keyOf(groupIndex, itemIndex))"
							aria-haspopup="menu"
							:aria-expanded="openSubmenu === keyOf(groupIndex, itemIndex) ? 'true' : 'false'"
							:aria-disabled="item.isDisabled || undefined"
							@click="handleSubmenuClick(item, keyOf(groupIndex, itemIndex))"
							@focus="activeKey = keyOf(groupIndex, itemIndex)"
							@pointermove="handlePointerMove(item, keyOf(groupIndex, itemIndex), $event)">
							<span v-if="hasIndicators" class="base-dropdown-menu__indicator" aria-hidden="true" />
							<BaseIcon v-if="item.icon" class="base-dropdown-menu__icon" :name="item.icon" :size-scale="iconScale" />
							<span class="base-dropdown-menu__item-label">{{ item.label }}</span>
							<BaseIcon class="base-dropdown-menu__submenu-arrow" name="chevron-right" :size-scale="iconScale" />
						</div>
						<template #dropdown>
							<DropdownMenuContent
								:ref="content => registerSubmenu(keyOf(groupIndex, itemIndex), content)"
								:items="item.children"
								:labelled-by="itemId(groupIndex, itemIndex)"
								:variant="variant"
								:size-scale="sizeScale"
								:classes="classes"
								:level="level + 1"
								@select="handleNestedSelect"
								@back="closeSubmenu(true)"
								@pointerenter="clearPointerTimer" />
						</template>
					</BaseDropdown>
					<component
						:is="isLink(item) ? BaseLink : 'div'"
						v-else
						:id="itemId(groupIndex, itemIndex)"
						:ref="(element: unknown) => registerItem(keyOf(groupIndex, itemIndex), element)"
						v-bind="linkProps(item)"
						class="base-dropdown-menu__item"
						:class="itemClasses(item)"
						:role="itemRole(item)"
						:tabindex="tabIndexOf(keyOf(groupIndex, itemIndex))"
						:aria-checked="isCheckable(item) ? String(Boolean(item.isChecked)) : undefined"
						:aria-disabled="item.isDisabled || undefined"
						@click="handleItemClick(item, $event)"
						@focus="activeKey = keyOf(groupIndex, itemIndex)"
						@pointermove="handlePointerMove(item, keyOf(groupIndex, itemIndex), $event)">
						<span v-if="hasIndicators" class="base-dropdown-menu__indicator" aria-hidden="true">
							<BaseIcon v-if="item.type === 'checkbox' && item.isChecked" name="check" :size-scale="iconScale" />
							<span v-else-if="item.type === 'radio' && item.isChecked" class="base-dropdown-menu__dot" />
						</span>
						<BaseIcon v-if="item.icon" class="base-dropdown-menu__icon" :name="item.icon" :size-scale="iconScale" />
						<span class="base-dropdown-menu__item-label">{{ item.label }}</span>
						<span v-if="item.shortcut" class="base-dropdown-menu__shortcut" aria-hidden="true">{{ item.shortcut }}</span>
					</component>
				</template>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { BaseDropdown } from '@components/BaseDropdown'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useDropdownMenuContent } from '../model/useDropdownMenuContent'
import type { DropdownMenuContentEmits, DropdownMenuContentProps } from '../types/DropdownMenuContent.types'

defineOptions({ name: 'DropdownMenuContent' })

const props = withDefaults(defineProps<DropdownMenuContentProps>(), {
	id: undefined,
	labelledBy: undefined,
	ariaLabel: undefined,
	variant: 'default',
	sizeScale: SIZE_SCALE_DEFAULT,
	classes: () => ({}),
	level: 0,
})

const emit = defineEmits<DropdownMenuContentEmits>()

const {
	menuRef,
	groups,
	iconScale,
	hasIndicators,
	keyOf,
	isCheckable,
	isLink,
	itemRole,
	itemId,
	labelId,
	groupLabelId,
	itemClasses,
	linkProps,
	registerItem,
	registerSubmenu,
	activeKey,
	tabIndexOf,
	openSubmenu,
	clearPointerTimer,
	closeSubmenu,
	handleSubmenuUpdate,
	handleSubmenuClick,
	handleItemClick,
	handleNestedSelect,
	handlePointerMove,
	handleKeydown,
	exposed,
} = useDropdownMenuContent(props, emit)

defineExpose(exposed)
</script>
