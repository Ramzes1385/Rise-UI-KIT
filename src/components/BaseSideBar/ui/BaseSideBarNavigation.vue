<template>
	<ul class="base-sidebar-nav" :class="{ 'base-sidebar-nav--nested': props.level > 0 }" role="list">
		<template v-for="item in props.items" :key="getItemKey(item)">
			<li
				class="base-sidebar-nav__item"
				:class="{
					'base-sidebar-nav__item--active': isItemActive(item),
					'base-sidebar-nav__item--current': isCurrentItemActive(item),
					'base-sidebar-nav__item--disabled': item.isDisabled,
					'base-sidebar-nav__item--has-children': hasChildren(item),
				}">
				<BaseTooltip v-if="props.isCollapsed" :text="item.label" position="right">
					<span class="base-sidebar-nav__tooltip-trigger">
						<component
							:is="getItemComponent(item)"
							v-bind="getItemProps(item)"
							class="base-sidebar-nav__link"
							:class="{
								'base-sidebar-nav__link--active': isItemActive(item),
								'base-sidebar-nav__link--current': isCurrentItemActive(item),
								'base-sidebar-nav__link--parent-active':
									hasChildren(item) && isItemActive(item) && !isCurrentItemActive(item),
								'base-sidebar-nav__link--collapsed': props.isCollapsed,
							}"
							:aria-current="isCurrentItemActive(item) ? 'page' : undefined"
							:aria-disabled="item.isDisabled || undefined"
							:aria-expanded="getItemAriaExpanded(item)"
							@click="handleClick(item, $event)">
						<slot
							name="item"
							v-bind="getSlotProps(item)">
							<span v-if="item.icon" class="base-sidebar-nav__icon">
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
					class="base-sidebar-nav__link"
					:class="{
						'base-sidebar-nav__link--active': isItemActive(item),
						'base-sidebar-nav__link--current': isCurrentItemActive(item),
						'base-sidebar-nav__link--parent-active':
							hasChildren(item) && isItemActive(item) && !isCurrentItemActive(item),
						'base-sidebar-nav__link--collapsed': props.isCollapsed,
					}"
					:aria-current="isCurrentItemActive(item) ? 'page' : undefined"
					:aria-disabled="item.isDisabled || undefined"
					:aria-expanded="getItemAriaExpanded(item)"
					@click="handleClick(item, $event)">
				<slot
					name="item"
					v-bind="getSlotProps(item)">
					<span v-if="item.icon" class="base-sidebar-nav__icon">
						<slot
							name="icon"
							v-bind="getSlotProps(item)">
								<BaseIcon :name="item.icon" />
							</slot>
						</span>

					<span class="base-sidebar-nav__label">
						<slot
							name="label"
							v-bind="getSlotProps(item)">
								{{ item.label }}
							</slot>
						</span>

						<BaseBadge
							v-if="item.badge"
							class="base-sidebar-nav__badge"
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
							class="base-sidebar-nav__chevron"
							:class="{ 'base-sidebar-nav__chevron--expanded': isItemExpanded(item) }"
							aria-hidden="true">
							›
						</span>
					</slot>
				</component>

				<div v-if="shouldRenderChildren(item)" class="base-sidebar-nav__children">
					<BaseSideBarNavigation
						:items="item.children"
						:level="props.level + 1"
						:active-key="props.activeKey"
						:active-path="props.activePath"
						:active-match="props.activeMatch"
						:link-component="props.linkComponent"
						:is-collapsed="props.isCollapsed"
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

				<div v-if="item.hasDivider && !props.isCollapsed" class="base-sidebar-nav__divider" />
			</li>
		</template>
	</ul>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ref } from 'vue'

import { BaseBadge } from '@components/BaseBadge'
import { BaseIcon } from '@components/BaseIcon'
import { BaseTooltip } from '@components/BaseTooltip'

import type {
	BaseSideBarNavigationEmits,
	BaseSideBarNavigationProps,
	BaseSideBarNavigationSlots,
	SideBarItem,
	SideBarItemKey,
	SideBarItemTo,
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

const expandedItemKeys = ref(new Set<SideBarItemKey>())

function getHref(to: SideBarItemTo): string {
	return typeof to === 'string' ? to : '#'
}

function getItemToString(to: SideBarItemTo | undefined): string | undefined {
	/* istanbul ignore if */
	if (!to) {
		return undefined
	}

	/* istanbul ignore if */
	if (typeof to === 'string') {
		return to
	}

	try {
		return JSON.stringify(to)
	} catch /* istanbul ignore next */ {
		return undefined
	}
}

function getItemKey(item: SideBarItem): SideBarItemKey {
	if (item.key !== undefined) {
		return item.key
	}

	const itemToString = getItemToString(item.to)

	if (itemToString !== undefined) {
		return itemToString
	}

	return item.label
}

function getItemComponent(item: SideBarItem): string | Component {
	if (item.isDisabled || !item.to) {
		return 'button'
	}

	return props.linkComponent
}

function getItemProps(item: SideBarItem): Record<string, unknown> {
	if (item.isDisabled || !item.to) {
		return {
			type: 'button',
			disabled: item.isDisabled,
		}
	}

	if (props.linkComponent === 'a') {
		return {
			href: getHref(item.to),
		}
	}

	return {
		to: item.to,
	}
}

function hasChildren(item: SideBarItem): boolean {
	return Boolean(item.children?.length)
}

function isDisclosureItem(item: SideBarItem): boolean {
	return hasChildren(item) && !item.to
}

function hasActiveChild(item: SideBarItem): boolean {
	return item.children!.some(child => isItemActive(child))
}

function isItemExpanded(item: SideBarItem): boolean {
	if (item.isDisabled) {
		return false
	}

	if (!isDisclosureItem(item)) {
		return true
	}

	return hasActiveChild(item) || expandedItemKeys.value.has(getItemKey(item))
}

function shouldRenderChildren(item: SideBarItem): boolean {
	return hasChildren(item) && !props.isCollapsed && isItemExpanded(item)
}

function getItemAriaExpanded(item: SideBarItem): boolean | undefined {
	if (props.isCollapsed || !isDisclosureItem(item)) {
		return undefined
	}

	return isItemExpanded(item)
}

function toggleItemExpanded(item: SideBarItem): void {
	const itemKey = getItemKey(item)
	const nextExpandedItemKeys = new Set(expandedItemKeys.value)

	if (nextExpandedItemKeys.has(itemKey)) {
		nextExpandedItemKeys.delete(itemKey)
	} else {
		nextExpandedItemKeys.add(itemKey)
	}

	expandedItemKeys.value = nextExpandedItemKeys
}

function isItemActive(item: SideBarItem): boolean {
	if (isCurrentItemActive(item)) {
		return true
	}

	return item.children?.some(child => isItemActive(child)) ?? false
}

function isCurrentItemActive(item: SideBarItem): boolean {
	if (item.isActive) {
		return true
	}

	if (item.key !== undefined && props.activeKey !== undefined) {
		return item.key === props.activeKey
	}

	if (!props.activePath || !item.to || typeof item.to !== 'string') {
		return false
	}

	if (props.activePath === item.to) {
		return true
	}

	if (props.activeMatch === 'startsWith' && !hasChildren(item)) {
		return props.activePath.startsWith(`${item.to}/`)
	}

	return false
}

function handleClick(item: SideBarItem, event: MouseEvent): void {
	if (item.isDisabled) {
		event.preventDefault()

		return
	}

	if (isDisclosureItem(item)) {
		event.preventDefault()

		if (!props.isCollapsed) {
			toggleItemExpanded(item)
		}
	}

	item.click?.(item, event)

	emit('itemClick', item, event)
}

/* istanbul ignore next */
function handleChildItemClick(item: SideBarItem, event: MouseEvent): void {
	emit('itemClick', item, event)
}

function getSlotProps(item: SideBarItem) {
	return {
		item,
		level: props.level,
		isActive: isItemActive(item),
		isCurrent: isCurrentItemActive(item),
		isCollapsed: props.isCollapsed,
		hasChildren: hasChildren(item),
		onClick: (event: MouseEvent) => handleClick(item, event),
	}
}
</script>
