<template>
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
import '../styles/BaseBackTop.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseFab } from '@components/BaseFab'
import { kitDefaults } from '@composables/useDefaults'
import { useBaseBackTop } from '../model/useBaseBackTop'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseBackTopEmits, BaseBackTopProps } from '../types/BaseBackTop.types'

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

const { classes, isVisible, handleClick } = useBaseBackTop(props, emit)
</script>
