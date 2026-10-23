<template>
	<dl class="base-flow-map__edit-help">
		<template v-for="row in help.rows" :key="row.text">
			<dt>
				<BaseKbd v-for="key in row.keys.split(' ')" :key="key" :value="key" />
			</dt>
			<dd>{{ row.text }}</dd>
		</template>
	</dl>
</template>

<script setup lang="ts">
import { BaseKbd } from '@components/BaseKbd'
import { useFlowEditHelp } from '../../../model/edit/toolbar/useFlowEditHelp'

const help = useFlowEditHelp()
</script>
