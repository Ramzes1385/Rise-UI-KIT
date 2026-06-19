<template>
	<ul class="base-side-bar-nav" :class="{ 'base-side-bar-nav--nested': level > 0 }" role="list">
		<template v-for="item in items" :key="getItemKey(item)">
			<li
				class="base-side-bar-nav__item"
				:class="{
					'base-side-bar-nav__item--active': isItemActive(item),
					'base-side-bar-nav__item--current': isCurrentItemActive(item),
					'base-side-bar-nav__item--disabled': item.isDisabled,
					'base-side-bar-nav__item--has-children': hasChildren(item),
				}">
				<BaseTooltip v-if="isCollapsed" :text="item.label" position="right">
					<span class="base-side-bar-nav__tooltip-trigger">
						<component
							:is="getItemComponent(item)"
							v-bind="getItemProps(item)"
							class="base-side-bar-nav__link"
							:class="{
								'base-side-bar-nav__link--active': isItemActive(item),
								'base-side-bar-nav__link--current': isCurrentItemActive(item),
								'base-side-bar-nav__link--parent-active':
									hasChildren(item) && isItemActive(item) && !isCurrentItemActive(item),
								'base-side-bar-nav__link--collapsed': isCollapsed,
							}"
							:aria-current="isCurrentItemActive(item) ? 'page' : undefined"
							:aria-disabled="item.isDisabled || undefined"
							:aria-expanded="getItemAriaExpanded(item)"
							@click="handleClick(item, $event)">
						<slot
							name="item"
							v-bind="getSlotProps(item)">
							<span v-if="item.icon" class="base-side-bar-nav__icon">
								<slot
									name="icon"
									v-bind="getSlotProps(item)">
										<BaseIcon :name="item.icon" />
									</slot>
								</span>
							</slot>
						</component>
					</span>
				</BaseTooltip>

				<component
					v-else
					:is="getItemComponent(item)"
					v-bind="getItemProps(item)"
					class="base-side-bar-nav__link"
					:class="{
						'base-side-bar-nav__link--active': isItemActive(item),
						'base-side-bar-nav__link--current': isCurrentItemActive(item),
						'base-side-bar-nav__link--parent-active':
							hasChildren(item) && isItemActive(item) && !isCurrentItemActive(item),
						'base-side-bar-nav__link--collapsed': isCollapsed,
					}"
					:aria-current="isCurrentItemActive(item) ? 'page' : undefined"
					:aria-disabled="item.isDisabled || undefined"
					:aria-expanded="getItemAriaExpanded(item)"
					@click="handleClick(item, $event)">
				<slot
					name="item"
					v-bind="getSlotProps(item)">
					<span v-if="item.icon" class="base-side-bar-nav__icon">
						<slot
							name="icon"
							v-bind="getSlotProps(item)">
								<BaseIcon :name="item.icon" />
							</slot>
						</span>

					<span class="base-side-bar-nav__label">
						<slot
							name="label"
							v-bind="getSlotProps(item)">
								{{ item.label }}
							</slot>
						</span>

						<BaseBadge
							v-if="item.badge"
							class="base-side-bar-nav__badge"
							:label="String(item.badge)"
							variant="soft"
							:size-scale="85">
						<slot
							name="badge"
							v-bind="getSlotProps(item)">
								{{ item.badge }}
							</slot>
						</BaseBadge>

						<span
							v-if="isDisclosureItem(item)"
							class="base-side-bar-nav__chevron"
							:class="{ 'base-side-bar-nav__chevron--expanded': isItemExpanded(item) }"
							aria-hidden="true">
							›
						</span>
					</slot>
				</component>

				<div v-if="shouldRenderChildren(item)" class="base-side-bar-nav__children">
					<BaseSideBarNavigation
						:items="item.children"
						:level="level + 1"
						:active-key="activeKey"
						:active-path="activePath"
						:active-match="activeMatch"
						:link-component="linkComponent"
						:is-collapsed="isCollapsed"
						@item-click="handleChildItemClick">
						<template v-if="$slots.item" #item="slotProps">
							<slot name="item" v-bind="slotProps" />
						</template>

						<template v-if="$slots.icon" #icon="slotProps">
							<slot name="icon" v-bind="slotProps" />
						</template>

						<template v-if="$slots.label" #label="slotProps">
							<slot name="label" v-bind="slotProps" />
						</template>

						<template v-if="$slots.badge" #badge="slotProps">
							<slot name="badge" v-bind="slotProps" />
						</template>
					</BaseSideBarNavigation>
				</div>

				<div v-if="item.hasDivider && !isCollapsed" class="base-side-bar-nav__divider" />
			</li>
		</template>
	</ul>
</template>

<script setup lang="ts">
import { BaseBadge } from '@components/BaseBadge'
import { BaseIcon } from '@components/BaseIcon'
import { BaseTooltip } from '@components/BaseTooltip'
import { useSideBarNavigation } from '@composables/useSideBarNavigation'
import type {
	BaseSideBarNavigationEmits,
	BaseSideBarNavigationProps,
	BaseSideBarNavigationSlots,
} from '../model/BaseSideBar.types'

defineOptions({
	name: 'BaseSideBarNavigation',
})

const props = withDefaults(defineProps<BaseSideBarNavigationProps>(), {
	items: () => [],
	level: 0,
	activeMatch: 'exact',
	linkComponent: 'a',
	isCollapsed: false,
})

const emit = defineEmits<BaseSideBarNavigationEmits>()

defineSlots<BaseSideBarNavigationSlots>()

const {
	getItemKey,
	getItemComponent,
	getItemProps,
	hasChildren,
	isDisclosureItem,
	isItemExpanded,
	shouldRenderChildren,
	getItemAriaExpanded,
	isItemActive,
	isCurrentItemActive,
	handleClick,
	handleChildItemClick,
	getSlotProps,
} = useSideBarNavigation({ props, emit })
</script>
