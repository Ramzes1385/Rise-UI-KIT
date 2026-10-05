<template>
	<BaseModal
		:is-open="isOpen"
		:aria-label="dialogLabel"
		:variant="variant"
		:size-scale="sizeScale"
		:color="color"
		:custom-class="modalClass"
		@update:is-open="setOpen">
		<div class="base-command-palette__search">
			<BaseIcon name="search" />
			<input
				class="base-command-palette__input"
				:class="classes.input"
				type="text"
				role="combobox"
				aria-autocomplete="list"
				aria-expanded="true"
				:aria-controls="listId"
				:aria-activedescendant="activeId"
				:aria-label="UI_COMMAND_PALETTE.SEARCH"
				:placeholder="placeholder ?? UI_COMMAND_PALETTE.PLACEHOLDER"
				:value="query"
				autocomplete="off"
				spellcheck="false"
				@input="handleInput"
				@keydown="handleKeydown" />
		</div>
		<div :id="listId" class="base-command-palette__list" role="listbox" :aria-label="UI_COMMAND_PALETTE.COMMANDS">
			<div
				v-for="group in groups"
				:key="group.id"
				class="base-command-palette__group"
				role="group"
				:aria-labelledby="group.name ? group.id : undefined">
				<div v-if="group.name" :id="group.id" class="base-command-palette__group-title" role="presentation">{{ group.name }}</div>
				<div
					v-for="option in group.options"
					:id="option.id"
					:key="option.id"
					class="base-command-palette__option"
					:class="[
						classes.option,
						{
							'base-command-palette__option--active': option.index === activeIndex,
							'base-command-palette__option--disabled': option.command.isDisabled,
						},
					]"
					role="option"
					:aria-selected="option.index === activeIndex ? 'true' : 'false'"
					:aria-disabled="option.command.isDisabled ? 'true' : undefined"
					@mousemove="setActive(option.index)"
					@click="run(option.command)">
					<slot name="command" :command="option.command" :is-active="option.index === activeIndex">
						<BaseIcon v-if="option.command.icon" :name="option.command.icon" class="base-command-palette__icon" />
						<span class="base-command-palette__text">
							<span class="base-command-palette__label">{{ option.command.label }}</span>
							<span v-if="option.command.description" class="base-command-palette__description">{{
								option.command.description
							}}</span>
						</span>
						<span v-if="option.keys.length" class="base-command-palette__shortcut" aria-hidden="true">
							<BaseKbd v-for="key in option.keys" :key="key" :value="key" :size-scale="sizeScale" />
						</span>
					</slot>
				</div>
			</div>
		</div>
		<p v-if="groups.length === 0" class="base-command-palette__empty">
			<slot name="empty" :query="query">{{ UI_COMMAND_PALETTE.EMPTY }}</slot>
		</p>
		<div class="base-command-palette__footer" aria-hidden="true">
			<span
				><BaseKbd value="arrowup" :size-scale="sizeScale" /><BaseKbd value="arrowdown" :size-scale="sizeScale" />{{
					UI_COMMAND_PALETTE.HINT_MOVE
				}}</span
			>
			<span><BaseKbd value="enter" :size-scale="sizeScale" />{{ UI_COMMAND_PALETTE.HINT_RUN }}</span>
			<span><BaseKbd value="escape" :size-scale="sizeScale" />{{ UI_COMMAND_PALETTE.HINT_CLOSE }}</span>
		</div>
	</BaseModal>
</template>

<script setup lang="ts">
import '../styles/BaseCommandPalette.style.scss'
import { BaseKbd } from '@components/BaseKbd'
import { BaseIcon } from '@components/BaseIcon'
import { BaseModal } from '@components/BaseModal'
import { UI_COMMAND_PALETTE } from '@/locales/messages'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseCommandPalette } from '../model/useBaseCommandPalette'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseCommandPaletteEmits, BaseCommandPaletteProps, BaseCommandPaletteSlots } from '../types/BaseCommandPalette.types'

const props = withDefaults(
	defineProps<BaseCommandPaletteProps>(),
	kitDefaults('BaseCommandPalette', {
		variant: DEFAULT_VARIANT,
		isOpen: undefined,
		hotkey: 'mod+k',
		hotkeyScope: 'global',
		placeholder: undefined,
		ariaLabel: undefined,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCommandPaletteEmits>()

defineSlots<BaseCommandPaletteSlots>()

const {
	classes,
	modalClass,
	isOpen,
	setOpen,
	query,
	activeIndex,
	groups,
	activeId,
	listId,
	dialogLabel,
	handleInput,
	handleKeydown,
	setActive,
	run,
} = useBaseCommandPalette(props, emit)
</script>
