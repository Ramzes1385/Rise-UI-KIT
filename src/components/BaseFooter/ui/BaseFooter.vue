<template>
	<footer
		:class="[ui('root'), variantClass, { 'base-footer--compact': isCompact }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<component :is="'script'" v-if="structuredData" type="application/ld+json" v-html="structuredData" />
		<BaseContainer v-if="hasTop" :size="containerSize" :class="ui('top')" :size-scale="sizeScale">
			<div v-if="slots.top" :class="ui('about')">
				<slot name="top" />
			</div>
			<div v-if="columns?.length" :class="ui('columns')">
				<nav v-for="column in columns" :key="column.title" :class="ui('column')" :aria-label="column.title">
					<p :class="ui('column-title')" aria-hidden="true">{{ column.title }}</p>
					<ul :class="ui('links')">
						<li v-for="link in column.links" :key="link.label">
							<BaseLink :to="link.to" :href="link.href" variant="ghost">{{ link.label }}</BaseLink>
						</li>
					</ul>
				</nav>
			</div>
		</BaseContainer>
		<BaseContainer
			v-if="hasBar"
			:size="containerSize"
			:class="ui('inner')"
			:custom-class="{ root: classes.inner }"
			:size-scale="sizeScale">
			<div v-if="slots.start" :class="ui('start')">
				<slot name="start" />
			</div>
			<div v-if="slots.default" :class="ui('center')">
				<slot />
			</div>
			<div v-if="slots.end" :class="ui('end')">
				<slot name="end" />
			</div>
		</BaseContainer>
	</footer>
</template>

<script setup lang="ts">
import '@components/BaseLink/styles/BaseLink.style.scss'
import '../styles/BaseFooter.style.scss'
import { BaseLink } from '@components/BaseLink'
import { useBaseFooter } from '../model/useBaseFooter'
import { BaseContainer } from '@components/BaseContainer'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseFooterProps, BaseFooterSlots } from '../types/BaseFooter.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseFooterProps>(),
	kitDefaults('BaseFooter', {
		variant: DEFAULT_VARIANT,
		containerSize: 'full',
		isCompact: false,
		seo: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseFooterSlots>()
const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, slots, hasTop, hasBar, structuredData, ui } =
	useBaseFooter(props)
</script>
