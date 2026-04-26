<template>
	<div
		class="base-mega-menu"
		:class="[`base-mega-menu--${layout}`, { 'base-mega-menu--hover': trigger === 'hover' }, variantClass]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<!-- ── Columns layout ── -->
		<div v-if="layout === 'columns'" class="base-mega-menu__container">
			<div
				v-for="column in columns"
				:key="column.title"
				class="base-mega-menu__column"
				@mouseenter="handleColumnEnter(column.title)"
				@mouseleave="handleColumnLeave">
				<slot name="column-title" :column="column">
					<BaseText
						tag="h4"
						:size-scale="sizeScale"
						:weight="600"
						class="base-mega-menu__title"
						@click="toggleColumn(column.title)">
						<BaseIcon
							v-if="column.icon"
							:name="column.icon"
							size="xs"
							:size-scale="sizeScale"
							class="base-mega-menu__title-icon" />
						{{ column.title }}
						<BaseIcon class="base-mega-menu__arrow" name="chevron-down" size="xs" :size-scale="sizeScale" />
					</BaseText>
				</slot>

				<BaseAnimation name="fade" :size-scale="sizeScale">
					<ul v-if="isColumnOpen(column.title)" class="base-mega-menu__list">
						<li
							v-for="item in column.items"
							:key="item.label"
							class="base-mega-menu__item"
							:class="{ 'base-mega-menu__item--disabled': item.isDisabled }"
							@mouseenter="handleItemEnter(item)"
							@mouseleave="handleItemLeave">
							<slot name="item" :item="item">
								<div class="base-mega-menu__item-header" @click="handleItemClick(item)">
									<BaseIcon
										v-if="item.icon"
										:name="item.icon"
										size="xs"
										:size-scale="sizeScale"
										class="base-mega-menu__item-icon" />
									<span class="base-mega-menu__label">{{ item.label }}</span>
									<BaseIcon
										v-if="item.children"
										class="base-mega-menu__sub-arrow"
										name="chevron-right"
										size="xs"
										:size-scale="sizeScale" />
								</div>
							</slot>
							<BaseText
								v-if="item.description"
								tag="p"
								:size-scale="sizeScale"
								:color="{ text: { base: 'var(--color-text-muted)' } }"
								class="base-mega-menu__description">
								{{ item.description }}
							</BaseText>

							<BaseAnimation name="fade" :size-scale="sizeScale">
								<ul v-if="item.children && isSubOpen(item.label)" class="base-mega-menu__sub-list">
									<li
										v-for="subItem in item.children"
										:key="subItem.label"
										class="base-mega-menu__sub-item"
										:class="{ 'base-mega-menu__sub-item--disabled': subItem.isDisabled }"
										@click.stop="handleSubClick(subItem)">
										<slot name="sub-item" :item="subItem">
											<BaseIcon
												v-if="subItem.icon"
												:name="subItem.icon"
												size="xs"
												:size-scale="sizeScale"
												class="base-mega-menu__sub-icon" />
											{{ subItem.label }}
										</slot>
									</li>
								</ul>
							</BaseAnimation>
						</li>
					</ul>
				</BaseAnimation>
			</div>
		</div>

		<!-- ── Dropdown layout ── -->
		<ul v-else class="base-mega-menu__nav">
			<li
				v-for="item in items"
				:key="item.label"
				class="base-mega-menu__nav-item"
				:class="{
					'base-mega-menu__nav-item--open': isNavOpen(item.label),
					'base-mega-menu__nav-item--disabled': item.isDisabled,
				}"
				@mouseenter="handleNavEnter(item)"
				@mouseleave="handleNavLeave">
				<slot name="nav-item" :item="item">
					<BaseButton
						variant="ghost"
						class="base-mega-menu__nav-link"
						:is-disabled="item.isDisabled"
						:size-scale="sizeScale"
						@click="handleNavClick(item)">
						<BaseIcon
							v-if="item.icon"
							:name="item.icon"
							size="xs"
							:size-scale="sizeScale"
							class="base-mega-menu__nav-icon" />
						<BaseText tag="span" :size-scale="sizeScale">{{ item.label }}</BaseText>
						<BaseIcon
							v-if="item.children"
							name="chevron-down"
							size="xs"
							:size-scale="sizeScale"
							class="base-mega-menu__nav-arrow" />
					</BaseButton>
				</slot>

				<BaseAnimation name="fade" :size-scale="sizeScale">
					<div v-if="item.children && isNavOpen(item.label)" class="base-mega-menu__dropdown">
						<slot name="dropdown-content" :item="item">
							<div class="base-mega-menu__dropdown-grid">
								<div
									v-for="child in item.children"
									:key="child.label"
									class="base-mega-menu__dropdown-group"
									@mouseenter="handleChildEnter(child)"
									@mouseleave="handleChildLeave">
									<div
										class="base-mega-menu__dropdown-header"
										:class="{
											'base-mega-menu__dropdown-header--disabled': child.isDisabled,
											'base-mega-menu__dropdown-header--open': isChildOpen(child.label),
										}"
										@click="handleChildClick(child)">
										<BaseIcon v-if="child.icon" :name="child.icon" size="xs" :size-scale="sizeScale" />
										<span>{{ child.label }}</span>
										<BaseIcon
											v-if="child.children"
											name="chevron-right"
											size="xs"
											:size-scale="sizeScale"
											class="base-mega-menu__dropdown-arrow" />
									</div>
									<p v-if="child.description" class="base-mega-menu__dropdown-desc">{{ child.description }}</p>

									<BaseAnimation name="fade" :size-scale="sizeScale">
										<ul v-if="child.children && isChildOpen(child.label)" class="base-mega-menu__dropdown-list">
											<li
												v-for="sub in child.children"
												:key="sub.label"
												class="base-mega-menu__dropdown-item"
												:class="{ 'base-mega-menu__dropdown-item--disabled': sub.isDisabled }"
												@click.stop="handleSubNavClick(sub)">
												<BaseIcon v-if="sub.icon" :name="sub.icon" size="xs" :size-scale="sizeScale" />
												<span>{{ sub.label }}</span>
											</li>
										</ul>
									</BaseAnimation>
								</div>
							</div>
						</slot>
					</div>
				</BaseAnimation>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseAnimation } from '@/shared/ui/BaseAnimation'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseText } from '@/shared/ui/BaseText'
import { openExternalUrl } from '@/shared/utils/navigationUtils'
import { ref } from 'vue'
import './BaseMegaMenu.style.scss'
import type {
	BaseMegaMenuEmits,
	BaseMegaMenuProps,
	MegaMenuItem,
	MegaMenuNavItem,
	MegaMenuSubItem,
} from './BaseMegaMenu.types'

const props = withDefaults(defineProps<BaseMegaMenuProps>(), {
	trigger: 'click',
	layout: 'columns',
	variant: 'default',
	hoverDelay: 200,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-mega-menu', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseMegaMenuEmits>()

/** Открытые колонки (columns layout) */
const openColumns = ref<string[]>([])
/** Открытые под-списки (columns layout) */
const openSubs = ref<string[]>([])
/** Открытые навигационные пункты (dropdown layout) */
const openNavItems = ref<string[]>([])
/** Открытые дочерние группы (dropdown layout) */
const openChildren = ref<string[]>([])

let hoverTimer: ReturnType<typeof setTimeout> | null = null

/** Очистить таймер hover */
function clearTimer(): void {
	if (hoverTimer) {
		clearTimeout(hoverTimer)
		hoverTimer = null
	}
}

/** Навигация по ссылке */
function navigate(to?: string, href?: string, target?: '_blank' | '_self'): void {
	if (href) {
		if (target === '_self') {
			window.location.href = href
		} else {
			openExternalUrl(href)
		}
		emit('navigate', href)
	} else if (to) {
		emit('navigate', to)
	}
}

// ── Columns: колонки ──

function toggleColumn(title: string): void {
	if (props.trigger === 'hover') return
	const index = openColumns.value.indexOf(title)
	if (index > -1) {
		openColumns.value.splice(index, 1)
	} else {
		openColumns.value.push(title)
	}
}

function isColumnOpen(title: string): boolean {
	return openColumns.value.includes(title) || window.innerWidth > 768
}

function handleColumnEnter(title: string): void {
	if (props.trigger !== 'hover') return
	clearTimer()
	if (!openColumns.value.includes(title)) {
		openColumns.value.push(title)
	}
}

function handleColumnLeave(): void {
	if (props.trigger !== 'hover') return
	hoverTimer = setTimeout(() => {
		openColumns.value = []
		openSubs.value = []
	}, props.hoverDelay)
}

// ── Columns: элементы ──

function handleItemClick(item: MegaMenuItem): void {
	if (item.isDisabled) return
	emit('item-click', item)
	if (item.children) {
		const index = openSubs.value.indexOf(item.label)
		if (index > -1) {
			openSubs.value.splice(index, 1)
		} else {
			openSubs.value = [item.label]
		}
	} else {
		navigate(item.to, item.href, item.target)
	}
}

function handleItemEnter(item: MegaMenuItem): void {
	if (props.trigger !== 'hover') return
	clearTimer()
	if (item.children && !openSubs.value.includes(item.label)) {
		openSubs.value = [item.label]
	}
}

function handleItemLeave(): void {
	if (props.trigger !== 'hover') return
	hoverTimer = setTimeout(() => {
		openSubs.value = []
	}, props.hoverDelay)
}

function isSubOpen(label: string): boolean {
	return openSubs.value.includes(label)
}

function handleSubClick(item: MegaMenuSubItem): void {
	if (item.isDisabled) return
	emit('sub-click', item)
	navigate(item.to, item.href, item.target)
}

// ── Dropdown: навигация ──

function handleNavClick(item: MegaMenuNavItem): void {
	if (item.isDisabled) return
	emit('item-click', item)
	if (item.children) {
		openNavItems.value = openNavItems.value.includes(item.label) ? [] : [item.label]
		openChildren.value = []
	} else {
		navigate(item.to, item.href, item.target)
	}
}

function handleNavEnter(item: MegaMenuNavItem): void {
	if (props.trigger !== 'hover') return
	clearTimer()
	if (item.children && !openNavItems.value.includes(item.label)) {
		openNavItems.value = [item.label]
		openChildren.value = []
	}
}

function handleNavLeave(): void {
	if (props.trigger !== 'hover') return
	hoverTimer = setTimeout(() => {
		openNavItems.value = []
		openChildren.value = []
	}, props.hoverDelay)
}

function isNavOpen(label: string): boolean {
	return openNavItems.value.includes(label)
}

// ── Dropdown: дочерние ──

function handleChildClick(item: MegaMenuNavItem): void {
	if (item.isDisabled) return
	emit('item-click', item)
	if (item.children) {
		openChildren.value = openChildren.value.includes(item.label) ? [] : [item.label]
	} else {
		navigate(item.to, item.href, item.target)
	}
}

function handleChildEnter(item: MegaMenuNavItem): void {
	if (props.trigger !== 'hover') return
	clearTimer()
	if (item.children && !openChildren.value.includes(item.label)) {
		openChildren.value = [item.label]
	}
}

function handleChildLeave(): void {
	if (props.trigger !== 'hover') return
	hoverTimer = setTimeout(() => {
		openChildren.value = []
	}, props.hoverDelay)
}

function isChildOpen(label: string): boolean {
	return openChildren.value.includes(label)
}

function handleSubNavClick(item: MegaMenuNavItem): void {
	if (item.isDisabled) return
	emit('item-click', item)
	navigate(item.to, item.href, item.target)
}
</script>
