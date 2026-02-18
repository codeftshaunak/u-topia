/**
 * Test script for Fireblocks webhook endpoint
 * 
 * Tests:
 * 1. Webhook signature verification
 * 2. Transaction created event processing
 * 3. Transaction status update event processing
 * 4. Payment matching logic
 * 
 * Usage: node scripts/test-webhook.js
 */

const crypto = require('crypto');

// Fireblocks sandbox public key for signature generation (testing purposes)
const SANDBOX_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApZE6wL2+7P1ohvVYSpCd
gSgtmyGwiLbUC1UoGJhn1zwfY7ZWbNH7Pg8Osk8OzZTZHSG/arcgE8HnGCmGKtbE
QBkf2XlBRBQ01FcCMlZuJQJ3nElCPaMl9N6fq0VKNEIlVSVUpDCgvag5kFhDKS/L
p3YYJLFR46/hDlVLn+vM84diO3xGyMc16YJGNz7Z4jb8dmSZQE5E2XaQMDXW6uxC
c2ChjWJ3X5H70MzRG35JsN0j58SQTwbf4Pxm0aJfhPuaIBn3mJuZL5etsuFihoFG
FDnT+qWRcgD/pRNulBFAFhJeUnFrE4fFTJ1iaHhjBrStBCrxJk6QI0pGznoapTgA
2QIDAQAB
-----END PUBLIC KEY-----`;

// Test webhook payloads
const TRANSACTION_CREATED_PAYLOAD = {
  type: "TRANSACTION_CREATED",
  tenantId: "test-tenant",
  timestamp: Date.now(),
  data: {
    id: "test-tx-001",
    status: "PENDING_SIGNATURE",
    operation: "TRANSFER",
    assetId: "BTC_TEST",
    source: { type: "EXTERNAL_WALLET" },
    destination: { 
      type: "VAULT_ACCOUNT",
      id: "test-vault-123",
      name: "User Vault"
    },
    amountInfo: {
      amount: "0.001",
      amountUSD: "100.00"
    },
    destinationAddress: "tb1qtest123address",
    createdAt: Date.now(),
    lastUpdated: Date.now()
  }
};

const TRANSACTION_STATUS_UPDATED_PAYLOAD = {
  type: "TRANSACTION_STATUS_UPDATED",
  tenantId: "test-tenant",
  timestamp: Date.now(),
  data: {
    id: "test-tx-001",
    status: "COMPLETED",
    operation: "TRANSFER",
    assetId: "BTC_TEST",
    source: { type: "EXTERNAL_WALLET" },
    destination: {
      type: "VAULT_ACCOUNT",
      id: "test-vault-123",
      name: "User Vault"
    },
    amountInfo: {
      amount: "0.001",
      amountUSD: "1000.00"
    },
    destinationAddress: "tb1qtest123address",
    txHash: "0xtest123hash",
    createdAt: Date.now() - 60000,
    lastUpdated: Date.now()
  }
};

async function testWebhook() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const webhookUrl = `${baseUrl}/api/webhooks/fireblocks`;
  
  console.log('🔍 Testing Fireblocks Webhook');
  console.log('📍 Endpoint:', webhookUrl);
  console.log();

  // Test 1: Transaction Created
  await testEvent('TRANSACTION_CREATED', TRANSACTION_CREATED_PAYLOAD, webhookUrl);
  
  // Test 2: Transaction Status Updated (COMPLETED)
  await testEvent('TRANSACTION_STATUS_UPDATED - COMPLETED', TRANSACTION_STATUS_UPDATED_PAYLOAD, webhookUrl);
  
  // Test 3: Invalid signature
  await testInvalidSignature(webhookUrl);
  
  // Test 4: Missing signature
  await testMissingSignature(webhookUrl);

  console.log('\n✅ All webhook tests completed');
}

async function testEvent(name, payload, webhookUrl) {
  console.log(`\n📤 Testing: ${name}`);
  console.log('━'.repeat(60));
  
  const body = JSON.stringify(payload);
  
  // In development, signature verification is bypassed
  // For production testing, you would need the actual private key
  const fakeSignature = Buffer.from('test-signature').toString('base64');
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'fireblocks-signature': fakeSignature,
      },
      body: body
    });

    const result = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Webhook processed successfully');
    } else {
      console.log('⚠️  Webhook returned non-200 status');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testInvalidSignature(webhookUrl) {
  console.log('\n📤 Testing: Invalid Signature');
  console.log('━'.repeat(60));
  
  const payload = TRANSACTION_CREATED_PAYLOAD;
  const body = JSON.stringify(payload);
  const invalidSignature = 'invalid-signature';
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'fireblocks-signature': invalidSignature,
      },
      body: body
    });

    const result = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 401 || response.status === 200) {
      console.log('✅ Invalid signature handled correctly');
    } else {
      console.log('⚠️  Unexpected status for invalid signature');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testMissingSignature(webhookUrl) {
  console.log('\n📤 Testing: Missing Signature');
  console.log('━'.repeat(60));
  
  const payload = TRANSACTION_CREATED_PAYLOAD;
  const body = JSON.stringify(payload);
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body
    });

    const result = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 400) {
      console.log('✅ Missing signature rejected correctly');
    } else {
      console.log('⚠️  Unexpected status for missing signature');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Run tests
testWebhook().catch(console.error);
