import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const STABLE_SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const CHINESE_CHARACTER = /\p{Script=Han}/u;

export function parseVersion(value) {
  const match = STABLE_SEMVER.exec(value);
  if (!match) {
    throw new Error(`版本号必须是稳定 SemVer（x.y.z），当前为：${value}`);
  }

  return {
    raw: value,
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function classifyTransition(
  baseValue,
  currentValue,
  { allowMajor = false } = {},
) {
  const base = parseVersion(baseValue);
  const current = parseVersion(currentValue);

  if (
    current.major === base.major &&
    current.minor === base.minor &&
    current.patch === base.patch + 1
  ) {
    return 'patch';
  }

  if (
    current.major === base.major &&
    current.minor === base.minor + 1 &&
    current.patch === 0
  ) {
    return 'minor';
  }

  if (
    current.major === base.major + 1 &&
    current.minor === 0 &&
    current.patch === 0
  ) {
    if (!allowMajor) {
      throw new Error('主版本升级必须先获得用户明确批准。');
    }
    return 'major';
  }

  throw new Error(
    `版本必须连续升级：${baseValue} 只能升级到 ${base.major}.${base.minor}.${base.patch + 1}、` +
      `${base.major}.${base.minor + 1}.0，或经批准升级到 ${base.major + 1}.0.0；当前为 ${currentValue}。`,
  );
}

function releaseHeadings(changelog) {
  return [...changelog.matchAll(/^##\s+([^\r\n]+)\s*$/gm)];
}

export function extractReleaseNotes(changelog, version) {
  const headings = releaseHeadings(changelog);
  if (headings.length === 0) {
    throw new Error('CHANGELOG.md 缺少版本标题。');
  }

  const firstVersion = headings[0][1].trim();
  if (firstVersion !== version) {
    throw new Error(
      `CHANGELOG.md 最新版本必须是 ${version}，当前为 ${firstVersion}。`,
    );
  }

  const start = headings[0].index + headings[0][0].length;
  const end = headings[1]?.index ?? changelog.length;
  const notes = changelog.slice(start, end).trim();
  const bullets = notes
    .split(/\r?\n/)
    .filter((line) => /^\s*[-*+]\s+\S/.test(line));

  if (bullets.length === 0) {
    throw new Error(`CHANGELOG.md 的 ${version} 版本至少需要一个列表项。`);
  }

  if (!bullets.some((line) => CHINESE_CHARACTER.test(line))) {
    throw new Error(`CHANGELOG.md 的 ${version} 版本至少需要一个中文列表项。`);
  }

  return notes;
}

function normalizeText(value) {
  return value.replace(/\r\n/g, '\n').trimEnd();
}

export function validateChangelogHistory(baseChangelog, currentChangelog) {
  const headings = releaseHeadings(currentChangelog);
  if (headings.length < 2) {
    throw new Error('CHANGELOG.md 必须保留上一版本及更早的历史记录。');
  }

  const withoutNewest =
    currentChangelog.slice(0, headings[0].index) +
    currentChangelog.slice(headings[1].index);

  if (normalizeText(withoutNewest) !== normalizeText(baseChangelog)) {
    throw new Error(
      '每次发布只能新增一个最新版本节，不能改写既有 CHANGELOG 历史。',
    );
  }
}

export function containsGitPush(command) {
  return /(?:^|[\s"'\\/])git(?:\.exe)?["']?(?:\s+[^\s;&|]+)*\s+push\b/i.test(
    command,
  );
}

function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd: options.cwd ?? process.cwd(),
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function readRepositoryFile(filePath, target = 'WORKTREE') {
  if (target === 'WORKTREE') {
    return readFileSync(resolve(filePath), 'utf8');
  }
  return git(['show', `${target}:${filePath}`]);
}

function readVersion(target) {
  const packageJson = JSON.parse(readRepositoryFile('package.json', target));
  return packageJson.version;
}

export function validateRelease({
  base,
  target = 'WORKTREE',
  allowMajor = false,
}) {
  if (!base) {
    throw new Error('缺少 --base <commit>。');
  }

  const baseVersion = readVersion(base);
  const currentVersion = readVersion(target);
  const releaseLevel = classifyTransition(baseVersion, currentVersion, {
    allowMajor,
  });
  const baseChangelog = readRepositoryFile('CHANGELOG.md', base);
  const currentChangelog = readRepositoryFile('CHANGELOG.md', target);
  const notes = extractReleaseNotes(currentChangelog, currentVersion);
  validateChangelogHistory(baseChangelog, currentChangelog);

  return { baseVersion, currentVersion, releaseLevel, notes };
}

function parseArguments(argv) {
  const args = argv.filter((argument) => argument !== '--');
  const command = args.shift();
  const options = {};

  while (args.length > 0) {
    const argument = args.shift();
    if (argument === '--allow-major') {
      options.allowMajor = true;
      continue;
    }
    if (argument === '--json') {
      options.json = true;
      continue;
    }
    if (argument === '--base' || argument === '--target') {
      options[argument.slice(2)] = args.shift();
      continue;
    }
    throw new Error(`未知参数：${argument}`);
  }

  return { command, options };
}

function tokenizeCommand(command) {
  return [...command.matchAll(/"([^"]*)"|'([^']*)'|([^\s]+)/g)].map(
    (match) => match[1] ?? match[2] ?? match[3],
  );
}

function stripMajorApproval(command) {
  return command
    .replace(/^\s*NAVO_MAJOR_APPROVED\s*=\s*['"]?1['"]?\s+/i, '')
    .replace(/^\s*\$env:NAVO_MAJOR_APPROVED\s*=\s*['"]1['"]\s*;\s*/i, '')
    .trim();
}

function parsePushCommand(command) {
  const cleaned = stripMajorApproval(command);
  if (/[;&|\r\n]/.test(cleaned)) {
    throw new Error(
      'git push 必须作为独立命令执行，不能与 commit 或其他命令串联。',
    );
  }

  const tokens = tokenizeCommand(cleaned);
  const gitIndex = tokens.findIndex((token) => {
    const executable = basename(token.replace(/\\/g, '/')).toLowerCase();
    return executable === 'git' || executable === 'git.exe';
  });
  const pushIndex = tokens.findIndex(
    (token, index) => index > gitIndex && token.toLowerCase() === 'push',
  );

  if (gitIndex < 0 || pushIndex < 0) {
    throw new Error('无法解析 git push 命令。');
  }
  if (pushIndex !== gitIndex + 1) {
    throw new Error(
      '请在项目根目录使用独立的 `git push`，不要使用 git -C 或全局参数。',
    );
  }

  const pushArguments = tokens.slice(pushIndex + 1);
  if (
    pushArguments.some(
      (argument) =>
        argument === '--all' ||
        argument === '--mirror' ||
        argument === '--force' ||
        argument.startsWith('--force-with-lease') ||
        argument.startsWith('+'),
    )
  ) {
    throw new Error('发布规则不允许批量、镜像或强制推送。');
  }

  const positional = pushArguments.filter(
    (argument) => argument !== '-u' && argument !== '--set-upstream',
  );
  if (positional.some((argument) => argument.startsWith('-'))) {
    throw new Error(
      '该 git push 选项无法安全解析，请使用 `git push origin main`。',
    );
  }
  if (positional.length > 2) {
    throw new Error('一次只能推送 main 的一个 refspec。');
  }

  return {
    remote: positional[0],
    refspec: positional[1],
    allowMajor: /NAVO_MAJOR_APPROVED\s*=\s*['"]?1/i.test(command),
  };
}

function resolvePushDestination(parsed) {
  const branch = git(['branch', '--show-current']);
  if (branch !== 'main') {
    throw new Error(
      `Navo 只允许从 main 推送，当前分支为 ${branch || 'detached HEAD'}。`,
    );
  }

  const remote =
    parsed.remote ?? git(['config', '--get', 'branch.main.remote']);
  const configuredMerge = git(['config', '--get', 'branch.main.merge']);
  const defaultDestination = configuredMerge.replace(/^refs\/heads\//, '');
  const refspec = parsed.refspec ?? defaultDestination;
  const [source, destination = refspec] = refspec.split(':');

  if (!remote || destination !== 'main' || !['main', 'HEAD'].includes(source)) {
    throw new Error('Navo 只允许将当前 main 推送到目标远端的 main。');
  }

  const remoteLine = git(['ls-remote', '--heads', remote, 'refs/heads/main']);
  if (!remoteLine) {
    throw new Error(`目标远端 ${remote}/main 不存在，不能自动判断版本基准。`);
  }
  const base = remoteLine.split(/\s+/)[0];

  try {
    git(['cat-file', '-e', `${base}^{commit}`]);
  } catch {
    throw new Error(
      `本地缺少 ${remote}/main 的最新提交，请先运行 git fetch ${remote} main。`,
    );
  }

  return { base, remote };
}

function hasOutgoingCommits(base) {
  return Number(git(['rev-list', '--count', `${base}..HEAD`])) > 0;
}

async function readStdin() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  return input.trim();
}

async function runHook() {
  const rawInput = await readStdin();
  const input = rawInput ? JSON.parse(rawInput) : {};
  const command = input.tool_input?.command ?? '';

  if (!containsGitPush(command)) {
    return;
  }

  const parsed = parsePushCommand(command);
  const { base, remote } = resolvePushDestination(parsed);
  if (!hasOutgoingCommits(base)) {
    process.stdout.write('没有待推送的新提交，无需升级版本。\n');
    return;
  }

  const result = validateRelease({
    base,
    target: 'HEAD',
    allowMajor: parsed.allowMajor,
  });
  process.stdout.write(
    `发布校验通过：${remote}/main ${result.baseVersion} → ${result.currentVersion} (${result.releaseLevel})\n`,
  );
}

function printCheckResult(result, json) {
  if (json) {
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  process.stdout.write(
    `发布校验通过：${result.baseVersion} → ${result.currentVersion} (${result.releaseLevel})；中文更新说明有效。\n`,
  );
}

async function main() {
  const { command, options } = parseArguments(process.argv.slice(2));

  if (command === 'check') {
    printCheckResult(validateRelease(options), options.json);
    return;
  }

  if (command === 'notes') {
    const target = options.target ?? 'WORKTREE';
    const version = readVersion(target);
    const changelog = readRepositoryFile('CHANGELOG.md', target);
    process.stdout.write(`${extractReleaseNotes(changelog, version)}\n`);
    return;
  }

  if (command === 'hook') {
    await runHook();
    return;
  }

  throw new Error(
    '用法：release-policy.mjs <check|notes|hook> [--base <commit>] [--target <commit>] [--allow-major] [--json]',
  );
}

const isDirectExecution = process.argv[1]
  ? import.meta.url === pathToFileURL(resolve(process.argv[1])).href
  : false;

if (isDirectExecution) {
  main().catch((error) => {
    console.error(`发布规则校验失败：${error.message}`);
    process.exitCode = process.argv[2] === 'hook' ? 2 : 1;
  });
}
