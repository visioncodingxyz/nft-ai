// Mock Solana types and functions for browser environment
export interface Connection {
  getBalance: (publicKey: any) => Promise<number>
  getLatestBlockhash: () => Promise<{ blockhash: string }>
  sendRawTransaction: (transaction: any) => Promise<string>
  confirmTransaction: (signature: string, commitment?: string) => Promise<any>
  getTransaction: (signature: string, options?: any) => Promise<any>
  requestAirdrop: (publicKey: any, amount: number) => Promise<string>
}

export class MockConnection implements Connection {
  async getBalance() {
    return 1000000000 // 1 SOL in lamports
  }
  async getLatestBlockhash() {
    return { blockhash: "mock-blockhash" }
  }
  async sendRawTransaction() {
    return "mock-signature"
  }
  async confirmTransaction() {
    return { value: { err: null } }
  }
  async getTransaction() {
    return null
  }
  async requestAirdrop() {
    return "mock-airdrop-signature"
  }
}

export class PublicKey {
  constructor(public value: string) {}
  toString() {
    return this.value
  }
}

export class Transaction {
  recentBlockhash?: string
  feePayer?: PublicKey
  instructions: any[] = []

  add(instruction: any) {
    this.instructions.push(instruction)
    return this
  }

  serialize() {
    return new Uint8Array()
  }
}

export const LAMPORTS_PER_SOL = 1000000000

// Solana network configuration
const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"

export const connection = new MockConnection()

// Get Solana connection
export function getSolanaConnection(): Connection {
  return connection
}

// Convert SOL to lamports
export function solToLamports(sol: number): number {
  return sol * LAMPORTS_PER_SOL
}

// Convert lamports to SOL
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL
}

// Get wallet balance
export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const balance = await connection.getBalance(walletAddress)
    return lamportsToSol(balance)
  } catch (error) {
    console.error("Failed to get wallet balance:", error)
    return 0
  }
}

// Create NFT transfer transaction
export async function createNFTTransferTransaction(
  mintAddress: string,
  fromWallet: string,
  toWallet: string,
): Promise<Transaction> {
  const transaction = new Transaction()
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = new PublicKey(fromWallet)
  return transaction
}

// Create SOL payment transaction
export async function createPaymentTransaction(
  fromWallet: string,
  toWallet: string,
  amount: number,
): Promise<Transaction> {
  const transaction = new Transaction()
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = new PublicKey(fromWallet)
  return transaction
}

// Verify transaction
export async function verifyTransaction(signature: string): Promise<boolean> {
  try {
    const confirmation = await connection.confirmTransaction(signature, "confirmed")
    return !confirmation.value.err
  } catch (error) {
    console.error("Failed to verify transaction:", error)
    return false
  }
}

// Get transaction details
export async function getTransactionDetails(signature: string) {
  try {
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    })
    return transaction
  } catch (error) {
    console.error("Failed to get transaction details:", error)
    return null
  }
}

// Airdrop SOL (devnet only)
export async function airdropSol(walletAddress: string, amount: number): Promise<string | null> {
  if (SOLANA_NETWORK !== "devnet") {
    throw new Error("Airdrop only available on devnet")
  }

  try {
    const signature = await connection.requestAirdrop(walletAddress, solToLamports(amount))
    await connection.confirmTransaction(signature)
    return signature
  } catch (error) {
    console.error("Failed to airdrop SOL:", error)
    return null
  }
}
