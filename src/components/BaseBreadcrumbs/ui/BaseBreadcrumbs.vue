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
import { useBaseComponent } from '@composables/useBaseComponent'
import { navigateAndEmit } from '@utils/navigationUtils'
import { buildBreadcrumbsSchema } from '@utils/schemaUtils'
import { computed, ref } from 'vue'

import '../styles/BaseBreadcrumbs.style.scss'
import type { BaseBreadcrumbsEmits, BaseBreadcrumbsProps, BreadcrumbItem } from '../model/BaseBreadcrumbs.types'

const props = defineProps<BaseBreadcrumbsProps>()

const separator = computed(() => props.separator ?? 'chevron')
const maxItems = computed(() => props.maxItems ?? 0)
const showHome = computed(() => props.showHome ?? false)
const homeIcon = computed(() => props.homeIcon ?? 'home')
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-breadcrumbs',
	getVariant: () => props.variant,
	getSizeScale: () => sizeScale.value,
	getColor: () => props.color,
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

const visibleItems = computed<BreadcrumbItem[]>(() => {
	if (maxItems.value <= 0 || isExpanded.value) return props.items
	if (props.items.length <= maxItems.value) return props.items
	return props.items.slice(-maxItems.value)
})

const collapsedItems = computed<BreadcrumbItem[]>(() => {
	if (maxItems.value <= 0 || isExpanded.value) return []
	if (props.items.length <= maxItems.value) return []
	return props.items.slice(0, -maxItems.value)
})

/** Schema.org JSON-LD для SEO */
const schemaJson = computed((): string => buildBreadcrumbsSchema(props.items))

function isCurrent(index: number): boolean {
	return index === visibleItems.value.length - 1
}

function realIndex(visibleIdx: number): number {
	return props.items.length - visibleItems.value.length + visibleIdx
}

function navigate(item: BreadcrumbItem): void {
	navigateAndEmit({ to: item.to, href: item.href }, (url) => emit('navigate', url))
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
