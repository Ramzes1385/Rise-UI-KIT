/**
 * Данные BaseEmojiPicker: эмодзи и их названия (Unicode CLDR) из пакета emojibase-data.
 * Пакет не входит в зависимости кита — скачайте и распакуйте его рядом, затем передайте путь:
 *
 *   npm pack emojibase-data@17 && tar xzf emojibase-data-17.0.0.tgz
 *   npm run generate:emoji-data -- ./package
 *
 * В набор входят эмодзи до версии 14.0 (их показывают Windows 11, macOS, iOS и Android последних лет)
 * без флагов, модификаторов и вариантов тона кожи. Запись: номер раздела, эмодзи, пробел, название; записи через «|».
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const MAX_VERSION = 14
const GROUPS = { 0: 0, 1: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7 }
const LOCALES = { en: 'emojiEn', ru: 'emojiRu' }
const OUT_DIR = resolve(process.cwd(), 'src/components/BaseEmojiPicker/model/data')

const source = process.argv[2]
if (!source) {
	console.error('Укажите путь к распакованному пакету emojibase-data')
	process.exit(1)
}

for (const [locale, file] of Object.entries(LOCALES)) {
	const data = JSON.parse(readFileSync(resolve(source, locale, 'data.json'), 'utf8'))
	const records = data
		.filter(entry => entry.group in GROUPS && Number(entry.version) <= MAX_VERSION)
		.sort((a, b) => a.order - b.order)
		.map(entry => `${GROUPS[entry.group]}${entry.emoji} ${entry.label}`)
	const literal = records.join('|').replace(/\\/g, '\\\\').replace(/'/g, "\\'")
	writeFileSync(resolve(OUT_DIR, `${file}.ts`), `const data: string =\n\t'${literal}'\n\nexport default data\n`)
	console.log(`${file}.ts: ${records.length} эмодзи`)
}
