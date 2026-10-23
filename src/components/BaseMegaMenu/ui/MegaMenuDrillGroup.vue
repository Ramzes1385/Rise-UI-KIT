<template>
	<div :class="[ui('group'), groupClass]">
		<span class="base-mega-menu__drill-status" role="status">{{ announcement }}</span>
		<div class="base-mega-menu__drill">
			<Transition :name="direction === 'back' ? 'base-mega-menu-drill-back' : 'base-mega-menu-drill'" :css="!isMotionReduced">
				<div :key="depth" class="base-mega-menu__drill-level">
					<button
						v-if="depth > 0"
						type="button"
						:class="ui('back')"
						:aria-label="backLabel"
						@click="back"
						@keydown="handleBackKeydown">
						<BaseIcon name="chevron-left" class="base-mega-menu__back-icon" />
						<span>{{ UI_TEXT.MEGA_MENU_BACK }}</span>
					</button>
					<p v-if="levelTitle" :id="levelTitleId" :class="ui('group-title')">{{ levelTitle }}</p>
					<ul :id="levelId" class="base-mega-menu__links" role="list" :aria-labelledby="levelTitle ? levelTitleId : undefined">
						<MegaMenuLinks
							:links="links"
							:depth="depth"
							:parent-id="parentId"
							:group="group"
							:item="item"
							:ui="ui"
							:link-class="linkClass">
							<template v-if="$slots.link" #link="slotProps">
								<slot name="link" v-bind="slotProps" />
							</template>
						</MegaMenuLinks>
					</ul>
				</div>
			</Transition>
		</div>
	</div>
</template>

<script setup lang="ts">
import { UI_TEXT } from '@/locales/messages'
import MegaMenuLinks from './MegaMenuLinks.vue'
import { BaseIcon } from '@components/BaseIcon'
import { useMegaMenuDrill } from '../model/cascade/useMegaMenuDrill'
import type { MegaMenuDrillGroupEmits, MegaMenuDrillGroupProps, MegaMenuDrillGroupSlots } from '../types/BaseMegaMenu.types'

defineOptions({ name: 'MegaMenuDrillGroup' })

const props = defineProps<MegaMenuDrillGroupProps>()
const emit = defineEmits<MegaMenuDrillGroupEmits>()
defineSlots<MegaMenuDrillGroupSlots>()

const { depth, links, levelId, levelTitle, levelTitleId, direction, announcement, parentId, backLabel, back, handleBackKeydown } =
	useMegaMenuDrill(props, emit)
</script>
