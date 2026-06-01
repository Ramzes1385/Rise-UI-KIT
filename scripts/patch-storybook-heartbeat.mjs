#!/usr/bin/env node
// Увеличивает таймаут WebSocket-heartbeat в storybook/dist, иначе долгий прогон
// "Run tests" роняет сокет с ошибкой "Server timed out". Идемпотентен, переживает
// npm install (вызывается из storybook-dev.mjs).

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dirnamePath = dirname(fileURLToPath(import.meta.url))
const storybookDist = resolve(dirnamePath, '../node_modules/storybook/dist')

/** Новые значения: ping раз в 60с, окно ожидания закрытия 30с → суммарно 90с терпимости. */
const NEW_INTERVAL = '60e3'
const NEW_MAX_LATENCY = '30e3'

/** Файлы сборки Storybook, где объявлены константы heartbeat. */
const TARGET_FILES = [
  'channels/index.js',
  'manager/globals-runtime.js',
  'preview/runtime.js',
]

const INTERVAL_PATTERN = /HEARTBEAT_INTERVAL\s*=\s*[0-9.e]+/g
const MAX_LATENCY_PATTERN = /HEARTBEAT_MAX_LATENCY\s*=\s*[0-9.e]+/g

const INTERVAL_REPLACEMENT = `HEARTBEAT_INTERVAL = ${NEW_INTERVAL}`
const MAX_LATENCY_REPLACEMENT = `HEARTBEAT_MAX_LATENCY = ${NEW_MAX_LATENCY}`

function patchFile(relativePath) {
  const filePath = resolve(storybookDist, relativePath)

  if (!existsSync(filePath)) {
    return { relativePath, status: 'skipped (not found)' }
  }

  const source = readFileSync(filePath, 'utf8')
  const patched = source
    .replace(INTERVAL_PATTERN, INTERVAL_REPLACEMENT)
    .replace(MAX_LATENCY_PATTERN, MAX_LATENCY_REPLACEMENT)

  if (patched === source) {
    return { relativePath, status: 'unchanged (already patched)' }
  }

  writeFileSync(filePath, patched)

  return { relativePath, status: 'patched' }
}

function main() {
  if (!existsSync(storybookDist)) {
    console.warn('[patch-storybook-heartbeat] storybook/dist not found, skipping')
    process.exitCode = 1
    return
  }

  const results = TARGET_FILES.map(patchFile)

  for (const { relativePath, status } of results) {
    console.log(`[patch-storybook-heartbeat] ${relativePath}: ${status}`)
  }

  const appliedCount = results.filter(
    ({ status }) => status === 'patched' || status === 'unchanged (already patched)',
  ).length

  if (appliedCount === 0) {
    console.warn(
      '[patch-storybook-heartbeat] heartbeat-константы не найдены ни в одном файле — структура сборки Storybook изменилась, таймаут "Server timed out" может вернуться',
    )
    process.exitCode = 1
  }
}

main()
