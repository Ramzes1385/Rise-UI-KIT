import type { Component } from 'vue'
import { afterAll, beforeAll } from 'vitest'

export const BASE_SIDEBAR_STUBS: Record<string, Component> = {
	BaseBadge: {
		name: 'BaseBadge',
		props: ['label', 'variant', 'sizeScale', 'customClass'],
		template: `
      <span data-testid="base-badge" :class="customClass">
        <slot>{{ label }}</slot>
      </span>
    `,
	},

	BaseButton: {
		name: 'BaseButton',
		props: ['variant', 'padding', 'customClass'],
		inheritAttrs: false,
		template: `
      <button
        v-bind="$attrs"
        type="button"
        :class="customClass"
      >
        <slot />
      </button>
    `,
	},

	BaseIcon: {
		name: 'BaseIcon',
		props: ['name'],
		template: '<span data-testid="base-icon" aria-hidden="true">{{ name }}</span>',
	},

	BaseSkeleton: {
		name: 'BaseSkeleton',
		props: ['shape', 'width', 'height'],
		template: '<div data-testid="base-skeleton" />',
	},

	BaseText: {
		name: 'BaseText',
		props: ['tag', 'weight', 'customClass'],
		template: `
      <component
        :is="tag || 'div'"
        :class="customClass"
      >
        <slot />
      </component>
    `,
	},

	BaseTooltip: {
		name: 'BaseTooltip',
		props: ['text', 'position'],
		template: `
      <span
        data-testid="base-tooltip"
        :data-tooltip-text="text"
        :data-tooltip-position="position"
      >
        <slot />
      </span>
    `,
	},
}

function preventNavigation(event: Event): void {
	event.preventDefault()
}

export function preventLinkNavigation(): void {
	beforeAll(() => document.addEventListener('click', preventNavigation, true))
	afterAll(() => document.removeEventListener('click', preventNavigation, true))
}
