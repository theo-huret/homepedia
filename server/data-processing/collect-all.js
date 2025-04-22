const { spawn } = require('child_process');
const path = require('path');

const scriptsDir = path.join(__dirname, 'scripts');
const geoDataScript = path.join(scriptsDir, 'fetch-geo-data.js');
const dvfScript = path.join(scriptsDir, 'fetch-dvf.js');
const socioEcoScript = path.join(scriptsDir, 'fetch-socio-economic.js');
const aggregateScript = path.join(scriptsDir, 'aggregate-prices.js');

function runScript(scriptPath) {
    return new Promise((resolve, reject) => {
        console.log(`Exécution de ${path.basename(scriptPath)}...`);

        const process = spawn('node', [scriptPath], { stdio: 'inherit' });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(`Script ${path.basename(scriptPath)} terminé avec succès.`);
                resolve();
            } else {
                console.error(`Script ${path.basename(scriptPath)} terminé avec code d'erreur ${code}.`);
                reject(new Error(`Script exited with code ${code}`));
            }
        });

        process.on('error', (err) => {
            console.error(`Erreur lors de l'exécution du script ${path.basename(scriptPath)}:`, err);
            reject(err);
        });
    });
}

async function main() {
    try {
        console.log('Démarrage de la collecte de toutes les données...');

        // 1. Collecte des données géographiques (régions, départements, communes)
        await runScript(geoDataScript);

        // 2. Collecte des données de valeurs foncières (DVF)
        await runScript(dvfScript);

        // 3. Collecte des données socio-économiques
        await runScript(socioEcoScript);

        // 4. Agrégation des prix immobiliers
        await runScript(aggregateScript);

        console.log('La collecte de toutes les données est terminée avec succès !');
    } catch (error) {
        console.error('Erreur lors de la collecte des données:', error);
        process.exit(1);
    }
}

// Exécuter le processus de collecte
main();