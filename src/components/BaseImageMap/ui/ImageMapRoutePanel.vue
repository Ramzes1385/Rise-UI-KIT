<template>
	<section class="base-image-map__route" :class="customClass" :aria-label="UI_IMAGE_MAP_ROUTES.TITLE">
		<p class="base-image-map__route-title" aria-hidden="true">{{ UI_IMAGE_MAP_ROUTES.TITLE }}</p>
		<div class="base-image-map__route-fields">
			<BaseSelect
				ref="fromRef"
				class="base-image-map__route-field"
				:label="UI_IMAGE_MAP_ROUTES.FROM"
				:placeholder="UI_IMAGE_MAP_ROUTES.PLACEHOLDER"
				:options="options"
				:model-value="value.from ?? ''"
				is-searchable
				@update:model-value="$emit('update:value', { ...value, from: String($event) })" />
			<BaseButton
				class="base-image-map__route-swap"
				variant="ghost"
				:aria-label="UI_IMAGE_MAP_ROUTES.SWAP"
				:is-disabled="!value.from && !value.to"
				@click="$emit('update:value', { ...value, from: value.to, to: value.from })">
				<template #left><BaseIcon name="sort" /></template>
			</BaseButton>
			<BaseSelect
				class="base-image-map__route-field"
				:label="UI_IMAGE_MAP_ROUTES.TO"
				:placeholder="UI_IMAGE_MAP_ROUTES.PLACEHOLDER"
				:options="options"
				:model-value="value.to ?? ''"
				is-searchable
				@update:model-value="$emit('update:value', { ...value, to: String($event) })" />
		</div>
		<div v-if="hasStepFree || value.from || value.to" class="base-image-map__route-options">
			<BaseSwitch
				v-if="hasStepFree"
				:label="UI_IMAGE_MAP_ROUTES.STEP_FREE"
				:model-value="Boolean(value.isStepFree)"
				@update:model-value="$emit('update:value', { ...value, isStepFree: $event })" />
			<BaseButton v-if="value.from || value.to" variant="ghost" :size-scale="85" @click="clear">
				{{ UI_IMAGE_MAP_ROUTES.CLEAR }}
			</BaseButton>
		</div>
		<p class="base-image-map__route-summary" :class="{ 'base-image-map__route-summary--error': isUnreachable }" role="status">
			{{ summary }}
		</p>
		<ol v-if="steps.length" class="base-image-map__route-steps" :aria-label="UI_IMAGE_MAP_ROUTES.STEPS">
			<li v-for="(step, index) in steps" :key="index" class="base-image-map__route-step-row">
				<button
					type="button"
					class="base-image-map__route-step"
					:class="`base-image-map__route-step--${step.kind}`"
					@click="$emit('show-layer', step.layer)">
					<span class="base-image-map__route-step-text">{{ step.text }}</span>
					<span v-if="step.meters" class="base-image-map__route-step-meters">
						<span class="base-image-map__route-sr">, </span>
						{{ formatMessage(UI_IMAGE_MAP_ROUTES.METERS, { meters: step.meters }) }}
					</span>
				</button>
			</li>
		</ol>
	</section>
</template>

<script setup lang="ts">
import '../styles/ImageMapRoutes.style.scss'
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { BaseSwitch } from '@components/BaseSwitch'
import { UI_IMAGE_MAP_ROUTES } from '@/locales/messages'
import { useRoutePanel } from '../model/routes/useRoutePanel'
import type { ImageMapRoutePanelEmits, ImageMapRoutePanelProps } from '../types/ImageMapRoutes.types'

const props = defineProps<ImageMapRoutePanelProps>()

const emit = defineEmits<ImageMapRoutePanelEmits>()

const { clear } = useRoutePanel(props, emit)
</script>
