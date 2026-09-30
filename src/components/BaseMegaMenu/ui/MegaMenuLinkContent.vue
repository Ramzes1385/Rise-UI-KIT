<template>
	<span v-if="link.icon" class="base-mega-menu__link-icon" aria-hidden="true">
		<BaseIcon :name="link.icon" />
	</span>
	<span class="base-mega-menu__link-text">
		<span class="base-mega-menu__link-label">
			{{ link.label }}
			<span v-if="link.badge" class="base-mega-menu__link-badge">{{ link.badge }}</span>
		</span>
		<span v-if="link.description" class="base-mega-menu__link-desc">{{ link.description }}</span>
	</span>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import type { MegaMenuLinkContentProps } from '../types/BaseMegaMenu.types'

defineOptions({ name: 'MegaMenuLinkContent' })

defineProps<MegaMenuLinkContentProps>()
</script>
