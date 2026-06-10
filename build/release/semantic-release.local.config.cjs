module.exports = {
	branches: ['main'],

	tagFormat: 'v${version}',

	repositoryUrl: 'git@github.com:Ramzes1385/Rise-UI-KIT.git',

	plugins: [
		[
			'@semantic-release/commit-analyzer',
			{
				preset: 'conventionalcommits',
				releaseRules: [
					{ type: 'feat', release: 'minor' },
					{ type: 'fix', release: 'patch' },
					{ type: 'perf', release: 'patch' },
					{ type: 'refactor', release: 'patch' },
					{ type: 'build', release: 'patch' },
					{ type: 'deps', release: 'patch' },

					{ type: 'docs', release: false },
					{ type: 'style', release: false },
					{ type: 'test', release: false },
					{ type: 'chore', release: false },
					{ type: 'ci', release: false },
				],
			},
		],

		[
			'@semantic-release/release-notes-generator',
			{
				preset: 'conventionalcommits',
			},
		],
	],
}