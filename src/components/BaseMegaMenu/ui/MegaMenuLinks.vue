<template>
	<li
		v-for="entry in entries"
		:key="getItemKey(entry.link)"
		class="base-mega-menu__links-item"
		@pointerenter="handleEnter(entry, $event)">
		<button
			v-if="hasChildren(entry.link)"
			:id="entry.id"
			type="button"
			class="base-mega-menu__link base-mega-menu__link--parent"
			:class="[
				{ 'base-mega-menu__link--expanded': isExpanded(entry), 'base-mega-menu__link--disabled': entry.link.isDisabled },
				linkClass,
			]"
			:disabled="entry.link.isDisabled"
			aria-haspopup="true"
			:aria-expanded="isExpanded(entry)"
			:aria-controls="isExpanded(entry) ? entry.subId : undefined"
			@click="toggle(entry)"
			@keydown="handleKeydown(entry, $event)">
			<slot name="link" :link="entry.link" :depth="depth" :group="group" :item="item">
				<MegaMenuLinkContent :link="entry.link" />
			</slot>
			<BaseIcon name="chevron-right" class="base-mega-menu__link-chevron" />
		</button>

		<BaseLink
			v-else
			class="base-mega-menu__link"
			:class="[{ 'base-mega-menu__link--disabled': entry.link.isDisabled }, linkClass]"
			variant="ghost"
			:to="entry.link.to"
			:href="entry.link.href"
			:target="entry.link.target"
			:is-disabled="entry.link.isDisabled"
			v-on="leafListeners(entry)"
			@click="select(entry.link, $event)">
			<slot name="link" :link="entry.link" :depth="depth" :group="group" :item="item">
				<MegaMenuLinkContent :link="entry.link" />
			</slot>
		</BaseLink>

		<ul
			v-if="isExpanded(entry)"
			:id="entry.subId"
			class="base-mega-menu__links base-mega-menu__sub"
			:class="{ 'base-mega-menu__sub--flip': isFlipped(entry) }"
			role="list"
			:aria-label="entry.link.label">
			<MegaMenuLinks
				:links="entry.link.children ?? []"
				:depth="depth + 1"
				:parent-id="entry.id"
				:group="group"
				:item="item"
				:link-class="linkClass">
				<template v-if="$slots.link" #link="slotProps">
					<slot name="link" v-bind="slotProps" />
				</template>
			</MegaMenuLinks>
		</ul>
	</li>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import MegaMenuLinkContent from './MegaMenuLinkContent.vue'
import { useMegaMenuLinks } from '../model/cascade/useMegaMenuLinks'
import type { MegaMenuLinksProps, MegaMenuLinksSlots } from '../types/BaseMegaMenu.types'

defineOptions({ name: 'MegaMenuLinks' })

const props = defineProps<MegaMenuLinksProps>()
defineSlots<MegaMenuLinksSlots>()

const { entries, getItemKey, hasChildren, leafListeners, isExpanded, isFlipped, toggle, select, handleEnter, handleKeydown } =
	useMegaMenuLinks(props)
</script>
