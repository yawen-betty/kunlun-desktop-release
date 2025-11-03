import * as fs from 'fs';
import * as path from 'path';

// This script is designed to be run in a GitHub Actions workflow.
// It fetches assets from a draft release and generates a complete latest.json file.

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
  url: string; // API URL to download asset content
}

interface PlatformInfo {
  signature: string;
  url: string;
  size: number;
}

interface LatestJson {
  version: string;
  notes: string;
  pub_date: string;
  platforms: {
    [key: string]: PlatformInfo;
  };
}

// Helper function to fetch from GitHub API
async function fetchGitHubAPI<T>(url: string, token: string, accept = 'application/vnd.github.v3+json'): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': accept,
    },
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API request to ${url} failed: ${response.statusText}. Body: ${errorBody}`);
  }
  if (accept === 'application/octet-stream') {
    return response.text() as Promise<T>;
  }
  return response.json() as Promise<T>;
}

function getPlatformIdentifier(fileName: string): string | null {
    if (fileName.endsWith('.app.tar.gz')) return 'darwin-aarch64'; // Apple Silicon
    if (fileName.endsWith('.dmg')) return 'darwin-x86_64'; // Intel Mac
    if (fileName.endsWith('.msi')) return 'windows-x86_64';
    if (fileName.endsWith('.AppImage')) return 'linux-x86_64';
    return null;
}

async function main() {
  const { GITHUB_TOKEN, RELEASE_TAG, REPO_SLUG } = process.env;

  if (!GITHUB_TOKEN || !RELEASE_TAG || !REPO_SLUG) {
    throw new Error('Missing required environment variables: GITHUB_TOKEN, RELEASE_TAG, REPO_SLUG');
  }

  console.log(`Fetching release with tag: ${RELEASE_TAG} from repo: ${REPO_SLUG}`);

  const releaseUrl = `https://api.github.com/repos/${REPO_SLUG}/releases/tags/${RELEASE_TAG}`;
  const releaseData = await fetchGitHubAPI<{ assets: ReleaseAsset[], pub_date: string, body: string }>(releaseUrl, GITHUB_TOKEN);

  const assets = releaseData.assets;
  console.log('Found release assets:', assets.map(a => a.name));

  const installers = assets.filter(asset => getPlatformIdentifier(asset.name));
  const signatures = assets.filter(asset => asset.name.endsWith('.sig'));

  const platforms: { [key: string]: PlatformInfo } = {};

  for (const installer of installers) {
    const platformId = getPlatformIdentifier(installer.name);
    if (!platformId) continue;

    const signatureAsset = signatures.find(sig => sig.name === `${installer.name}.sig`);
    if (!signatureAsset) {
      console.warn(`Signature not found for installer: ${installer.name}`);
      continue;
    }

    console.log(`Processing platform: ${platformId} for installer ${installer.name}`);
    const signatureContent = await fetchGitHubAPI<string>(signatureAsset.url, GITHUB_TOKEN, 'application/octet-stream');

    platforms[platformId] = {
      signature: signatureContent.trim(),
      url: installer.browser_download_url,
      size: installer.size,
    };
  }

  const packageData = fs.readFileSync('package.json', 'utf-8');
  const packageJson = JSON.parse(packageData);

  const latestJson: LatestJson = {
    version: packageJson.version,
    notes: releaseData.body || 'See release notes on GitHub.',
    pub_date: releaseData.pub_date,
    platforms,
  };

  const outputPath = 'latest.json';
  fs.writeFileSync(outputPath, JSON.stringify(latestJson, null, 2), 'utf-8');

  console.log('Successfully generated latest.json at:', outputPath);
  console.log('Content:', JSON.stringify(latestJson, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
