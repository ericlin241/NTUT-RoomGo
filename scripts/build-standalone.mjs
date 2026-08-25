import { copyFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
await copyFile(new URL('standalone.template.html', root), new URL('啟動說明.html', root));
console.log('Built 啟動說明.html');
