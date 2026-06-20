## [1.2.4](https://github.com/Ramzes1385/Rise-UI-KIT/compare/v1.2.3...v1.2.4) (2026-06-20)

### Bug Fixes

* return UI_TEXT from setup in BaseFormField Required story — template had no access to the constant ([3f5a38b](https://github.com/Ramzes1385/Rise-UI-KIT/commit/3f5a38bd0a4124074b5c6842c6ea17a6aa64d05f))

## [1.2.3](https://github.com/Ramzes1385/Rise-UI-KIT/compare/v1.2.2...v1.2.3) (2026-06-20)

### Bug Fixes

* increase timeout for BaseFormField visual test — CI flaky rendering ([34015ff](https://github.com/Ramzes1385/Rise-UI-KIT/commit/34015ff074b1c327ee26031c0ab4167678768c37))

## [1.2.2](https://github.com/Ramzes1385/Rise-UI-KIT/compare/v1.2.1...v1.2.2) (2026-06-20)

### ⚠ BREAKING CHANGES

* useTableSortFilter removed from composables API,
useCalendarNavigation renamed to useCalendarInteraction, 36 deprecated
props removed from BaseTour/BaseImage/BaseCalendar/BaseTable,
ChatMessageList.types.ts proxy removed.

Verification: lint clean, 184 files / 3270 tests all green.

### Bug Fixes

* add [@constants](https://github.com/constants) alias to Storybook configuration ([f0c9211](https://github.com/Ramzes1385/Rise-UI-KIT/commit/f0c92118f7c4b7e5389ebb6641ecbd704c3af5a6))
* correct BaseTable.vue location and story imports ([607dce6](https://github.com/Ramzes1385/Rise-UI-KIT/commit/607dce6085e63ecf78c84813ef678f69f65871da))
* remove unused resolvedSkipLabel and resolvedScrollIntoView in BaseTour ([78e45ac](https://github.com/Ramzes1385/Rise-UI-KIT/commit/78e45ace25250209a21d186b1ad2f9e5465bc852))
* resolve [@constants](https://github.com/constants) alias and BaseTable import paths ([7a1f68e](https://github.com/Ramzes1385/Rise-UI-KIT/commit/7a1f68ec5fd5ba82c0225db753c8655ffe1b7e8b))
* resolve vue-tsc errors and clean up test infrastructure ([900df6b](https://github.com/Ramzes1385/Rise-UI-KIT/commit/900df6b1ea628a1712a1459d91cf7d3e76b6ffad))

### Code Refactoring

* clean code alignment per Robert Martin — components, composables, constants, utils, stories ([d137ba6](https://github.com/Ramzes1385/Rise-UI-KIT/commit/d137ba69ca67559e9acd1a5d00d1879179962165))

## [1.2.1](https://github.com/Ramzes1385/Rise-UI-KIT/compare/v1.2.0...v1.2.1) (2026-06-11)

### Bug Fixes

* trigger sidebar release ([b6c9643](https://github.com/Ramzes1385/Rise-UI-KIT/commit/b6c96435ebf1ff354bca7e9e235c9c1118edb10f))

## [1.2.0](https://github.com/Ramzes1385/Rise-UI-KIT/compare/v1.1.1...v1.2.0) (2026-06-11)

### Features

* add collapsible sidebar groups ([efd8ba9](https://github.com/Ramzes1385/Rise-UI-KIT/commit/efd8ba97db1bae1a9fdffc4476256f399de8e0a2))

### Bug Fixes

* sidebar uses height auto ([96c56dd](https://github.com/Ramzes1385/Rise-UI-KIT/commit/96c56ddbda2ce61a258e41caedfe254f5403a1fa))

## [1.1.1](https://github.com/Ramzes1385/Rise-UI-KIT/compare/v1.1.0...v1.1.1) (2026-06-11)

### Bug Fixes

* support nested sidebar stories in coverage checks ([cccc13e](https://github.com/Ramzes1385/Rise-UI-KIT/commit/cccc13e1a722df1be10398c1db81c5b08c60f6ed))

## [1.1.0](https://github.com/Ramzes1385/Rise-UI-KIT/compare/v1.0.5...v1.1.0) (2026-06-11)

### Features

* improve sidebar navigation API ([0d04846](https://github.com/Ramzes1385/Rise-UI-KIT/commit/0d04846ddd03dbdfeb9e2c166db8e68a0b39fe4d))
* improve sidebar navigation API ([b354b1c](https://github.com/Ramzes1385/Rise-UI-KIT/commit/b354b1c036faaf40af03a3580aaef5625a2ba5b7))

## [1.0.5](https://github.com/Ramzes1385/Rise-UI-KIT/compare/v1.0.4...v1.0.5) (2026-06-11)

### Bug Fixes

* export styles entry ([e2063ed](https://github.com/Ramzes1385/Rise-UI-KIT/commit/e2063ed99db2292f662a305369758b564ec918a5))

## [1.0.4](https://github.com/Ramzes1385/Rise-UI-KIT/compare/v1.0.3...v1.0.4) (2026-06-10)

### Bug Fixes

* preserve chat autocomplete enter submit ([a401700](https://github.com/Ramzes1385/Rise-UI-KIT/commit/a40170097110c59330958d8f1b9b3f04d91d905a))
* retry npm trusted publisher release ([450928a](https://github.com/Ramzes1385/Rise-UI-KIT/commit/450928a81794a6167c15e4d14fe8b3f35b953bfd))

## 1.0.0 (2026-06-10)

### Bug Fixes

* configure npm library build ([66128de](https://github.com/Ramzes1385/Rise-UI-KIT/commit/66128de210f05594650faf4f051b63fa8753bcda))
* configure npm library build ([8bf9df1](https://github.com/Ramzes1385/Rise-UI-KIT/commit/8bf9df1590d8d3fcc4b004c256da3d25dd2fb7d7))
* preserve chat autocomplete enter submit ([a401700](https://github.com/Ramzes1385/Rise-UI-KIT/commit/a40170097110c59330958d8f1b9b3f04d91d905a))
* remove platform from snapshot path + add visual baselines ([ebb2327](https://github.com/Ramzes1385/Rise-UI-KIT/commit/ebb2327802bf900c7bde44058cb1d401dd689213))
