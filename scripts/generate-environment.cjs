const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envFilePath = path.join(projectRoot, '.env');
const runtimeEnvFilePath = path.join(projectRoot, 'src', 'assets', 'env.js');

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const parsed = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const equalsIndex = line.indexOf('=');
    if (equalsIndex <= 0) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    const value = line.slice(equalsIndex + 1).trim().replace(/^['\"]|['\"]$/g, '');
    if (key) {
      parsed[key] = value;
    }
  }

  return parsed;
}

const fileEnv = loadDotEnv(envFilePath);
const mergedEnv = {
  ...fileEnv,
  ...process.env
};

const apiBaseUrl = mergedEnv.API_BASE_URL || 'https://api.example.com';

const output = `window.__env = Object.assign({}, window.__env, {
  API_BASE_URL: '${apiBaseUrl}'
});
`;

fs.writeFileSync(runtimeEnvFilePath, output, 'utf8');
console.log(`Generated ${path.relative(projectRoot, runtimeEnvFilePath)} with API_BASE_URL=${apiBaseUrl}`);
