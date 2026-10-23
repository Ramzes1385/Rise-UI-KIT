<template>
	<BasePopover :is-open="connect.isOpen.value" :anchor="connect.anchor.value" :aria-label="connect.title" @close="connect.close">
		<BaseAutocomplete
			:model-value="null"
			:options="connect.options.value"
			:label="connect.title"
			:placeholder="connect.placeholder"
			@update:model-value="connect.choose" />
	</BasePopover>
</template>

<script setup lang="ts">
import { BasePopover } from '@components/BasePopover'
import { BaseAutocomplete } from '@components/BaseAutocomplete'
import { useFlowEditConnect } from '../../../model/edit/overlay/useFlowEditConnect'

const connect = useFlowEditConnect()
</script>
