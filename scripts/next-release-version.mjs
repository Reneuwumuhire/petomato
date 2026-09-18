import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// main can lag behind release tags while version-bump PRs are awaiting merge.
const current = JSON.parse(readFileSync('package.json', 'utf8')).version
const tags = execFileSync('git', ['tag', '--list'], { encoding: 'utf8' }).trim().split('\n')
const versions = [current, ...tags.filter(tag => /^v\d+\.\d+\.\d+$/.test(tag)).map(tag => tag.slice(1))]
if (!/^\d+\.\d+\.\d+$/.test(current)) throw new Error(`Invalid release version: ${current}`)
const latest = versions.map(version => version.split('.').map(Number)).sort((a, b) =>
  a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
).at(-1)
latest[2] += 1
console.log(latest.join('.'))
