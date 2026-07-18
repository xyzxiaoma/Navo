import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyTransition,
  containsGitPush,
  extractReleaseNotes,
  parseVersion,
  validateChangelogHistory,
} from './release-policy.mjs';

test('parses stable semantic versions', () => {
  assert.deepEqual(parseVersion('1.2.3'), {
    raw: '1.2.3',
    major: 1,
    minor: 2,
    patch: 3,
  });
});

for (const version of [
  'v1.2.3',
  '1.2',
  '1.2.3-beta.1',
  '1.2.3+build',
  '01.2.3',
]) {
  test(`rejects invalid version ${version}`, () => {
    assert.throws(() => parseVersion(version), /稳定 SemVer/);
  });
}

test('classifies the next patch version', () => {
  assert.equal(classifyTransition('1.0.0', '1.0.1'), 'patch');
});

test('classifies the next minor version', () => {
  assert.equal(classifyTransition('1.2.9', '1.3.0'), 'minor');
});

test('requires approval for the next major version', () => {
  assert.throws(() => classifyTransition('1.9.9', '2.0.0'), /明确批准/);
  assert.equal(
    classifyTransition('1.9.9', '2.0.0', { allowMajor: true }),
    'major',
  );
});

for (const [base, current] of [
  ['1.0.0', '1.0.0'],
  ['1.0.0', '1.0.2'],
  ['1.0.0', '1.2.0'],
  ['1.2.3', '1.3.4'],
  ['2.0.0', '1.9.9'],
  ['1.2.3', '2.1.0'],
]) {
  test(`rejects invalid transition ${base} -> ${current}`, () => {
    assert.throws(
      () => classifyTransition(base, current),
      /版本必须连续升级|明确批准/,
    );
  });
}

test('extracts Chinese notes from the newest matching section', () => {
  const changelog = `# Changelog

## 1.1.0

- 新增书签批量操作。
- Improve keyboard navigation.

## 1.0.0

- 初始版本。
`;

  assert.equal(
    extractReleaseNotes(changelog, '1.1.0'),
    '- 新增书签批量操作。\n- Improve keyboard navigation.',
  );
});

test('rejects a changelog whose newest version does not match', () => {
  assert.throws(
    () =>
      extractReleaseNotes('# Changelog\n\n## 1.0.0\n\n- 初始版本。\n', '1.0.1'),
    /最新版本必须是 1.0.1/,
  );
});

test('rejects an empty release section', () => {
  assert.throws(
    () =>
      extractReleaseNotes(
        '# Changelog\n\n## 1.0.1\n\n## 1.0.0\n\n- 初始版本。\n',
        '1.0.1',
      ),
    /至少需要一个列表项/,
  );
});

test('rejects an English-only release section', () => {
  assert.throws(
    () =>
      extractReleaseNotes(
        '# Changelog\n\n## 1.0.1\n\n- Improve release flow.\n',
        '1.0.1',
      ),
    /至少需要一个中文列表项/,
  );
});

test('preserves changelog history while adding one newest section', () => {
  const base = '# Changelog\n\n## 1.0.0\n\n- Initial release.\n';
  const current =
    '# Changelog\n\n## 1.0.1\n\n- 增加发布校验。\n\n## 1.0.0\n\n- Initial release.\n';
  assert.doesNotThrow(() => validateChangelogHistory(base, current));
});

test('rejects rewriting existing changelog history', () => {
  const base = '# Changelog\n\n## 1.0.0\n\n- Initial release.\n';
  const current =
    '# Changelog\n\n## 1.0.1\n\n- 增加发布校验。\n\n## 1.0.0\n\n- 改写旧记录。\n';
  assert.throws(
    () => validateChangelogHistory(base, current),
    /不能改写既有 CHANGELOG 历史/,
  );
});

for (const command of [
  'git push',
  'git.exe push origin main',
  'git -C D:\\projects\\navo push origin main',
  'git add . && git commit -m release && git push',
]) {
  test(`detects git push in: ${command}`, () => {
    assert.equal(containsGitPush(command), true);
  });
}

test('ignores non-push git commands', () => {
  assert.equal(containsGitPush('git status'), false);
});
