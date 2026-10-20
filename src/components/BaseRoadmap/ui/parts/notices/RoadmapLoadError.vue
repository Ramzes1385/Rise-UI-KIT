<template>
	<div class="base-roadmap__load-error" role="alert">
		<span>{{ UI_ROADMAP.LOAD_ERROR }}</span>
		<BaseButton variant="soft" @click="emit('retry')">{{ UI_ROADMAP.LOAD_RETRY }}</BaseButton>
	</div>
</template>

<script setup lang="ts">
import '../../../styles/_roadmap-reject.scss'
import { UI_ROADMAP } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'

const emit = defineEmits<{ retry: [] }>()
</script>
