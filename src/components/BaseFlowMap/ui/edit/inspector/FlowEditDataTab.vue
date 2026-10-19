<template>
	<div class="base-flow-map__edit-inspector" role="tabpanel">
		<section>
			<h3 class="base-flow-map__edit-caption">{{ data.text.metrics }}</h3>
			<ul class="base-flow-map__edit-hooks">
				<li v-for="metric in data.metrics.value" :key="metric.id" class="base-flow-map__edit-hook">
					<span>{{ metric.label }}</span>
					<strong>{{ metric.value }} {{ metric.unit }}</strong>
				</li>
			</ul>
		</section>
		<section>
			<h3 class="base-flow-map__edit-caption">{{ data.text.fields }}</h3>
			<ul class="base-flow-map__edit-hooks">
				<li v-for="field in data.fields.value" :key="field.id" class="base-flow-map__edit-hook">
					<span>{{ field.label }}: {{ field.value }}</span>
					<BaseButton
						variant="ghost"
						:aria-label="formatMessage(data.text.remove, { name: field.label })"
						@click="data.remove(field.id)">
						<BaseIcon name="trash" />
					</BaseButton>
				</li>
			</ul>
			<p v-if="data.metrics.value.length + data.fields.value.length === 0" class="base-flow-map__edit-hint">{{ data.text.empty }}</p>
			<BaseInput v-model="data.name.value" :label="data.text.name" />
			<BaseInput v-model="data.value.value" :label="data.text.value" />
			<BaseButton variant="soft" @click="data.add">{{ data.text.add }}</BaseButton>
		</section>
	</div>
</template>

<script setup lang="ts">
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { useFlowEditData } from '../../../model/edit/inspector/useFlowEditData'

const props = defineProps<{ id: string }>()

const data = useFlowEditData(props)
</script>
