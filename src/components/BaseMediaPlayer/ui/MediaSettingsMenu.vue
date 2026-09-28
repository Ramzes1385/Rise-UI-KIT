<template>
	<BaseDropdownMenu :items="items" position="top-end" :aria-label="label">
		<BaseButton variant="ghost" class="base-media-player__button" :aria-label="label">
			<template #left><BaseIcon name="settings" /></template>
		</BaseButton>
	</BaseDropdownMenu>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import { useMediaSettingsMenu } from '../model/useMediaSettingsMenu'
import type { MediaSettingsMenuEmits, MediaSettingsMenuProps } from '../types/MediaSettingsMenu.types'

const props = defineProps<MediaSettingsMenuProps>()
const emit = defineEmits<MediaSettingsMenuEmits>()

const { label, items } = useMediaSettingsMenu(props, emit)
</script>
