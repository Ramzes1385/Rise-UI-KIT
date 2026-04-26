<template>
	<nav
		class="base-breadcrumbs"
		:class="[props.size ? `base-breadcrumbs--${props.size}` : '']"
		:style="sizeScaleStyle"
		aria-label="Навигация">
		<!-- Schema.org JSON-LD для SEO -->
		<component :is="'script'" type="application/ld+json" v-html="schemaJson" />

		<ol class="base-breadcrumbs__list" itemscope itemtype="https://schema.org/BreadcrumbList">
			<!-- Иконка дома -->
			<li
				v-if="showHome && items.length"
				class="base-breadcrumbs__item base-breadcrumbs__item--home"
				itemprop="itemListElement"
				itemscope
				itemtype="https://schema.org/ListItem">
				<slot name="home">
					<BaseButton
						variant="ghost"
						:padding="2"
						class="base-breadcrumbs__link"
						:size-scale="sizeScale"
						@click="handleHomeClick">
						<BaseIcon :name="homeIcon" size="xs" :size-scale="sizeScale" />
					</BaseButton>
				</slot>
				<meta itemprop="position" content="1" />
				<span class="base-breadcrumbs__sep" aria-hidden="true">
					<slot name="separator" :index="-1">
						<BaseIcon v-if="separator === 'chevron'" name="chevron-right" size="xs" :size-scale="sizeScale" />
						<BaseText v-else-if="separator === 'slash'" :size-scale="sizeScale">/</BaseText>
						<BaseText v-else-if="separator === 'dot'" :size-scale="sizeScale">•</BaseText>
						<BaseIcon v-else name="chevron-right" size="xs" :size-scale="sizeScale" />
					</slot>
				</span>
			</li>

			<!-- Скрытые элементы (многоточие) -->
			<template v-if="collapsedItems.length > 0">
				<li class="base-breadcrumbs__item base-breadcrumbs__item--ellipsis">
					<BaseButton
						variant="ghost"
						:padding="2"
						class="base-breadcrumbs__ellipsis-btn"
						:size-scale="sizeScale"
						@click="isExpanded = true">
						…
					</BaseButton>
				</li>
				<li class="base-breadcrumbs__item" aria-hidden="true">
					<span class="base-breadcrumbs__sep">
						<slot name="separator" :index="0">
							<BaseIcon v-if="separator === 'chevron'" name="chevron-right" size="xs" :size-scale="sizeScale" />
							<BaseText v-else-if="separator === 'slash'" :size-scale="sizeScale">/</BaseText>
							<BaseText v-else-if="separator === 'dot'" :size-scale="sizeScale">•</BaseText>
							<BaseIcon v-else name="chevron-right" size="xs" :size-scale="sizeScale" />
						</slot>
					</span>
				</li>
			</template>

			<!-- Видимые элементы -->
			<li
				v-for="(item, index) in visibleItems"
				:key="item.label + index"
				class="base-breadcrumbs__item"
				:class="{ 'base-breadcrumbs__item--current': isCurrent(index) }"
				itemprop="itemListElement"
				itemscope
				itemtype="https://schema.org/ListItem">
				<slot name="item" :item="item" :index="realIndex(index)">
					<BaseButton
						v-if="!isCurrent(index)"
						variant="ghost"
						:padding="4"
						class="base-breadcrumbs__link"
						:size-scale="sizeScale"
						@click="handleItemClick(item)">
						<BaseIcon
							v-if="item.icon"
							:name="item.icon"
							size="xs"
							:size-scale="sizeScale"
							class="base-breadcrumbs__icon" />
						<BaseText tag="span" size="sm" :size-scale="sizeScale" itemprop="name">{{ item.label }}</BaseText>
					</BaseButton>
					<span v-else class="base-breadcrumbs__current" aria-current="page">
						<BaseIcon
							v-if="item.icon"
							:name="item.icon"
							size="xs"
							:size-scale="sizeScale"
							class="base-breadcrumbs__icon" />
						<BaseText tag="span" :weight="600" size="sm" :size-scale="sizeScale" itemprop="name">{{
							item.label
						}}</BaseText>
					</span>
				</slot>
				<meta :itemprop="'url'" :content="item.to || item.href || ''" />
				<meta :itemprop="'position'" :content="String(realIndex(index) + 1)" />

				<span v-if="!isCurrent(index)" class="base-breadcrumbs__sep" aria-hidden="true">
					<slot name="separator" :index="realIndex(index)">
						<BaseIcon v-if="separator === 'chevron'" name="chevron-right" size="xs" :size-scale="sizeScale" />
						<BaseText v-else-if="separator === 'slash'" :size-scale="sizeScale">/</BaseText>
						<BaseText v-else-if="separator === 'dot'" :size-scale="sizeScale">•</BaseText>
						<BaseIcon v-else name="chevron-right" size="xs" :size-scale="sizeScale" />
					</slot>
				</span>
			</li>
		</ol>
	</nav>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseText } from '@/shared/ui/BaseText'
import { openExternalUrl } from '@/shared/utils/navigationUtils'
import { buildBreadcrumbsSchema } from '@/shared/utils/schemaUtils'
import { computed, ref } from 'vue'

import './BaseBreadcrumbs.style.scss'
import type { BaseBreadcrumbsEmits, BaseBreadcrumbsProps, BreadcrumbItem } from './BaseBreadcrumbs.types'

const props = withDefaults(defineProps<BaseBreadcrumbsProps>(), {
	separator: 'chevron',
	variant: 'default',
	maxItems: 0,
	showHome: false,
	homeIcon: 'chevron-left',
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-breadcrumbs', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseBreadcrumbsEmits>()

const isExpanded = ref(false)

/** Видимые элементы с учётом maxItems */
const visibleItems = computed<BreadcrumbItem[]>(() => {
	if (props.maxItems <= 0 || isExpanded.value) return props.items
	if (props.items.length <= props.maxItems) return props.items
	return props.items.slice(-props.maxItems)
})

/** Скрытые элементы */
const collapsedItems = computed<BreadcrumbItem[]>(() => {
	if (props.maxItems <= 0 || isExpanded.value) return []
	if (props.items.length <= props.maxItems) return []
	return props.items.slice(0, -props.maxItems)
})

/** Schema.org JSON-LD для SEO */
const schemaJson = computed((): string => buildBreadcrumbsSchema(props.items))

/** Является ли текущий (последний) элемент */
function isCurrent(index: number): boolean {
	return index === visibleItems.value.length - 1
}

/** Реальный индекс в исходном массиве */
function realIndex(visibleIdx: number): number {
	return props.items.length - visibleItems.value.length + visibleIdx
}

/** Навигация по ссылке */
function navigate(item: BreadcrumbItem): void {
	if (item.href) {
		openExternalUrl(item.href)
		emit('navigate', item.href)
	} else if (item.to) {
		emit('navigate', item.to)
	}
}

function handleItemClick(item: BreadcrumbItem): void {
	emit('item-click', item)
	navigate(item)
}

function handleHomeClick(): void {
	if (props.items[0]) {
		navigate(props.items[0])
	}
}
</script>
