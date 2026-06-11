<template>
  <ul class="base-sidebar-nav" :class="{ 'base-sidebar-nav--nested': resolvedLevel > 0 }" role="list">
    <template v-for="item in resolvedItems" :key="getItemKey(item)">
      <li
        class="base-sidebar-nav__item"
        :class="{
          'base-sidebar-nav__item--active': isItemActive(item),
          'base-sidebar-nav__item--current': isCurrentItemActive(item),
          'base-sidebar-nav__item--disabled': item.isDisabled,
          'base-sidebar-nav__item--has-children': hasChildren(item),
        }">
        <BaseTooltip v-if="resolvedIsCollapsed" :text="item.label" position="right">
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
                'base-sidebar-nav__link--collapsed': resolvedIsCollapsed,
              }"
              :aria-current="isCurrentItemActive(item) ? 'page' : undefined"
              :aria-disabled="item.isDisabled || undefined"
              :aria-expanded="getItemAriaExpanded(item)"
              @click="handleClick(item, $event)">
              <slot
                name="item"
                :item="item"
                :level="resolvedLevel"
                :is-active="isItemActive(item)"
                :is-current="isCurrentItemActive(item)"
                :is-collapsed="resolvedIsCollapsed"
                :has-children="hasChildren(item)"
                :on-click="(event: MouseEvent) => handleClick(item, event)">
                <span v-if="item.icon" class="base-sidebar-nav__icon">
                  <slot
                    name="icon"
                    :item="item"
                    :level="resolvedLevel"
                    :is-active="isItemActive(item)"
                    :is-current="isCurrentItemActive(item)"
                    :is-collapsed="resolvedIsCollapsed"
                    :has-children="hasChildren(item)"
                    :on-click="(event: MouseEvent) => handleClick(item, event)">
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
            'base-sidebar-nav__link--collapsed': resolvedIsCollapsed,
          }"
          :aria-current="isCurrentItemActive(item) ? 'page' : undefined"
          :aria-disabled="item.isDisabled || undefined"
          :aria-expanded="getItemAriaExpanded(item)"
          @click="handleClick(item, $event)">
          <slot
            name="item"
            :item="item"
            :level="resolvedLevel"
            :is-active="isItemActive(item)"
            :is-current="isCurrentItemActive(item)"
            :is-collapsed="resolvedIsCollapsed"
            :has-children="hasChildren(item)"
            :on-click="(event: MouseEvent) => handleClick(item, event)">
            <span v-if="item.icon" class="base-sidebar-nav__icon">
              <slot
                name="icon"
                :item="item"
                :level="resolvedLevel"
                :is-active="isItemActive(item)"
                :is-current="isCurrentItemActive(item)"
                :is-collapsed="resolvedIsCollapsed"
                :has-children="hasChildren(item)"
                :on-click="(event: MouseEvent) => handleClick(item, event)">
                <BaseIcon :name="item.icon" />
              </slot>
            </span>

            <span class="base-sidebar-nav__label">
              <slot
                name="label"
                :item="item"
                :level="resolvedLevel"
                :is-active="isItemActive(item)"
                :is-current="isCurrentItemActive(item)"
                :is-collapsed="resolvedIsCollapsed"
                :has-children="hasChildren(item)"
                :on-click="(event: MouseEvent) => handleClick(item, event)">
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
                :item="item"
                :level="resolvedLevel"
                :is-active="isItemActive(item)"
                :is-current="isCurrentItemActive(item)"
                :is-collapsed="resolvedIsCollapsed"
                :has-children="hasChildren(item)"
                :on-click="(event: MouseEvent) => handleClick(item, event)">
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
            :level="resolvedLevel + 1"
            :active-key="props.activeKey"
            :active-path="props.activePath"
            :active-match="resolvedActiveMatch"
            :link-component="resolvedLinkComponent"
            :is-collapsed="resolvedIsCollapsed"
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

        <div v-if="item.hasDivider && !resolvedIsCollapsed" class="base-sidebar-nav__divider" />
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed, ref } from 'vue'

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

const props = defineProps<BaseSideBarNavigationProps>()
const emit = defineEmits<BaseSideBarNavigationEmits>()

defineSlots<BaseSideBarNavigationSlots>()

const resolvedItems = computed(() => props.items ?? [])
const resolvedLevel = computed(() => props.level ?? 0)
const resolvedActiveMatch = computed(() => props.activeMatch ?? 'exact')
const resolvedLinkComponent = computed(() => props.linkComponent ?? 'a')
const resolvedIsCollapsed = computed(() => props.isCollapsed ?? false)

const expandedItemKeys = ref(new Set<SideBarItemKey>())

function getItemKey(item: SideBarItem): SideBarItemKey {
  return item.key ?? getItemToString(item.to) ?? item.label
}

function getItemComponent(item: SideBarItem): string | Component {
  if (item.isDisabled || !item.to) {
    return 'button'
  }

  return resolvedLinkComponent.value
}

function getItemProps(item: SideBarItem): Record<string, unknown> {
  if (item.isDisabled || !item.to) {
    return {
      type: 'button',
      disabled: item.isDisabled,
    }
  }

  if (resolvedLinkComponent.value === 'a') {
    return {
      href: getHref(item.to),
    }
  }

  return {
    to: item.to,
  }
}

function getHref(to: SideBarItemTo): string {
  return typeof to === 'string' ? to : '#'
}

function getItemToString(to: SideBarItemTo | undefined): string | undefined {
  if (!to) {
    return undefined
  }

  if (typeof to === 'string') {
    return to
  }

  try {
    return JSON.stringify(to)
  } catch {
    return undefined
  }
}

function hasChildren(item: SideBarItem): boolean {
  return Boolean(item.children?.length)
}

function isDisclosureItem(item: SideBarItem): boolean {
  return hasChildren(item) && !item.to
}

function hasActiveChild(item: SideBarItem): boolean {
  return item.children?.some(child => isItemActive(child)) ?? false
}

function isItemExpanded(item: SideBarItem): boolean {
  if (!hasChildren(item)) {
    return false
  }

  if (!isDisclosureItem(item)) {
    return true
  }

  return hasActiveChild(item) || expandedItemKeys.value.has(getItemKey(item))
}

function shouldRenderChildren(item: SideBarItem): boolean {
  return hasChildren(item) && !resolvedIsCollapsed.value && isItemExpanded(item)
}

function getItemAriaExpanded(item: SideBarItem): boolean | undefined {
  if (resolvedIsCollapsed.value || !isDisclosureItem(item)) {
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

  if (resolvedActiveMatch.value === 'startsWith' && !hasChildren(item)) {
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

    if (!resolvedIsCollapsed.value) {
      toggleItemExpanded(item)
    }
  }

  item.click?.(item, event)

  emit('itemClick', item, event)
}

function handleChildItemClick(item: SideBarItem, event: MouseEvent): void {
  emit('itemClick', item, event)
}
</script>
