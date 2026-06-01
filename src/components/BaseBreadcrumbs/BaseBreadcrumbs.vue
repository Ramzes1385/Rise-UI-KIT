<template>
	<div
		class="base-breadcrumbs"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		aria-label="Навигация">
		<!-- Schema.org JSON-LD для SEO. v-html безопасен: schemaJson экранирует </script> (см. schemaUtils). -->
		<!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
		<component :is="'script'" type="application/ld+json" v-html="schemaJson" />

		<ol class="base-breadcrumbs__list" :class="classes.list" itemscope itemtype="https://schema.org/BreadcrumbList">
			<!-- Иконка дома -->
			<li
				v-if="showHome && items.length"
				class="base-breadcrumbs__item base-breadcrumbs__item--home"
				:class="classes.item"
				itemprop="itemListElement"
				itemscope
				itemtype="https://schema.org/ListItem">
				<slot name="home">
					<BaseButton
						variant="ghost"
						:padding="2"
						class="base-breadcrumbs__link"
						:custom-class="classes.link"
						:size-scale="sizeScale"
						@click="handleHomeClick">
						<BaseIcon
							:name="homeIcon"
							:size-scale="calcIconScale('xs', sizeScale)"
							:custom-class="classes.homeIcon" />
					</BaseButton>
				</slot>
				<meta itemprop="position" content="1" />
				<span class="base-breadcrumbs__sep" :class="classes.separator" aria-hidden="true">
					<slot name="separator" :index="-1">
						<BaseIcon
							v-if="separator === 'chevron'"
							name="chevron-right"
							:size-scale="calcIconScale('xs', sizeScale)"
							:custom-class="classes.separatorIcon" />
						<BaseText v-else-if="separator === 'slash'" :size-scale="sizeScale" :custom-class="classes.separatorText"
							>/</BaseText
						>
						<BaseText v-else-if="separator === 'dot'" :size-scale="sizeScale" :custom-class="classes.separatorText"
							>•</BaseText
						>
						<BaseIcon
							v-else
							name="chevron-right"
							:size-scale="calcIconScale('xs', sizeScale)"
							:custom-class="classes.separatorIcon" />
					</slot>
				</span>
			</li>

			<!-- Скрытые элементы (многоточие) -->
			<template v-if="collapsedItems.length > 0">
				<li class="base-breadcrumbs__item base-breadcrumbs__item--ellipsis" :class="classes.item">
					<BaseButton
						variant="ghost"
						:padding="2"
						class="base-breadcrumbs__ellipsis-btn"
						:custom-class="classes.ellipsisBtn"
						:size-scale="sizeScale"
						@click="isExpanded = true">
						…
					</BaseButton>
				</li>
				<li class="base-breadcrumbs__item" :class="classes.item" aria-hidden="true">
					<span class="base-breadcrumbs__sep" :class="classes.separator">
						<slot name="separator" :index="0">
							<BaseIcon
								v-if="separator === 'chevron'"
								name="chevron-right"
								:size-scale="calcIconScale('xs', sizeScale)"
								:custom-class="classes.separatorIcon" />
							<BaseText
								v-else-if="separator === 'slash'"
								:size-scale="sizeScale"
								:custom-class="classes.separatorText"
								>/</BaseText
							>
							<BaseText
								v-else-if="separator === 'dot'"
								:size-scale="sizeScale"
								:custom-class="classes.separatorText"
								>•</BaseText
							>
							<BaseIcon
								v-else
								name="chevron-right"
								:size-scale="calcIconScale('xs', sizeScale)"
								:custom-class="classes.separatorIcon" />
						</slot>
					</span>
				</li>
			</template>

			<!-- Видимые элементы -->
			<li
				v-for="(item, index) in visibleItems"
				:key="`${item?.label ?? ''}-${index}`"
				class="base-breadcrumbs__item"
				:class="[{ 'base-breadcrumbs__item--current': isCurrent(index) }, classes.item]"
				itemprop="itemListElement"
				itemscope
				itemtype="https://schema.org/ListItem">
				<slot name="item" :item="item" :index="realIndex(index)">
					<BaseButton
						v-if="!isCurrent(index)"
						variant="ghost"
						:padding="4"
						class="base-breadcrumbs__link"
						:custom-class="classes.link"
						:size-scale="sizeScale"
						@click="handleItemClick(item)">
						<BaseIcon
							v-if="item.icon"
							:name="item.icon"
							:size-scale="calcIconScale('xs', sizeScale)"
							class="base-breadcrumbs__icon"
							:custom-class="classes.itemIcon" />
						<BaseText
							tag="span"
							:size-scale="calcIconScale('sm', sizeScale)"
							itemprop="name"
							:custom-class="classes.itemText"
							>{{ item.label }}</BaseText
						>
					</BaseButton>
					<span v-else class="base-breadcrumbs__current" :class="classes.current" aria-current="page">
						<BaseIcon
							v-if="item.icon"
							:name="item.icon"
							:size-scale="calcIconScale('xs', sizeScale)"
							class="base-breadcrumbs__icon"
							:custom-class="classes.currentIcon" />
						<BaseText
							tag="span"
							:weight="600"
							:size-scale="calcIconScale('sm', sizeScale)"
							itemprop="name"
							:custom-class="classes.currentText"
							>{{ item.label }}</BaseText
						>
					</span>
				</slot>
				<meta :itemprop="'url'" :content="item.to || item.href || ''" />
				<meta :itemprop="'position'" :content="String(realIndex(index) + 1)" />

				<span v-if="!isCurrent(index)" class="base-breadcrumbs__sep" :class="classes.separator" aria-hidden="true">
					<slot name="separator" :index="realIndex(index)">
						<BaseIcon
							v-if="separator === 'chevron'"
							name="chevron-right"
							:size-scale="calcIconScale('xs', sizeScale)"
							:custom-class="classes.separatorIcon" />
						<BaseText v-else-if="separator === 'slash'" :size-scale="sizeScale" :custom-class="classes.separatorText"
							>/</BaseText
						>
						<BaseText v-else-if="separator === 'dot'" :size-scale="sizeScale" :custom-class="classes.separatorText"
							>•</BaseText
						>
						<BaseIcon
							v-else
							name="chevron-right"
							:size-scale="calcIconScale('xs', sizeScale)"
							:custom-class="classes.separatorIcon" />
					</slot>
				</span>
			</li>
		</ol>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { openExternalUrl } from '@utils/navigationUtils'
import { buildBreadcrumbsSchema } from '@utils/schemaUtils'
import { computed, ref } from 'vue'

import './BaseBreadcrumbs.style.scss'
import type { BaseBreadcrumbsEmits, BaseBreadcrumbsProps, BreadcrumbItem } from './BaseBreadcrumbs.types'

const props = withDefaults(defineProps<BaseBreadcrumbsProps>(), {
	separator: 'chevron',
	variant: 'default',
	maxItems: 0,
	showHome: false,
	homeIcon: 'home',
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-breadcrumbs', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: [
		'root',
		'list',
		'item',
		'ellipsisBtn',
		'link',
		'current',
		'separator',
		'separatorIcon',
		'separatorText',
		'homeIcon',
		'itemIcon',
		'itemText',
		'currentIcon',
		'currentText',
	],
})

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
	/* istanbul ignore next — defensive: home-кнопка рендерится только при items.length > 0 */
	if (props.items[0]) {
		navigate(props.items[0])
	}
}
</script>
