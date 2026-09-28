export const SECTIONS = ['Заказы', 'Клиенты', 'Склад', 'Отчёты', 'Настройки']

export function shell(content: string): string {
	return `
		<BaseLayout v-bind="props">
			<template #header>
				<BaseHeader title="Rise CRM" href="#home">
					<template #end><BaseLink href="#profile">Анна Смирнова</BaseLink></template>
					<template #menu="{ close }">
						<nav aria-label="Разделы (меню)" class="story-stack">
							<BaseLink v-for="section in sections" :key="section" :href="'#' + section" @click="close">{{ section }}</BaseLink>
						</nav>
					</template>
				</BaseHeader>
			</template>
			<template #sidebar>
				<nav aria-label="Разделы" class="story-stack" style="width: 200px; padding: 16px; box-sizing: border-box">
					<BaseLink v-for="section in sections" :key="section" :href="'#' + section">{{ section }}</BaseLink>
				</nav>
			</template>
			<div style="padding: 24px">${content}</div>
			<template #footer>
				<BaseFooter><template #start>© 2026 Rise Studio</template></BaseFooter>
			</template>
		</BaseLayout>
	`
}
