<template>
	<header
		:class="[
			ui('root'),
			variantClass,
			`base-header--nav-${navAlign}`,
			{
				'base-header--sticky': isSticky && !isOverlay,
				'base-header--has-menu': hasMenu,
				'base-header--compact': isCompact,
				'base-header--overlay': isOverlay,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseContainer :size="containerSize" :class="ui('inner')" :custom-class="{ root: classes.inner }" :size-scale="sizeScale">
			<div :class="ui('start')">
				<slot name="start">
					<BaseLink v-if="title && (to || href)" :to="to" :href="href" :class="[ui('title'), classes.title]">
						{{ title }}
					</BaseLink>
					<span v-else-if="title" :class="[ui('title'), classes.title]">{{ title }}</span>
				</slot>
			</div>
			<div v-if="slots.default" :class="ui('center')">
				<slot />
			</div>
			<div :class="ui('end')">
				<slot name="end" />
				<BaseButton
					v-if="hasMenu"
					variant="ghost"
					:class="[ui('toggle'), classes.toggle]"
					:aria-label="resolvedMenuLabel"
					aria-haspopup="dialog"
					:aria-expanded="isMenuOpen ? 'true' : 'false'"
					@click="isMenuOpen = true">
					<BaseIcon name="menu" />
				</BaseButton>
			</div>
		</BaseContainer>
		<BaseContainer v-if="slots.bottom" :size="containerSize" :class="ui('bottom')" :size-scale="sizeScale">
			<slot name="bottom" />
		</BaseContainer>
		<BaseDrawer
			v-if="hasMenu"
			v-model:is-open="isMenuOpen"
			:direction="menuDirection"
			:title="resolvedMenuLabel"
			:size-scale="sizeScale">
			<slot name="menu" :close="closeMenu" />
		</BaseDrawer>
	</header>
</template>

<script setup lang="ts">
import '@components/BaseLink/styles/BaseLink.style.scss'
import '@components/BaseButton/styles/BaseButton.style.scss'
import '../styles/BaseHeader.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { BaseButton } from '@components/BaseButton'
import { BaseDrawer } from '@components/BaseDrawer'
import { useBaseHeader } from '../model/useBaseHeader'
import { BaseContainer } from '@components/BaseContainer'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseHeaderProps, BaseHeaderSlots } from '../types/BaseHeader.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseHeaderProps>(),
	kitDefaults('BaseHeader', {
		variant: DEFAULT_VARIANT,
		containerSize: 'full',
		isSticky: true,
		navAlign: 'center',
		isCompact: false,
		isOverlay: false,
		menuDirection: 'right',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseHeaderSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	slots,
	hasMenu,
	resolvedMenuLabel,
	isMenuOpen,
	closeMenu,
	exposed,
	ui,
} = useBaseHeader(props)

defineExpose(exposed)
</script>
