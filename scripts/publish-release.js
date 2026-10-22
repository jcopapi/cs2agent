const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function getGitToken() {
  const res = spawnSync('git', ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n',
    encoding: 'utf8',
  });
  const match = res.stdout.match(/password=(.+)/);
  if (!match) {
    throw new Error('Could not retrieve GitHub token from git credential manager');
  }
  return match[1].trim();
}

const token = getGitToken();
const owner = 'jcopapi';
const repo = 'csoverlayassistant';

function requestJson(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'CS2Agent-Release-Publisher',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        ...options.headers,
      },
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ statusCode: res.statusCode, data });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function uploadAsset(uploadUrlTemplate, filePath, fileName) {
  return new Promise((resolve, reject) => {
    const uploadBase = uploadUrlTemplate.replace(/\{.*?\}$/, '');
    const uploadUrl = new URL(`${uploadBase}?name=${encodeURIComponent(fileName)}`);
    const fileStats = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);

    console.log(`Starting upload for ${fileName} (${(fileStats.size / (1024 * 1024)).toFixed(2)} MB)...`);

    const reqOptions = {
      hostname: uploadUrl.hostname,
      path: uploadUrl.pathname + uploadUrl.search,
      method: 'POST',
      headers: {
        'User-Agent': 'CS2Agent-Release-Publisher',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileStats.size,
      },
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ statusCode: res.statusCode, data });
          }
        } else {
          reject(new Error(`Failed to upload ${fileName} (HTTP ${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);

    let uploaded = 0;
    fileStream.on('data', (chunk) => {
      uploaded += chunk.length;
      const pct = ((uploaded / fileStats.size) * 100).toFixed(1);
      process.stdout.write(`\rUploading ${fileName}: ${pct}%`);
    });

    fileStream.on('end', () => {
      console.log(`\nStream ended, finalizing asset ${fileName}...`);
    });

    fileStream.pipe(req);
  });
}

async function main() {
  console.log(`Checking if release v1.0.0 exists for ${owner}/${repo}...`);
  let release;

  try {
    const res = await requestJson(`https://api.github.com/repos/${owner}/${repo}/releases/tags/v1.0.0`);
    release = res.data;
    console.log(`Found existing release: ID ${release.id}`);
  } catch {
    console.log('Release not found, creating new release v1.0.0...');
    const releaseBody = {
      tag_name: 'v1.0.0',
      target_commitish: 'main',
      name: 'CS Overlay Assistant v1.0.0',
      body: `## CS Overlay Assistant v1.0.0

Tactical overlay companion for Counter-Strike 2 with zero VAC memory hooks, offline lineup packages, and calibrated bomb timer.

### 📦 Downloads

| Versão | Arquivo | Descrição | Tamanho |
| :--- | :--- | :--- | :--- |
| **Instalador Oficial** | [CS.Overlay.Assistant.Setup.1.0.0.exe](https://github.com/${owner}/${repo}/releases/download/v1.0.0/CS.Overlay.Assistant.Setup.1.0.0.exe) | Instalador completo com atalho na Área de Trabalho e inicialização rápida | ~77 MB |
| **Portátil (Standalone)** | [CS.Overlay.Assistant.1.0.0.exe](https://github.com/${owner}/${repo}/releases/download/v1.0.0/CS.Overlay.Assistant.1.0.0.exe) | Executável único portátil, não requer instalação | ~77 MB |

---

### ✨ Destaques da Versão
- **Totalmente Offline & Seguro**: Utiliza apenas Game State Integration (GSI) e Win32 Focus Monitor sem injeção de DLL ou leitura de memória.
- **Lineups Autênticas**: Pacotes padrão curados para Mirage, Inferno, Dust II, Nuke, Ancient e Anubis com fotos reais de mira e fotos de onde cai (landing impact).
- **Importador de Pacotes Customizados**: Suporte a arquivos \`.zip\` com lineups personalizadas pela comunidade.
- **Timer de Bomba Calibrado (1.5s delay)**: Precisão total para os 10 e 5 segundos críticos de defuse.
- **Multilíngue**: Suporte completo para Inglês, Português (Brasil) e Espanhol.
`,
      draft: false,
      prerelease: false,
    };

    const res = await requestJson(
      `https://api.github.com/repos/${owner}/${repo}/releases`,
      { method: 'POST' },
      releaseBody
    );
    release = res.data;
    console.log(`Created release ID ${release.id}: ${release.html_url}`);
  }

  const existingAssets = release.assets || [];
  console.log(`Current assets in release: ${existingAssets.map((a) => a.name).join(', ') || 'None'}`);

  const filesToUpload = [
    {
      name: 'CS.Overlay.Assistant.Setup.1.0.0.exe',
      path: path.join(__dirname, '..', 'release', 'CS Overlay Assistant Setup 1.0.0.exe'),
    },
    {
      name: 'CS.Overlay.Assistant.1.0.0.exe',
      path: path.join(__dirname, '..', 'release', 'CS Overlay Assistant 1.0.0.exe'),
    },
  ];

  for (const item of filesToUpload) {
    if (!fs.existsSync(item.path)) {
      console.error(`File not found: ${item.path}`);
      continue;
    }

    const alreadyExists = existingAssets.find((a) => a.name === item.name);
    if (alreadyExists) {
      console.log(`Asset ${item.name} already exists (ID: ${alreadyExists.id}). Skipping or delete first.`);
      continue;
    }

    await uploadAsset(release.upload_url, item.path, item.name);
    console.log(`Successfully uploaded: ${item.name}`);
  }

  console.log(`\nAll done! Release is available at: ${release.html_url}`);
}

main().catch((err) => {
  console.error('Fatal error during publish:', err);
  process.exit(1);
});
