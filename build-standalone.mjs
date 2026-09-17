import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
let engine=fs.readFileSync(path.join(root,'engine.mjs'),'utf8');
let app=fs.readFileSync(path.join(root,'app.js'),'utf8');

engine=engine.replace(/^export\s+/gm,'');
app=app.replace(/^import\s*\{[\s\S]*?\}\s*from\s*['"]\.\/engine\.mjs['"];\s*/,'');
html=html.replace(/\s*<link rel="manifest"[^>]*>\s*/g,'\n')
         .replace(/\s*<link rel="icon"[^>]*>\s*/g,'\n')
         .replace(/\s*<link rel="apple-touch-icon"[^>]*>\s*/g,'\n')
         .replace(/<link rel="stylesheet" href="styles\.css"\s*\/?>/,`<style>\n${css}\n</style>`)
         .replace(/<script type="module" src="app\.js"><\/script>/,()=>`<script>\n${engine}\n\n${app}\n</script>`);

const currentStandalone=path.join(root,'SAYMERA_v1_4_TEK_DOSYA.html');
const v13Standalone=path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html');
const legacyStandalone=path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html');
fs.writeFileSync(currentStandalone,html);
fs.writeFileSync(v13Standalone,html);
fs.writeFileSync(legacyStandalone,html);
console.log('standalone built:',currentStandalone);
