<template>
	<ul
		ref="rootRef"
		class="base-side-bar-nav"
		:class="{ 'base-side-bar-nav--nested': level > 0 && !isGroup, 'base-side-bar-nav--group': isGroup }"
		role="list">
		<template v-for="(item, index) in items" :key="getItemKey(item)">
			<li v-if="isGroupItem(item)" class="base-side-bar-nav__group">
				<span v-if="!isCollapsed" :id="getGroupLabelId(index)" class="base-side-bar-nav__group-label">{{ item.label }}</span>
				<span v-else class="base-side-bar-nav__group-line" aria-hidden="true" />

				<BaseSideBarNavigation
					:items="item.children"
					:level="level"
					:active-key="activeKey"
					:active-path="activePath"
					:active-match="activeMatch"
					:link-component="linkComponent"
					:is-collapsed="isCollapsed"
					is-group
					:aria-labelledby="isCollapsed ? undefined : getGroupLabelId(index)"
					:aria-label="isCollapsed ? item.label : undefined"
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

				<BaseSeparator v-if="item.hasDivider && !isCollapsed" class="base-side-bar-nav__divider" />
			</li>

			<li
				v-else
				class="base-side-bar-nav__item"
				:class="{
					'base-side-bar-nav__item--active': isItemActive(item),
					'base-side-bar-nav__item--current': isCurrentItemActive(item),
					'base-side-bar-nav__item--disabled': item.isDisabled,
					'base-side-bar-nav__item--has-children': hasChildren(item),
				}">
				<component
					:is="hasFlyout(item) ? BaseDropdownMenu : SideBarPassthrough"
					v-if="isCollapsed"
					v-bind="getFlyoutProps(item)"
					class="base-side-bar-nav__flyout">
					<component :is="hasFlyout(item) ? SideBarPassthrough : BaseTooltip" :text="item.label" :position="tooltipPosition">
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
								:aria-label="getCollapsedLabel(item)"
								:aria-current="isCurrentItemActive(item) ? 'page' : undefined"
								:aria-disabled="item.isDisabled || undefined"
								@click="handleClick(item, $event)">
								<slot name="item" v-bind="getSlotProps(item)">
									<span v-if="item.icon" class="base-side-bar-nav__icon">
										<slot name="icon" v-bind="getSlotProps(item)">
											<BaseIcon :name="item.icon" />
										</slot>
									</span>

									<span
										v-if="item.badge"
										class="base-side-bar-nav__dot"
										:class="`base-side-bar-nav__dot--${getBadgeColor(item)}`"
										aria-hidden="true" />
								</slot>
							</component>
						</span>
					</component>
				</component>

				<component
					v-else
					:is="getItemComponent(item)"
					v-bind="getItemProps(item)"
					class="base-side-bar-nav__link"
					:class="{
						'base-side-bar-nav__link--active': isItemActive(item),
						'base-side-bar-nav__link--current': isCurrentItemActive(item),
						'base-side-bar-nav__link--parent-active': hasChildren(item) && isItemActive(item) && !isCurrentItemActive(item),
					}"
					:aria-current="isCurrentItemActive(item) ? 'page' : undefined"
					:aria-disabled="item.isDisabled || undefined"
					:aria-expanded="getItemAriaExpanded(item)"
					:aria-controls="getItemAriaControls(item, index)"
					@click="handleClick(item, $event)">
					<slot name="item" v-bind="getSlotProps(item)">
						<span v-if="item.icon" class="base-side-bar-nav__icon">
							<slot name="icon" v-bind="getSlotProps(item)">
								<BaseIcon :name="item.icon" />
							</slot>
						</span>

						<span class="base-side-bar-nav__label">
							<slot name="label" v-bind="getSlotProps(item)">
								{{ item.label }}
							</slot>
						</span>

						<BaseBadge
							v-if="item.badge"
							class="base-side-bar-nav__badge"
							:class="`base-side-bar-nav__badge--${getBadgeColor(item)}`"
							:label="String(item.badge)"
							variant="soft">
							<slot name="badge" v-bind="getSlotProps(item)">
								{{ item.badge }}
							</slot>
						</BaseBadge>

						<span
							v-if="isDisclosureItem(item)"
							class="base-side-bar-nav__chevron"
							:class="{ 'base-side-bar-nav__chevron--expanded': isItemExpanded(item) }"
							aria-hidden="true">
							<BaseIcon name="chevron-right" />
						</span>
					</slot>
				</component>

				<Transition name="base-side-bar-nav-expand" :css="!isExpandInstant">
					<div v-if="shouldRenderChildren(item)" :id="getChildrenId(index)" class="base-side-bar-nav__collapse">
						<div class="base-side-bar-nav__collapse-body">
							<div class="base-side-bar-nav__children">
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
						</div>
					</div>
				</Transition>

				<BaseSeparator v-if="item.hasDivider && !isCollapsed" class="base-side-bar-nav__divider" />
			</li>
		</template>
	</ul>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseBadge } from '@components/BaseBadge'
import { BaseTooltip } from '@components/BaseTooltip'
import { BaseSeparator } from '@components/BaseSeparator'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import { SideBarPassthrough } from '../model/SideBarPassthrough'
import { useBaseSideBarNavigation } from '../model/useBaseSideBarNavigation'
import type { BaseSideBarNavigationEmits, BaseSideBarNavigationProps, BaseSideBarNavigationSlots } from '../types/BaseSideBar.types'

defineOptions({
	name: 'BaseSideBarNavigation',
})

const props = withDefaults(defineProps<BaseSideBarNavigationProps>(), {
	items: () => [],
	level: 0,
	activeMatch: 'exact',
	linkComponent: 'a',
	isCollapsed: false,
	isGroup: false,
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
	getItemAriaControls,
	getChildrenId,
	rootRef,
	isExpandInstant,
	isItemActive,
	isCurrentItemActive,
	handleClick,
	handleChildItemClick,
	getSlotProps,
	hasFlyout,
	isGroupItem,
	getGroupLabelId,
	getBadgeColor,
	getCollapsedLabel,
	getFlyoutProps,
	tooltipPosition,
} = useBaseSideBarNavigation(props, emit)
</script>
