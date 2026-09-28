<template>
	<!--
		Кнопка «Наверх» (BaseFab): появляется после прокрутки на visibilityHeight, возвращает окно или контейнер к началу
		(плавно, если пользователь не ограничил анимацию) и переводит фокус в начало страницы
	-->
	<transition name="base-back-top">
		<BaseFab
			v-if="isVisible"
			class="base-back-top"
			:class="classes.root"
			:variant="variant"
			:label="label ?? UI_ARIA.BACK_TO_TOP"
			:icon="icon"
			:is-extended="isExtended"
			:position="position"
			:is-contained="isContained"
			:size-scale="sizeScale"
			:color="color"
			:custom-class="{ icon: classes.icon, label: classes.label }"
			@click="handleClick" />
	</transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { BaseFab } from '@components/BaseFab'
import { kitDefaults } from '@composables/useDefaults'
import { useCustomClass } from '@composables/useCustomClass'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import '../styles/BaseBackTop.style.scss'
import type { BaseBackTopEmits, BaseBackTopProps } from '../model/BaseBackTop.types'

const props = withDefaults(
	defineProps<BaseBackTopProps>(),
	kitDefaults('BaseBackTop', {
		variant: DEFAULT_VARIANT,
		visibilityHeight: 400,
		icon: 'chevron-up',
		isExtended: false,
		position: 'bottom-right',
		isContained: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseBackTopEmits>()

/** Классы по элементам (customClass): оформление задаёт BaseFab */
const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'icon', 'label'] })

const isVisible = ref(false)
let scrollTarget: HTMLElement | Window | null = null

function resolveElement(value: string | HTMLElement): HTMLElement | null {
	return typeof value === 'string' ? document.querySelector<HTMLElement>(value) : value
}

function getScrollTop(target: HTMLElement | Window): number {
	return target === window ? window.scrollY : (target as HTMLElement).scrollTop
}

function update(): void {
	isVisible.value = scrollTarget !== null && getScrollTop(scrollTarget) > props.visibilityHeight
}

function detach(): void {
	scrollTarget?.removeEventListener('scroll', update)
	scrollTarget = null
}

/** Подписка на прокрутку окна или контейнера из target (контейнер по селектору ищется после монтирования) */
function attach(): void {
	detach()
	scrollTarget = props.target ? (resolveElement(props.target) ?? window) : window
	scrollTarget.addEventListener('scroll', update, { passive: true })
	update()
}

onMounted(attach)
watch(() => props.target, attach)
onBeforeUnmount(detach)

/** Фокус в начало: элемент без tabindex получает tabindex="-1" до потери фокуса */
function focusTop(target: HTMLElement | Window): void {
	const fallback = target === window ? (document.querySelector<HTMLElement>('main') ?? document.body) : (target as HTMLElement)
	const element = props.focusTarget ? resolveElement(props.focusTarget) : fallback
	if (!element) return
	if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) {
		element.setAttribute('tabindex', '-1')
		element.addEventListener('blur', () => element.removeAttribute('tabindex'), { once: true })
	}
	element.focus({ preventScroll: true })
}

function handleClick(event: MouseEvent): void {
	const target = scrollTarget as HTMLElement | Window
	const isReducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
	target.scrollTo({ top: 0, behavior: isReducedMotion ? 'auto' : 'smooth' })
	focusTop(target)
	emit('click', event)
}
</script>
