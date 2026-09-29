<template>
	<header
		class="base-header"
		:class="[variantClass, { 'base-header--sticky': isSticky, 'base-header--has-menu': hasMenu }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseContainer :size="containerSize" class="base-header__inner" :custom-class="{ root: classes.inner }" :size-scale="sizeScale">
			<div class="base-header__start">
				<slot name="start">
					<BaseLink v-if="title && (to || href)" :to="to" :href="href" class="base-header__title" :class="classes.title">
						{{ title }}
					</BaseLink>
					<span v-else-if="title" class="base-header__title" :class="classes.title">{{ title }}</span>
				</slot>
			</div>
			<div v-if="slots.default" class="base-header__center">
				<slot />
			</div>
			<div class="base-header__end">
				<slot name="end" />
				<BaseButton
					v-if="hasMenu"
					variant="ghost"
					class="base-header__toggle"
					:class="classes.toggle"
					:aria-label="resolvedMenuLabel"
					aria-haspopup="dialog"
					:aria-expanded="isMenuOpen ? 'true' : 'false'"
					@click="isMenuOpen = true">
					<BaseIcon name="menu" />
				</BaseButton>
			</div>
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
} = useBaseHeader(props)

defineExpose(exposed)
</script>
