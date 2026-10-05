<template>
	<Transition name="base-back-top" :css="!isInstant">
		<BaseFab
			v-if="isVisible"
			:class="[ui('root'), classes.root]"
			:variant="variant"
			:label="label ?? UI_ARIA.BACK_TO_TOP"
			:icon="icon"
			:is-extended="isExtended"
			:position="position"
			:is-contained="isContained"
			:size-scale="sizeScale"
			:color="color"
			:ui="{ icon: ui('icon'), label: ui('label') }"
			:custom-class="{ icon: classes.icon, label: classes.label }"
			@click="handleClick" />
	</Transition>
</template>

<script setup lang="ts">
import '../styles/BaseBackTop.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseFab } from '@components/BaseFab'
import { useBaseBackTop } from '../model/useBaseBackTop'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseBackTopEmits, BaseBackTopProps } from '../types/BaseBackTop.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

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

const { ui, classes, isVisible, isInstant, handleClick } = useBaseBackTop(props, emit)
</script>
