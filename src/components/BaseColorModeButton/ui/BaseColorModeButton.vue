<template>
	<BaseTooltip :text="resolvedLabel" is-wrapperless>
		<BaseButton
			:class="ui('root')"
			:variant="variant"
			:size-scale="sizeScale"
			:color="color"
			:custom-class="classes.root"
			:is-disabled="isDisabled"
			:aria-label="resolvedLabel"
			:aria-pressed="isDark ? 'true' : 'false'"
			@click="handleClick">
			<span :class="ui('icons')">
				<Transition name="base-color-mode-button__icon">
					<BaseIcon
						:key="isDark ? 'moon' : 'sun'"
						:name="isDark ? 'moon' : 'sun'"
						:size-scale="iconScale"
						:class="ui('icon')"
						:custom-class="classes.icon" />
				</Transition>
			</span>
		</BaseButton>
	</BaseTooltip>
</template>

<script setup lang="ts">
import '../styles/BaseColorModeButton.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseTooltip } from '@components/BaseTooltip'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import { useBaseColorModeButton } from '../model/useBaseColorModeButton'
import type { BaseColorModeButtonEmits, BaseColorModeButtonProps } from '../types/BaseColorModeButton.types'

const props = withDefaults(
	defineProps<BaseColorModeButtonProps>(),
	kitDefaults('BaseColorModeButton', {
		variant: 'ghost',
		sizeScale: SIZE_SCALE_DEFAULT,
		isDisabled: false,
	}),
)

const emit = defineEmits<BaseColorModeButtonEmits>()

const { ui, classes, isDark, resolvedLabel, iconScale, handleClick } = useBaseColorModeButton(props, emit)
</script>
