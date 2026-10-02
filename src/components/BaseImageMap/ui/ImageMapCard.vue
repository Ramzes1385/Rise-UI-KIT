<template>
	<div class="base-image-map-card" :class="{ 'base-image-map-card--full': isFull }">
		<img v-if="item.object.image" class="base-image-map-card__image" :src="item.object.image" :alt="item.object.imageAlt ?? ''" />
		<BaseText v-if="!isFull" tag="p" class="base-image-map-card__title">{{ item.object.title }}</BaseText>
		<BaseText v-if="item.object.group && item.group" tag="p" class="base-image-map-card__group">{{ item.group.title }}</BaseText>
		<p v-if="hours" class="base-image-map-card__hours" :class="{ 'base-image-map-card__hours--open': hours.isOpen }">
			<span class="base-image-map-card__hours-dot" aria-hidden="true" />{{ hours.text }}
		</p>
		<BaseText v-if="item.object.description" tag="p" class="base-image-map-card__text">{{ item.object.description }}</BaseText>
		<BaseText v-if="isFull && hours" tag="p" class="base-image-map-card__schedule-title">{{ UI_IMAGE_MAP.HOURS }}</BaseText>
		<dl v-if="isFull && hours" class="base-image-map-card__schedule">
			<div
				v-for="row in hours.schedule"
				:key="row.day"
				class="base-image-map-card__schedule-row"
				:class="{ 'base-image-map-card__schedule-row--today': row.isToday }">
				<dt>{{ row.day }}</dt>
				<dd>{{ row.text }}</dd>
			</div>
		</dl>
		<video v-if="isFull && item.object.video" class="base-image-map-card__video" :src="item.object.video" controls preload="metadata" />
		<div v-if="isFull && item.object.links?.length" class="base-image-map-card__links">
			<BaseLink
				v-for="link in item.object.links"
				:key="link.href + link.label"
				:href="link.href"
				:target="link.isExternal ? '_blank' : undefined"
				:label="link.label" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseLink } from '@components/BaseLink'
import { BaseText } from '@components/BaseText'
import { UI_IMAGE_MAP } from '@/locales/messages'
import type { ImageMapCardProps } from '../types/ImageMapCard.types'

defineProps<ImageMapCardProps>()
</script>
