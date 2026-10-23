<template>
	<span v-if="separator === 'slash'" class="base-breadcrumbs__sep-text" :class="separatorTextClass">/</span>
	<span v-else-if="separator === 'dot'" class="base-breadcrumbs__sep-text" :class="separatorTextClass">•</span>
	<BaseIcon
		v-else
		:name="separator === 'arrow' ? 'arrow-right' : 'chevron-right'"
		:size-scale="calcIconScale('sm', sizeScale)"
		:custom-class="separatorIconClass" />
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/media/iconUtils'
import type { BreadcrumbsSeparatorProps } from '../types/BreadcrumbsSeparator.types'

defineProps<BreadcrumbsSeparatorProps>()
</script>
