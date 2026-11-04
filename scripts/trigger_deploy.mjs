#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

let hook = process.env.VERCEL_DEPLOY_HOOK;

if (!hook && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const match = envContent.match(/^VERCEL_DEPLOY_HOOK=(.+)$/m);
  if (match) {
    hook = match[1].trim().replace(/^['"]|['"]$/g, '');
  }
}

if (!hook) {
  console.error('\n❌ Error: No se encontró la variable VERCEL_DEPLOY_HOOK.\n');
  console.log('Para usar el despliegue bajo demanda desde la terminal:');
  console.log('1. Ve a Vercel > Configuración del Proyecto > Git > Deploy Hooks.');
  console.log('2. Crea un Deploy Hook apuntando a la rama "main" y copia la URL.');
  console.log('3. Añade la URL a tu archivo .env.local:');
  console.log('   VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/...\n');
  console.log('O ejecútalo directamente pasando la variable:');
  console.log('   VERCEL_DEPLOY_HOOK="https://api.vercel.com/..." npm run deploy:prod\n');
  process.exit(1);
}

console.log('🚀 Iniciando despliegue de producción en Vercel...');

try {
  const response = await fetch(hook, { method: 'POST' });
  const text = await response.text();

  if (response.ok) {
    console.log(`✅ ¡Despliegue disparado exitosamente en Vercel! (HTTP ${response.status})`);
    if (text) {
      try {
        const json = JSON.parse(text);
        if (json.job) {
          console.log(`📋 Job ID: ${json.job.id || 'N/A'} | Estado: ${json.job.state || 'creado'}`);
        }
      } catch {
        console.log(`Respuesta: ${text}`);
      }
    }
    console.log('Puedes monitorear el progreso en https://vercel.com/dashboard');
  } else {
    console.error(`❌ Error de Vercel (HTTP ${response.status}): ${text}`);
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Error de conexión al disparar el Deploy Hook:', err.message);
  process.exit(1);
}
