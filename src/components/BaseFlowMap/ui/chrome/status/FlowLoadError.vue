<template>
	<div class="base-flow-map__load-error" role="alert">
		<span>{{ UI_FLOW_MAP.LOAD_ERROR }}</span>
		<BaseButton variant="soft" @click="emit('retry')">{{ UI_FLOW_MAP.LOAD_RETRY }}</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { UI_FLOW_MAP } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'

const emit = defineEmits<{ retry: [] }>()
</script>
