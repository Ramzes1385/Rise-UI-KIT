<template>
	<div class="base-image-map-card" :class="{ 'base-image-map-card--full': isFull }">
		<img v-if="item.object.image" class="base-image-map-card__image" :src="item.object.image" :alt="item.object.imageAlt ?? ''" />
		<BaseText v-if="!isFull" tag="p" class="base-image-map-card__title">{{ item.object.title }}</BaseText>
		<BaseText v-if="item.object.group && item.group" tag="p" class="base-image-map-card__group">{{ item.group.title }}</BaseText>
		<BaseText v-if="item.object.description" tag="p" class="base-image-map-card__text">{{ item.object.description }}</BaseText>
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
import type { ImageMapCardProps } from '../types/ImageMapCard.types'

defineProps<ImageMapCardProps>()
</script>
