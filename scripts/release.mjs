#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const bump = process.argv[2];
if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error('Usage: node scripts/release.mjs <patch|minor|major>');
  process.exit(1);
}

const dirty = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
if (dirty) {
  console.error('Working tree has uncommitted changes. Commit or stash first.');
  process.exit(1);
}

const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const [maj, min, pat] = appJson.expo.version.split('.').map(Number);
const next =
  bump === 'major'
    ? `${maj + 1}.0.0`
    : bump === 'minor'
      ? `${maj}.${min + 1}.0`
      : `${maj}.${min}.${pat + 1}`;

appJson.expo.version = next;
appJson.expo.android ??= {};
appJson.expo.android.versionCode = (appJson.expo.android.versionCode ?? 0) + 1;
pkg.version = next;

fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2) + '\n');
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

execSync('git add app.json package.json', { stdio: 'inherit' });
execSync(`git commit -m "release v${next}"`, { stdio: 'inherit' });
execSync(`git tag v${next}`, { stdio: 'inherit' });

console.log(
  `\nBumped to v${next} (android.versionCode=${appJson.expo.android.versionCode}).`
);
console.log('Push with:  git push && git push --tags');
