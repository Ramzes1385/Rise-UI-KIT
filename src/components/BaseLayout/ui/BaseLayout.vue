<template>
	<div
		:class="[
			ui('root'),
			{
				'base-layout--sticky-header': isHeaderSticky,
				'base-layout--mobile-sidebar': isSidebarVisibleOnMobile,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, headerOffsetStyle]">
		<a v-if="hasSkipLink" :class="ui('skip-link')" :href="`#${resolvedMainId}`" @click.prevent="focusMain">
			{{ skipLinkLabel ?? UI_TEXT.SKIP_TO_CONTENT }}
		</a>
		<div v-if="slots.header" ref="headerRef" :class="[ui('header'), classes.header]">
			<slot name="header" />
		</div>
		<div :class="ui('body')">
			<div v-if="slots.sidebar" :class="[ui('sidebar'), classes.sidebar]">
				<slot name="sidebar" />
			</div>
			<div :class="ui('content')">
				<main :id="resolvedMainId" ref="mainRef" :class="[ui('main'), classes.main]" tabindex="-1">
					<slot />
				</main>
				<div v-if="slots.footer" :class="[ui('footer'), classes.footer]">
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
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseLayoutProps, BaseLayoutSlots } from '../types/BaseLayout.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

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

const { sizeScaleStyle, classes, slots, resolvedMainId, headerRef, mainRef, headerOffsetStyle, focusMain, ui } = useBaseLayout(props)
</script>
