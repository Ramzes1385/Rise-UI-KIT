<template>
	<!--
		Каркас страницы: ссылка «Перейти к содержимому», шапка, боковое меню, основное содержимое (<main>) и подвал.
		Шапка прилипает к верху, боковое меню стоит под ней и прокручивается отдельно, подвал прижат к низу окна
	-->
	<div
		class="base-layout"
		:class="[
			{
				'base-layout--sticky-header': isHeaderSticky,
				'base-layout--mobile-sidebar': isSidebarVisibleOnMobile,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, headerOffsetStyle]">
		<a v-if="hasSkipLink" class="base-layout__skip-link" :href="`#${resolvedMainId}`" @click.prevent="focusMain">
			{{ skipLinkLabel ?? UI_TEXT.SKIP_TO_CONTENT }}
		</a>
		<div v-if="slots.header" ref="headerRef" class="base-layout__header" :class="classes.header">
			<slot name="header" />
		</div>
		<div class="base-layout__body">
			<div v-if="slots.sidebar" class="base-layout__sidebar" :class="classes.sidebar">
				<slot name="sidebar" />
			</div>
			<div class="base-layout__content">
				<!-- tabindex="-1": на <main> переводит фокус ссылка «Перейти к содержимому» -->
				<main :id="resolvedMainId" ref="mainRef" class="base-layout__main" :class="classes.main" tabindex="-1">
					<slot />
				</main>
				<div v-if="slots.footer" class="base-layout__footer" :class="classes.footer">
					<slot name="footer" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseLayout.style.scss'
import { UI_TEXT } from '@/locales/messages'
import { useBaseLayout } from '../model/useBaseLayout'
import { kitDefaults } from '@composables/useDefaults'
import type { BaseLayoutProps, BaseLayoutSlots } from '../types/BaseLayout.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'

const props = withDefaults(
	defineProps<BaseLayoutProps>(),
	kitDefaults('BaseLayout', {
		variant: DEFAULT_VARIANT,
		hasSkipLink: true,
		isHeaderSticky: true,
		isSidebarVisibleOnMobile: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseLayoutSlots>()

const { sizeScaleStyle, classes, slots, resolvedMainId, headerRef, mainRef, headerOffsetStyle, focusMain } = useBaseLayout(props)
</script>
