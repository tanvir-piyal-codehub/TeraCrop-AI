import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { CROPS, CROP_LIST } from './src/lib/crops/database.ts';
import { getEnvironmentalSnapshot, adjustSnapshotForScenario } from './src/lib/environment/snapshot.ts';
import { DATA_SOURCES } from './src/lib/environment/dataSources.ts';
import { generateRotationPlan } from './src/lib/optimization/engine.ts';
import { generateStandardScenarios, simulateCustomScenario } from './src/lib/optimization/evaluator.ts';
import { askTerraAssistant } from './src/lib/ai/service.ts';
import { INITIAL_DEMO_FARM } from './src/lib/storage/store.ts';
import { FarmProfile, EnvironmentalSnapshot } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// In-memory server state seeded with demo farm
let serverFarmProfile: FarmProfile = { ...INITIAL_DEMO_FARM };

// --- API ROUTES ---

// GET /api/farm
app.get('/api/farm', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: serverFarmProfile
  });
});

// POST /api/farm
app.post('/api/farm', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.name || !payload.size || !payload.soilType || !payload.currentCropId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required farm profile fields (name, size, soilType, currentCropId).'
      });
    }

    serverFarmProfile = {
      ...serverFarmProfile,
      ...payload,
      updatedAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      data: serverFarmProfile
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// GET /api/environment
app.get('/api/environment', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : serverFarmProfile.location.latitude;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : serverFarmProfile.location.longitude;
    const snapshot = await getEnvironmentalSnapshot(lat, lon);
    res.json({
      success: true,
      data: snapshot
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch environmental data' });
  }
});

// GET /api/crops
app.get('/api/crops', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: CROP_LIST
  });
});

// GET /api/data-sources
app.get('/api/data-sources', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: DATA_SOURCES
  });
});

// POST /api/rotation
app.post('/api/rotation', (req: Request, res: Response) => {
  try {
    const { farm, environment, strategy, horizonYears } = req.body;
    const targetFarm = farm || serverFarmProfile;
    const plan = generateRotationPlan(
      targetFarm,
      environment,
      strategy || 'AI Optimized',
      horizonYears || targetFarm.planningPeriod
    );

    res.json({
      success: true,
      data: plan
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to calculate rotation plan' });
  }
});

// POST /api/scenario
app.post('/api/scenario', (req: Request, res: Response) => {
  try {
    const { farm, environment, rainfallChangePercent, temperatureChangeC, waterAvailability, priority } = req.body;
    const targetFarm = farm || serverFarmProfile;

    if (rainfallChangePercent !== undefined && temperatureChangeC !== undefined) {
      const scenario = simulateCustomScenario({
        farmProfile: targetFarm,
        baseEnvironment: environment,
        rainfallChangePercent,
        temperatureChangeC,
        waterAvailabilityOverride: waterAvailability,
        primaryPriorityOverride: priority
      });
      return res.json({ success: true, data: scenario });
    }

    const scenarios = generateStandardScenarios(targetFarm, environment);
    return res.json({ success: true, data: scenarios });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Scenario calculation failed' });
  }
});

// POST /api/ai/chat
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, farm, environment, plan } = req.body;
    const result = await askTerraAssistant(
      message,
      history || [],
      farm || serverFarmProfile,
      environment,
      plan
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'AI assistant error' });
  }
});

// --- SERVER SETUP & VITE MIDDLEWARE ---
async function startServer() {
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TerraCrop AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
