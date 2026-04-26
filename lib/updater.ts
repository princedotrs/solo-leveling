import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';

export const GITHUB_REPO = 'princedotrs/solo-leveling';
export const CHECK_THROTTLE_MS = 6 * 3600_000;

export type UpdateInfo = {
  version: string;
  url: string;
  notes: string;
  publishedAt: number;
};

export function getCurrentVersion(): string {
  return (
    Application.nativeApplicationVersion ??
    (Constants.expoConfig?.version as string | undefined) ??
    '0.0.0'
  );
}

function stripV(tag: string): string {
  return tag.replace(/^v/i, '').trim();
}

export function compareVersions(a: string, b: string): number {
  const pa = stripV(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = stripV(b).split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length, 3);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

type GhAsset = { name: string; browser_download_url: string };
type GhRelease = {
  tag_name: string;
  body: string | null;
  published_at: string;
  assets: GhAsset[];
  draft?: boolean;
  prerelease?: boolean;
};

export async function fetchLatestRelease(): Promise<UpdateInfo | null> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
    { headers: { Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}`);
  }
  const data = (await res.json()) as GhRelease;
  if (data.draft || data.prerelease) return null;
  const apk = data.assets.find((a) => a.name.toLowerCase().endsWith('.apk'));
  if (!apk) return null;
  return {
    version: stripV(data.tag_name),
    url: apk.browser_download_url,
    notes: data.body?.trim() ?? '',
    publishedAt: new Date(data.published_at).getTime(),
  };
}

export async function checkForUpdate(): Promise<{
  info: UpdateInfo | null;
  hasUpdate: boolean;
}> {
  const info = await fetchLatestRelease();
  if (!info) return { info: null, hasUpdate: false };
  const current = getCurrentVersion();
  return { info, hasUpdate: compareVersions(info.version, current) > 0 };
}

export type DownloadProgressCallback = (progress: number) => void;

export async function downloadApk(
  url: string,
  version: string,
  onProgress?: DownloadProgressCallback
): Promise<string> {
  const dest = `${FileSystem.cacheDirectory}solo-leveling-v${version}.apk`;
  const resumable = FileSystem.createDownloadResumable(
    url,
    dest,
    {},
    (p) => {
      if (!onProgress || p.totalBytesExpectedToWrite <= 0) return;
      onProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite);
    }
  );
  const result = await resumable.downloadAsync();
  if (!result?.uri) throw new Error('Download failed');
  return result.uri;
}

export async function installApk(fileUri: string): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new Error('In-app install is only supported on Android.');
  }
  const contentUri = await FileSystem.getContentUriAsync(fileUri);
  await IntentLauncher.startActivityAsync(
    'android.intent.action.VIEW',
    {
      data: contentUri,
      flags: 1,
      type: 'application/vnd.android.package-archive',
    }
  );
}

export async function downloadAndInstall(
  url: string,
  version: string,
  onProgress?: DownloadProgressCallback
): Promise<void> {
  const fileUri = await downloadApk(url, version, onProgress);
  await installApk(fileUri);
}
