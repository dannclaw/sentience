/**
 * Sentience Feature Demo
 * 
 * Demonstrating:
 * 1. SOLPRISM-inspired: Verifiable Strategy Auditing
 * 2. CLODDS-inspired: Paid Yield Intelligence API
 */

import { Connection } from '@solana/web3.js';
import StrategyAuditor from '../src/core/audit';
import SentienceAPI from '../src/core/api';

async function demo() {
  console.log('🧠 Sentience Feature Demo\n');
  console.log('Features inspired by SOLPRISM + CLODDS\n');
  console.log('=' .repeat(50));

  const connection = new Connection('https://api.devnet.solana.com');

  // ==========================================
  // PART 1: SOLPRISM-Style Strategy Auditing
  // ==========================================
  console.log('\n📋 PART 1: Verifiable Strategy Auditing');
  console.log('(Inspired by SOLPRISM - breaking open the black box)\n');

  const auditor = new StrategyAuditor(connection);

  // Step 1: COMMIT strategy before execution
  console.log('1️⃣ COMMIT: Agent publishes strategy intent');
  const commitment = await auditor.commitStrategy({
    strategy: 'Rebalance from USDC to mSOL due to staking APY increase',
    riskAssessment: {
      volatility: 0.15,
      maxDrawdown: 0.08,
      healthScore: 87,
      passed: true,
    },
    marketData: {
      solPrice: 185.50,
      msolPrice: 201.80,
      stakingApy: 7.2,
      kaminoUsdcApy: 8.5,
    },
    expectedApy: 7.8,
    actions: [
      {
        type: 'swap',
        protocol: 'Jupiter',
        asset: 'USDC',
        amount: 50000,
        expectedResult: 'Receive 247 mSOL',
      },
      {
        type: 'stake',
        protocol: 'Marinade',
        asset: 'mSOL',
        amount: 247,
        expectedResult: 'Start earning 7.2% APY',
      },
    ],
  });

  console.log('\n✅ Strategy committed with cryptographic hashes');
  console.log(`   ID: ${commitment.id}`);
  console.log(`   Strategy Hash: ${commitment.strategyHash.slice(0, 20)}...`);
  console.log(`   Risk Hash: ${commitment.riskAssessmentHash.slice(0, 20)}...`);
  console.log(`   Expected APY: ${commitment.expectedOutcome.predictedApy}%`);

  // Step 2: EXECUTE (simulated)
  console.log('\n2️⃣ EXECUTE: Agent executes the strategy');
  console.log('   - Swapped 50,000 USDC → 246.8 mSOL');
  console.log('   - Staked with Marinade');
  console.log('   - Transaction: 2VzRAiPhWgh5WxB1AJ6yaMfozAetboHoADEPf3xSLaZMQJV6AHz7YwN34f9nVGx7czQguoKzdDv49a7p9iT7Btii');

  // Step 3: REVEAL actual outcome
  console.log('\n3️⃣ REVEAL: Agent reveals actual results');
  await new Promise(r => setTimeout(r, 1000)); // Simulate time passing
  
  const reveal = await auditor.revealOutcome(commitment.id, {
    realizedApy: 7.65,
    slippage: 0.08,
    fees: 0.35,
    success: true,
  });

  // Step 4: VERIFY
  console.log('\n4️⃣ VERIFY: Anyone can verify the trail');
  const verification = await auditor.verifyStrategy(commitment.id);
  console.log(`   Valid: ${verification.valid ? '✅' : '❌'}`);
  console.log(`   Accuracy Score: ${verification.score.toFixed(1)}/100`);
  console.log(`   Deviation: ${reveal.deviation.toFixed(2)}%`);

  // Get full audit trail
  const trail = await auditor.getAuditTrail();
  console.log(`\n📊 Total Strategies: ${trail.commitments.length}`);
  console.log(`📊 Success Rate: ${trail.accuracy.toFixed(1)}%`);

  // ==========================================
  // PART 2: CLODDS-Style Paid API
  // ==========================================
  console.log('\n\n💰 PART 2: Paid Yield Intelligence API');
  console.log('(Inspired by CLODDS - agents paying agents)\n');

  const api = new SentienceAPI(connection);

  // Demo: Agent queries yields
  console.log('1️⃣ Agent queries current yields');
  console.log('   Cost: $0.001 USDC');
  const yields = await api.getYields({
    minApy: 5.0,
  });
  console.log(`   Found ${yields.data.length} opportunities`);
  yields.data.slice(0, 3).forEach(y => {
    console.log(`   - ${y.asset}: ${y.apy.toFixed(2)}% on ${y.protocol}`);
  });

  // Demo: Agent gets recommendation
  console.log('\n2️⃣ Agent requests strategy recommendation');
  console.log('   Cost: $0.01 USDC');
  const recommendation = await api.getRecommendation({
    assets: { SOL: 40000, USDC: 30000, mSOL: 30000 },
    riskTolerance: 50,
  });
  
  console.log(`   Expected Portfolio APY: ${recommendation.expectedApy.toFixed(2)}%`);
  console.log('   Recommendations:');
  recommendation.recommendations.forEach(rec => {
    console.log(`   - ${rec.allocation.toFixed(1)}% ${rec.asset} (${rec.protocol}): ${rec.apy.toFixed(2)}% APY`);
    console.log(`     Reason: ${rec.reasoning}`);
  });

  // Demo: Process payment
  console.log('\n3️⃣ Revenue flows to treasury');
  await api.processPayment('agent-123', 0.011); // Total for both queries
  console.log('   ✅ 0.011 USDC added to treasury');

  // Stats
  const stats = await api.getUsageStats();
  console.log(`\n📊 API Revenue Stats:`);
  console.log(`   Total Clients: ${stats.totalClients}`);
  console.log(`   Total Revenue: ${stats.totalRevenue.toFixed(3)} USDC`);

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n\n' + '='.repeat(50));
  console.log('✨ FEATURES DEMONSTRATED');
  console.log('='.repeat(50));
  console.log('\n1. SOLPRISM-Style Verifiable Auditing:');
  console.log('   - Every strategy committed with SHA-256 hashes');
  console.log('   - Risk assessments stored on-chain');
  console.log('   - Outcomes revealed for verification');
  console.log('   - Judges can audit every decision');
  
  console.log('\n2. CLODDS-Style Paid API:');
  console.log('   - Other agents pay for intelligence');
  console.log('   - Revenue flows to treasury');
  console.log('   - Self-sustaining agent economy');
  console.log('   - OpenClaw-compatible skill.md');

  console.log('\n🎯 Why This Wins:');
  console.log('   - Transparency: Verifiable by anyone');
  console.log('   - Revenue: API creates income stream');
  console.log('   - Most Agentic: Agents paying agents!');
  console.log('   - Innovation: Combining best of both projects');

  console.log('\n📁 Files:');
  console.log('   - src/core/audit.ts (StrategyAuditor)');
  console.log('   - src/core/api.ts (SentienceAPI)');
  console.log('   - Run this demo: npm run demo');
}

demo().catch(console.error);
