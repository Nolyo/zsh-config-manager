#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const files = [
  'app/src-tauri/Cargo.toml',
  'app/src-tauri/tauri.conf.json',
  'app/package.json'
];

function updateVersion(newVersion) {
  if (!newVersion) {
    console.error('Usage: node scripts/version.js x.x.x');
    process.exit(1);
  }

  const versionRegex = /^(\d+)\.(\d+)\.(\d+)$/;
  if (!versionRegex.test(newVersion)) {
    console.error('Invalid version format. Expected: x.x.x');
    process.exit(1);
  }

  files.forEach(filePath => {
    try {
      const fullPath = path.resolve(__dirname, '..', filePath);
      let content = fs.readFileSync(fullPath, 'utf8');

      if (filePath.endsWith('.toml')) {
        content = content.replace(/^version = ".*"$/m, `version = "${newVersion}"`);
      } else if (filePath.endsWith('.json')) {
        const json = JSON.parse(content);
        json.version = newVersion;
        content = JSON.stringify(json, null, filePath.includes('tauri.conf') ? 2 : 2);
      }

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✓ Updated ${filePath} to ${newVersion}`);
    } catch (error) {
      console.error(`✗ Error updating ${filePath}:`, error.message);
      process.exit(1);
    }
  });

  console.log(`\n🎉 Version updated to ${newVersion}`);
  console.log(`\nNext steps:`);
  console.log(`git commit -am "chore: bump version to ${newVersion}"`);
  console.log(`git tag release-${newVersion}`);
  console.log(`git push origin main --tags`);
}

if (require.main === module) {
  updateVersion(process.argv[2]);
}

module.exports = { updateVersion };