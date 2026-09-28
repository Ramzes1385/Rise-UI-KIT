<template>
	<!--
		Шапка сайта или приложения (<header> — ориентир banner): название, навигация, действия. Со слотом menu на экране
		уже 768px навигация прячется, а кнопка «Меню» открывает её в выдвижной панели (BaseDrawer)
	-->
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
import { computed, ref, useSlots, watch } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { BaseButton } from '@components/BaseButton'
import { BaseDrawer } from '@components/BaseDrawer'
import { kitDefaults } from '@composables/useDefaults'
import { BaseContainer } from '@components/BaseContainer'
import { useBreakpoint } from '@composables/useBreakpoint'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseHeader.style.scss'
import type { BaseHeaderProps, BaseHeaderSlots } from '../model/BaseHeader.types'

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
const slots = useSlots()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-header', props, [
	'root',
	'inner',
	'title',
	'toggle',
])

const hasMenu = computed(() => Boolean(slots.menu))
const resolvedMenuLabel = computed(() => props.menuLabel ?? UI_ARIA.MENU)

const isMenuOpen = ref(false)

function closeMenu(): void {
	isMenuOpen.value = false
}

/** Окно стало шире 768px — навигация снова в шапке, выдвижное меню закрывается */
const { isMobile } = useBreakpoint()
watch(isMobile, value => {
	if (!value) closeMenu()
})

defineExpose({ openMenu: () => (isMenuOpen.value = true), closeMenu })
</script>
