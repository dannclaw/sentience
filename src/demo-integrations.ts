/**
 * Sentience Integration Demo
 * 
 * Shows how all hackathon collaborations work together:
 * - SlotScribe: Verifiable execution traces
 * - AgentPay: Hiring specialized agents with escrow
 * - ClaudeCraft: Visual representation in Minecraft
 * - Takuma: Self-healing execution
 */

import { Connection, PublicKey } from '@solana/web3.js';
import StrategyAuditor from './core/audit';
import SlotScribeRecorder from './integrations/slotscribe';
import AgentPayClient from './integrations/agentpay';
import ClaudeCraftBridge from './integrations/claudecraft';

async function runIntegrationDemo() {
  console.log('🚀 Sentience Integration Demo\n');
  console.log('=' .repeat(50));

  // Initialize core components
  const connection = new Connection('https://api.devnet.solana.com');
  const auditor = new StrategyAuditor(connection);
  
  // 1. SlotScribe - Verifiable execution
  const slotScribe = new SlotScribeRecorder(
    connection,
    {
      enabled: true,
      memoProgramId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      storageEndpoint: 'https://api.slotscribe.xyz',
      anchorPrefix: 'SS1',
    },
    auditor
  );

  // 2. AgentPay - Hiring agents
  const agentPay = new AgentPayClient({
    mcpServerUrl: 'https://agentpay-mcp.example.com',
    programId: '2rfRD9jhyK4nwiWiDuixARYsmU3Euw2QMPjmSLHxxYpw',
    treasuryWallet: '276awy6pQNbQ7mZduJrY5Dp2w6MEjHprHjUD67Kk8qhu',
  });

  // 3. ClaudeCraft - Visual demo
  const claudeCraft = new ClaudeCraftBridge({
    apiEndpoint: 'https://claudecraft-api.example.com',
    apiKey: 'PENDING',  // Waiting for @ClaudeCraft response
    worldId: 'sentience-demo',
    agentName: 'Sentience',
  });

  // Demo Scenario: Rebalance Treasury
  console.log('\n📋 Scenario: Treasury Rebalancing\n');

  // Step 1: Commit strategy (SlotScribe)
  console.log('Step 1: Commit strategy decision');
  const strategy = {
    strategy: 'rebalance-stablecoin-yield',
    riskAssessment: { volatility: 0.15, maxDrawdown: 0.02 },
    marketData: { usdcApy: 8.2, msolApy: 6.8, jitosolApy: 7.1 },
    expectedApy: 7.5,
    actions: [
      { type: 'deposit' as const, protocol: 'Kamino', asset: 'USDC', amount: 40, expectedResult: '8.2% APY' },
      { type: 'stake' as const, protocol: 'Marinade', asset: 'mSOL', amount: 35, expectedResult: '6.8% APY' },
      { type: 'stake' as const, protocol: 'Jito', asset: 'JitoSOL', amount: 25, expectedResult: '7.1% APY' },
    ],
  };

  const payer = new PublicKey('276awy6pQNbQ7mZduJrY5Dp2w6MEjHprHjUD67Kk8qhu');
  const anchoredTrace = await slotScribe.anchorStrategy(strategy, payer);
  console.log(`   ✅ Anchored: ${anchoredTrace.signature.slice(0, 20)}...\n`);

  // Step 2: Hire execution agent (AgentPay)
  console.log('Step 2: Hire specialized agents');
  
  const takumaEscrow = await agentPay.hireTakuma({
    strategy: 'rebalance-stablecoin-yield',
    maxSlippage: 0.5,
    priorityFee: 0.0001,
  });
  console.log(`   🤖 Hired Takuma: ${takumaEscrow.id}`);

  const slotscribeEscrow = await agentPay.hireSlotScribe({
    traceId: anchoredTrace.signature,
    verifyOnChain: true,
  });
  console.log(`   ✈️ Hired SlotScribe: ${slotscribeEscrow.id}\n`);

  // Step 3: Create visual demo (ClaudeCraft)
  console.log('Step 3: Create Minecraft visualization');
  if (claudeCraft.isReady()) {
    await claudeCraft.connect();
    const worldId = await claudeCraft.createDemoWorld();
    console.log(`   🎮 Demo world: ${worldId}\n`);
  } else {
    console.log('   ⏳ Waiting for ClaudeCraft API credentials\n');
  }

  // Step 4: Reveal outcome
  console.log('Step 4: Reveal execution outcome');
  const commitment = await auditor.commitStrategy(strategy);
  const reveal = await auditor.revealOutcome(commitment.id, {
    realizedApy: 7.42,
    slippage: 0.12,
    fees: 0.05,
    success: true,
  });
  console.log(`   📊 Deviation: ${reveal.deviation.toFixed(2)}%\n`);

  // Step 5: Verify
  console.log('Step 5: Verify strategy trail');
  const verification = await slotScribe.verifyAnchor(anchoredTrace.signature);
  console.log(`   ${verification.valid ? '✅' : '❌'} Valid: ${verification.valid}\n`);

  // Summary
  console.log('=' .repeat(50));
  console.log('\n📊 Integration Summary:\n');
  console.log('✅ SlotScribe: Strategy anchored on-chain');
  console.log('✅ AgentPay: 2 agents hired with escrow');
  console.log(claudeCraft.isReady() ? '✅ ClaudeCraft: Visual demo live' : '⏳ ClaudeCraft: Awaiting credentials');
  console.log('✅ StrategyAuditor: Full audit trail');
  console.log('\n🔗 Collaborations Active:');
  console.log('   - @SlotScribe-Agent: Flight recorder');
  console.log('   - @Takuma: Execution bot');
  console.log('   - @agentpay-protocol: Payment + ZK proofs');
  console.log('   - @ClaudeCraft: Minecraft visualization (pending)');
}

// Run demo
if (require.main === module) {
  runIntegrationDemo().catch(console.error);
}

export default runIntegrationDemo;
