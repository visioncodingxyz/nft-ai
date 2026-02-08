import { type Connection, type PublicKey, Transaction, SystemProgram, type Keypair } from "@solana/web3.js"
import {
  createInitializeMint2Instruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token"

export interface NFTMetadata {
  name: string
  symbol: string
  description: string
  image: string
  attributes?: Array<{ trait_type: string; value: string }>
  properties?: {
    files: Array<{ uri: string; type: string }>
    category: string
  }
}

export async function createMintNFTTransaction(
  connection: Connection,
  payer: PublicKey,
  mintKeypair: Keypair,
  metadataUri: string,
  name: string,
  symbol = "NFTAI",
): Promise<Transaction> {
  const transaction = new Transaction()

  // Get the minimum lamports for rent exemption for a mint account
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE)

  // Get associated token account address
  const associatedTokenAccount = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    payer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )

  // Create mint account
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
  )

  // Initialize mint with 0 decimals (NFT standard)
  transaction.add(
    createInitializeMint2Instruction(
      mintKeypair.publicKey,
      0, // 0 decimals for NFT
      payer, // mint authority
      payer, // freeze authority
      TOKEN_PROGRAM_ID,
    ),
  )

  // Create associated token account
  transaction.add(
    createAssociatedTokenAccountInstruction(
      payer, // payer
      associatedTokenAccount, // associated token account
      payer, // owner
      mintKeypair.publicKey, // mint
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
  )

  // Mint 1 token to associated token account
  transaction.add(
    createMintToInstruction(
      mintKeypair.publicKey, // mint
      associatedTokenAccount, // destination
      payer, // authority
      1, // amount (1 for NFT)
      [],
      TOKEN_PROGRAM_ID,
    ),
  )

  return transaction
}

export function generateMetadataJson(
  name: string,
  description: string,
  imageUri: string,
  attributes?: Array<{ trait_type: string; value: string }>,
): NFTMetadata {
  return {
    name,
    symbol: "NFTAI",
    description,
    image: imageUri,
    attributes: attributes || [],
    properties: {
      files: [
        {
          uri: imageUri,
          type: "image/png",
        },
      ],
      category: "image",
    },
  }
}
