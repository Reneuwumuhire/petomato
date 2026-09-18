import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

test('release versions advance past existing tags even when main lags', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'petomato-version-'))
  const git = (...args) => execFileSync('git', args, { cwd, stdio: 'pipe' })
  const next = () => execFileSync(process.execPath, [fileURLToPath(new URL('./next-release-version.mjs', import.meta.url))], { cwd, encoding: 'utf8' }).trim()
  try {
    git('init')
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '--allow-empty', '-m', 'test')
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ version: '2.1.4' }))
    assert.equal(next(), '2.1.5')
    git('tag', 'v2.1.5')
    assert.equal(next(), '2.1.6')
    git('tag', 'v2.1.10')
    git('tag', 'v99.0.0-beta.1')
    assert.equal(next(), '2.1.11')
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ version: '3.0.0' }))
    assert.equal(next(), '3.0.1')
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
})
