import { NextRequest, NextResponse } from "next/server";
import { isFireblocksConfigured, getFireblocksClient } from "@/lib/fireblocks";

/**
 * Test Fireblocks configuration
 * GET /api/test/fireblocks
 */
export async function GET(request: NextRequest) {
  try {
    console.log("=== Fireblocks Test Route Started ===");

    // Check configuration
    const isConfigured = isFireblocksConfigured();
    console.log("Is configured:", isConfigured);

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        error: "Fireblocks is not configured. Check environment variables.",
        details: {
          hasApiKey: !!process.env.FIREBLOCKS_API_KEY,
          hasSecretKeyPath: !!process.env.FIREBLOCKS_SECRET_KEY_PATH,
          basePath: process.env.FIREBLOCKS_BASE_PATH || "not set",
        },
      });
    }

    // Try to initialize client
    console.log("Testing Fireblocks client initialization...");
    const fireblocks = getFireblocksClient();

    console.log("Client obtained, type:", typeof fireblocks);
    console.log("Client is null:",fireblocks === null);
    console.log("Client is undefined:", fireblocks === undefined);

    if (!fireblocks) {
      return NextResponse.json({
        success: false,
        error: "Fireblocks client is null or undefined",
      }, { status: 500 });
    }

    console.log("Checking client properties...");
    console.log("Has blockchainsAssets:", 'blockchainsAssets' in fireblocks);
    console.log("blockchainsAssets type:", typeof fireblocks.blockchainsAssets);

    console.log("Fetching supported assets...");
    const supportedAssets = await fireblocks.blockchainsAssets.getSupportedAssets();

    return NextResponse.json({
      success: true,
      message: "Fireblocks is configured correctly",
      assetCount: supportedAssets.data?.length || 0,
      sampleAssets: supportedAssets.data?.slice(0, 5).map(a => a.id) || [],
    });
  } catch (error) {
    console.error("Fireblocks test error:", error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
