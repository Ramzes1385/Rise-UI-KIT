<template>
	<div
		class="base-loader"
		:class="[`base-loader--${variant}`, { 'base-loader--overlay': isOverlay }, classes.root]"
		:style="[sizeScaleStyle, customColorStyle]"
		role="status"
		:aria-label="accessibleName">
		<div class="base-loader__animation" :class="classes.animation" aria-hidden="true">
			<!-- Spinner -->
			<template v-if="variant === 'spinner'">
				<svg class="base-loader__spinner" :class="classes.spinner" viewBox="0 0 50 50">
					<circle class="base-loader__spinner-track" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
					<circle class="base-loader__spinner-fill" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
				</svg>
			</template>

			<!-- Dots -->
			<template v-if="variant === 'dots'">
				<span class="base-loader__dot"></span>
				<span class="base-loader__dot"></span>
				<span class="base-loader__dot"></span>
			</template>

			<!-- Pulse -->
			<template v-if="variant === 'pulse'">
				<span class="base-loader__pulse"></span>
			</template>

			<!-- Bars -->
			<template v-if="variant === 'bars'">
				<span class="base-loader__bar"></span>
				<span class="base-loader__bar"></span>
				<span class="base-loader__bar"></span>
				<span class="base-loader__bar"></span>
			</template>
		</div>

		<span v-if="hasLabel" class="base-loader__label" :class="classes.label">{{ resolvedLabel }}</span>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { kitDefaults } from '@composables/useDefaults'
import { useSizeScale } from '@composables/useSizeScale'
import '../styles/BaseLoader.style.scss'
import type { BaseLoaderProps } from '../model/BaseLoader.types'

const props = withDefaults(defineProps<BaseLoaderProps>(), kitDefaults('BaseLoader', {
	variant: 'spinner',
	hasLabel: false,
	isOverlay: false,
	sizeScale: SIZE_SCALE_DEFAULT,
}))
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'animation', 'spinner', 'label'],
})
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

/**
 * Доступное имя статуса берётся из label, чтобы кастомная подпись («Сохранение…»)
 * не расходилась с фиксированным «Загрузка». Завершающее многоточие — визуальный
 * признак процесса, в имени оно лишнее; пустой label даёт имя по умолчанию.
 */
/** Подпись: своя или «Загрузка...» на текущем языке */
const resolvedLabel = computed((): string => props.label ?? UI_TEXT.LOADING)

const accessibleName = computed((): string => resolvedLabel.value.replace(/[.…\s]+$/, '') || UI_TEXT.LOADING_ARIA)
</script>
