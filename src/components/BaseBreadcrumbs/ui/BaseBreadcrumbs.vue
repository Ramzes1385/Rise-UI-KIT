<template>
	<!-- nav, а не div: aria-label на элементе без роли не озвучивается, и ориентир навигации не появлялся -->
	<nav
		class="base-breadcrumbs"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="UI_ARIA.BREADCRUMBS_NAV">
		<!-- Schema.org JSON-LD для SEO. v-html безопасен: schemaJson экранирует </script> (см. schemaUtils). -->
		<!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
		<component :is="'script'" type="application/ld+json" v-html="schemaJson" />

		<ol class="base-breadcrumbs__list" :class="classes.list" itemscope itemtype="https://schema.org/BreadcrumbList">
			<li
				v-if="showHome && items.length"
				class="base-breadcrumbs__item base-breadcrumbs__item--home"
				:class="classes.item"
				itemprop="itemListElement"
				itemscope
				itemtype="https://schema.org/ListItem">
				<slot name="home">
					<!-- Ссылка содержит только декоративную иконку, имя берём у крошки, на которую она ведёт -->
					<component
						:is="getLink(items[0]!).is"
						v-bind="getLink(items[0]!).attrs"
						class="base-breadcrumbs__link base-breadcrumbs__link--home"
						:class="classes.link"
						:aria-label="items[0]?.label"
						@click="handleItemClick(items[0]!)">
						<BaseIcon :name="homeIcon" :size-scale="iconScale" :custom-class="classes.homeIcon" />
					</component>
				</slot>
				<meta itemprop="position" content="1" />
				<span class="base-breadcrumbs__sep" :class="classes.separator" aria-hidden="true">
					<slot name="separator" :index="-1">
						<BreadcrumbsSeparator
							:separator="separator"
							:size-scale="sizeScale"
							:separator-icon-class="classes.separatorIcon"
							:separator-text-class="classes.separatorText" />
					</slot>
				</span>
			</li>

			<template v-if="collapsedItems.length > 0">
				<li class="base-breadcrumbs__item base-breadcrumbs__item--ellipsis" :class="classes.item">
					<button
						type="button"
						class="base-breadcrumbs__link base-breadcrumbs__ellipsis-btn"
						:class="classes.ellipsisBtn"
						@click="isExpanded = true">
						…
					</button>
				</li>
				<li class="base-breadcrumbs__item" :class="classes.item" aria-hidden="true">
					<span class="base-breadcrumbs__sep" :class="classes.separator">
						<slot name="separator" :index="0">
							<BreadcrumbsSeparator
								:separator="separator"
								:size-scale="sizeScale"
								:separator-icon-class="classes.separatorIcon"
								:separator-text-class="classes.separatorText" />
						</slot>
					</span>
				</li>
			</template>

			<li
				v-for="(item, index) in visibleItems"
				:key="`${item?.label ?? ''}-${index}`"
				class="base-breadcrumbs__item"
				:class="[{ 'base-breadcrumbs__item--current': isCurrent(index) }, classes.item]"
				itemprop="itemListElement"
				itemscope
				itemtype="https://schema.org/ListItem">
				<slot name="item" :item="item" :index="realIndex(index)">
					<!-- Крошка с адресом — ссылка (RouterLink приложения или <a href>), без адреса — кнопка с событием item-click -->
					<component
						:is="getLink(item).is"
						v-if="!isCurrent(index)"
						v-bind="getLink(item).attrs"
						class="base-breadcrumbs__link"
						:class="classes.link"
						@click="handleItemClick(item)">
						<BaseIcon
							v-if="item.icon"
							:name="item.icon"
							:size-scale="iconScale"
							class="base-breadcrumbs__icon"
							:custom-class="classes.itemIcon" />
						<span class="base-breadcrumbs__text" :class="classes.itemText" itemprop="name">{{ item.label }}</span>
					</component>
					<span v-else class="base-breadcrumbs__current" :class="classes.current" aria-current="page">
						<BaseIcon
							v-if="item.icon"
							:name="item.icon"
							:size-scale="iconScale"
							class="base-breadcrumbs__icon"
							:custom-class="classes.currentIcon" />
						<span class="base-breadcrumbs__text" :class="classes.currentText" itemprop="name">{{ item.label }}</span>
					</span>
				</slot>
				<meta :itemprop="'url'" :content="item.to || item.href || ''" />
				<meta :itemprop="'position'" :content="String(realIndex(index) + 1)" />

				<span v-if="!isCurrent(index)" class="base-breadcrumbs__sep" :class="classes.separator" aria-hidden="true">
					<slot name="separator" :index="realIndex(index)">
						<BreadcrumbsSeparator
							:separator="separator"
							:size-scale="sizeScale"
							:separator-icon-class="classes.separatorIcon"
							:separator-text-class="classes.separatorText" />
					</slot>
				</span>
			</li>
		</ol>
	</nav>
</template>

<script setup lang="ts">
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import BreadcrumbsSeparator from './BreadcrumbsSeparator.vue'
import { useBaseBreadcrumbs } from '../model/useBaseBreadcrumbs'
import '../styles/BaseBreadcrumbs.style.scss'
import type { BaseBreadcrumbsEmits, BaseBreadcrumbsProps, BaseBreadcrumbsSlots } from '../types/BaseBreadcrumbs.types'

const props = withDefaults(
	defineProps<BaseBreadcrumbsProps>(),
	kitDefaults('BaseBreadcrumbs', {
		variant: DEFAULT_VARIANT,
		separator: 'chevron',
		maxItems: 0,
		showHome: false,
		homeIcon: 'home',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseBreadcrumbsEmits>()
defineSlots<BaseBreadcrumbsSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isExpanded,
	visibleItems,
	collapsedItems,
	iconScale,
	schemaJson,
	isCurrent,
	realIndex,
	getLink,
	handleItemClick,
} = useBaseBreadcrumbs(props, emit)
</script>
