<template>
	<div class="base-mega-menu__content" :class="{ 'base-mega-menu__content--promo': item.promo }">
		<div v-if="item.groups?.length" class="base-mega-menu__groups" :style="{ '--mega-menu-columns': groupCount() }">
			<div v-for="(group, index) in item.groups" :key="group.title ?? index" class="base-mega-menu__group" :class="classes.group">
				<p v-if="group.title" :id="groupTitleId(index)" class="base-mega-menu__group-title">{{ group.title }}</p>
				<ul class="base-mega-menu__links" role="list" :aria-labelledby="group.title ? groupTitleId(index) : undefined">
					<MegaMenuLinks
						:links="group.items"
						:depth="0"
						:parent-id="groupLinksId(index)"
						:group="group"
						:item="item"
						:link-class="classes.link">
						<template v-if="$slots.link" #link="slotProps">
							<slot name="link" v-bind="slotProps" />
						</template>
					</MegaMenuLinks>
				</ul>
			</div>
		</div>

		<div v-if="item.promo" class="base-mega-menu__promo" :class="classes.promo">
			<slot name="promo" :promo="item.promo" :item="item">
				<img v-if="item.promo.image" class="base-mega-menu__promo-image" :src="item.promo.image" alt="" />
				<p class="base-mega-menu__promo-title">{{ item.promo.title }}</p>
				<p v-if="item.promo.description" class="base-mega-menu__promo-desc">{{ item.promo.description }}</p>
				<BaseLink
					v-if="hasPromoLink(item.promo)"
					class="base-mega-menu__promo-link"
					:to="item.promo.to"
					:href="item.promo.href"
					@click="handlePromoSelect(item.promo, $event)">
					{{ promoLinkLabel(item.promo) }}
					<BaseIcon name="arrow-right" />
				</BaseLink>
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import MegaMenuLinks from './MegaMenuLinks.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { useMegaMenuPanel } from '../model/useMegaMenuPanel'
import type { MegaMenuPanelEmits, MegaMenuPanelProps, MegaMenuPanelSlots } from '../types/BaseMegaMenu.types'

defineOptions({ name: 'MegaMenuPanel' })

const props = defineProps<MegaMenuPanelProps>()
const emit = defineEmits<MegaMenuPanelEmits>()
defineSlots<MegaMenuPanelSlots>()

const { groupTitleId, groupLinksId, promoLinkLabel, hasPromoLink, groupCount, handlePromoSelect } = useMegaMenuPanel(props, emit)
</script>
