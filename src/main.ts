import { SentienceAgent } from './index';
import { loadConfig, validateConfig, TreasuryConfig } from './config';
import { createAPIServer } from './server';
import { SentienceAPI } from './core/api';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🧠 Starting Sentience AI Treasury Agent...\n');
  
  try {
    // Load and validate configuration
    const config = loadConfig();
    validateConfig(config);
    
    // Initialize the agent
    const agent = new SentienceAgent(config);
    await agent.initialize();
    
    // Start API server
    const api = new SentienceAPI(agent.treasury['connection']);
    const app = createAPIServer(agent.treasury, api);
    const PORT = config.apiConfig?.port || 3001;
    
    app.listen(PORT, () => {
      console.log(`\n🌐 API server running on http://localhost:${PORT}`);
      console.log(`📊 Dashboard available at http://localhost:3000`);
    });
    
    // Start the heartbeat loop
    console.log('\n💓 Starting heartbeat...');
    await agent.startHeartbeat();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Shutting down gracefully...');
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 Shutting down gracefully...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the agent
main();
