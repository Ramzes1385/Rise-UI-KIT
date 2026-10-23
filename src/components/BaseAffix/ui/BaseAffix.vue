<template>
	<div ref="rootRef" :class="[ui('root'), modifiers, classes.root]" :style="rootStyle">
		<slot :is-fixed="isFixed" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseAffix.style.scss'
import { useBaseAffix } from '../model/useBaseAffix'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseAffixEmits, BaseAffixProps, BaseAffixSlots } from '../types/BaseAffix.types'

const props = withDefaults(
	defineProps<BaseAffixProps>(),
	kitDefaults('BaseAffix', {
		variant: DEFAULT_VARIANT,
		target: null,
		hasShadow: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseAffixEmits>()
defineSlots<BaseAffixSlots>()

const { rootRef, isFixed, classes, ui, modifiers, rootStyle } = useBaseAffix(props, emit)
</script>
