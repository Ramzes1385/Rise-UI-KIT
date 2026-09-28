export const LETTERS = ['Счёт за сентябрь', 'Договор поставки', 'Сверка остатков', 'Отгрузка № 1048', 'Акт выполненных работ']

export const PANES = `
	<template #start>
		<ul aria-label="Письма" style="margin: 0; padding: 12px 16px; list-style: none; display: grid; gap: 8px">
			<li v-for="letter in letters" :key="letter">{{ letter }}</li>
		</ul>
	</template>
	<template #end>
		<article style="padding: 12px 16px">
			<h3 style="margin-top: 0">Счёт за сентябрь</h3>
			<p style="margin: 0">Добрый день! Во вложении счёт за сентябрь, оплата до 10 октября.</p>
		</article>
	</template>
`

export const BOX = 'height: 240px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden'
