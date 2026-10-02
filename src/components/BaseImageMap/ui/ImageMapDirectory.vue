<template>
	<aside class="base-image-map__directory" :class="classes.directory" :aria-label="UI_IMAGE_MAP.DIRECTORY">
		<BaseInput
			v-if="hasSearch"
			class="base-image-map__search"
			:model-value="search"
			:aria-label="UI_IMAGE_MAP.SEARCH"
			:placeholder="UI_IMAGE_MAP.SEARCH_PLACEHOLDER"
			@update:model-value="$emit('update:search', $event)">
			<template #prefix><BaseIcon name="search" /></template>
		</BaseInput>
		<div
			v-if="controls.length"
			class="base-image-map__filters"
			:class="classes.filters"
			role="group"
			:aria-label="UI_IMAGE_MAP.FILTERS">
			<template v-for="control in controls" :key="control.filter.id">
				<BaseCheckboxGroup
					v-if="control.type === 'checkbox'"
					:label="control.filter.title"
					:options="control.options"
					:model-value="control.selected"
					@update:model-value="$emit('set-filter', control.filter.id, $event.map(String))" />
				<BaseSelect
					v-else-if="control.type === 'select'"
					:label="control.filter.title"
					:options="[{ value: '', label: UI_IMAGE_MAP.ALL }, ...control.options]"
					:model-value="control.selected[0] ?? ''"
					@update:model-value="$emit('set-filter', control.filter.id, $event === '' ? [] : [String($event)])" />
				<fieldset v-else class="base-image-map__filter">
					<legend class="base-image-map__filter-title">{{ control.filter.title }}</legend>
					<div class="base-image-map__filter-options" :class="`base-image-map__filter-options--${control.type}`">
						<template v-for="option in control.options" :key="option.value">
							<BaseButton
								v-if="control.type === 'tags'"
								class="base-image-map__tag"
								:class="{ 'base-image-map__tag--on': control.selected.includes(option.value) }"
								:variant="control.selected.includes(option.value) ? 'default' : 'outline'"
								:size-scale="85"
								:aria-pressed="control.selected.includes(option.value)"
								@click="
									$emit('toggle-filter', {
										id: control.filter.id,
										value: option.value,
										isOn: !control.selected.includes(option.value),
									})
								">
								{{ option.label }}
							</BaseButton>
							<BaseSwitch
								v-else
								:label="option.label"
								:model-value="control.selected.includes(option.value)"
								@update:model-value="
									$emit('toggle-filter', { id: control.filter.id, value: option.value, isOn: $event })
								" />
						</template>
					</div>
				</fieldset>
			</template>
		</div>
		<div class="base-image-map__results">
			<span class="base-image-map__status-text" role="status">{{ statusText }}</span>
			<BaseButton v-if="hasClear" variant="ghost" :size-scale="85" @click="$emit('clear')">{{
				UI_IMAGE_MAP.CLEAR_FILTERS
			}}</BaseButton>
		</div>
		<div class="base-image-map__list" :class="`base-image-map__list--${view}`">
			<div v-for="section in sections" :key="section.id" class="base-image-map__section">
				<p v-if="section.title" class="base-image-map__section-title" aria-hidden="true">{{ section.title }}</p>
				<ul class="base-image-map__entries" :aria-label="section.title || UI_IMAGE_MAP.DIRECTORY">
					<li v-for="entry in section.entries" :key="entry.item.object.id" class="base-image-map__entry-row">
						<component
							:is="entry.item.href && !entry.item.isDisabled ? 'a' : 'button'"
							class="base-image-map__entry"
							:class="{
								'base-image-map__entry--active': entry.isActive,
								'base-image-map__entry--hover': entry.isHovered,
								'base-image-map__entry--disabled': entry.item.isDisabled,
							}"
							:type="entry.item.href && !entry.item.isDisabled ? undefined : 'button'"
							:href="entry.item.isDisabled ? undefined : entry.item.href"
							:target="entry.item.href && entry.item.object.isLinkExternal ? '_blank' : undefined"
							:rel="entry.item.href && entry.item.object.isLinkExternal ? 'noopener noreferrer' : undefined"
							:aria-current="entry.isActive ? 'true' : undefined"
							:aria-disabled="entry.item.isDisabled ? 'true' : undefined"
							:aria-haspopup="entry.item.action === 'popup' ? 'dialog' : undefined"
							:data-image-map-entry="entry.item.object.id"
							@click="$emit('select', entry.item.object.id, $event)"
							@pointerenter="$emit('hover', entry.item.object.id)"
							@pointerleave="$emit('hover', null)"
							@focus="$emit('hover', entry.item.object.id)"
							@blur="$emit('hover', null)">
							<slot
								name="item"
								:object="entry.item.object"
								:group="entry.item.group"
								:is-active="entry.isActive"
								:hours="entry.hours">
								<img
									v-if="view === 'grid' && entry.item.object.image"
									class="base-image-map__thumb"
									:src="entry.item.object.image"
									alt=""
									loading="lazy" />
								<span
									v-else
									class="base-image-map__swatch"
									:style="entry.item.group?.color ? { '--im-swatch': entry.item.group.color } : undefined"
									aria-hidden="true">
									<BaseIcon v-if="entry.item.group?.icon" :name="entry.item.group.icon" />
								</span>
								<span class="base-image-map__entry-text">
									<span class="base-image-map__entry-title">{{ entry.item.object.title }}</span>
									<span v-if="entry.item.group || entry.layerTitle" class="base-image-map__entry-meta">
										{{ [entry.item.group?.title, entry.layerTitle].filter(Boolean).join(' · ') }}
									</span>
									<span
										v-if="entry.hours"
										class="base-image-map__entry-hours"
										:class="{ 'base-image-map__entry-hours--open': entry.hours.isOpen }">
										{{ entry.hours.text }}
									</span>
								</span>
							</slot>
						</component>
					</li>
				</ul>
			</div>
			<div v-if="!sections.length" class="base-image-map__list-empty">
				<slot name="empty">{{ UI_TEXT.NO_RESULTS }}</slot>
			</div>
		</div>
	</aside>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { BaseSwitch } from '@components/BaseSwitch'
import { UI_IMAGE_MAP, UI_TEXT } from '@/locales/messages'
import { BaseCheckboxGroup } from '@components/BaseCheckboxGroup'
import type { ImageMapDirectoryEmits, ImageMapDirectoryProps, ImageMapDirectorySlots } from '../types/ImageMapDirectory.types'

defineProps<ImageMapDirectoryProps>()

defineEmits<ImageMapDirectoryEmits>()

defineSlots<ImageMapDirectorySlots>()
</script>
