import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import { 
  BlockfrostV0,
  Address,
  AssetClass,
  MintingPolicyHash,
  TxInput,
  Tx,
  TxOutput,
  Datum,
  Assets,
  Value,
  Redeemer,
  PrivateKey,
  NetworkParams
} from '@hyperionbt/helios';

// Load environment variables
dotenv.config();

const API_KEY = process.env.API_KEY;
const NETWORK = process.env.NETWORK;
const PRIVATE_KEY_HEX = process.env.PRIVATE_KEY_HEX;

if (!API_KEY || !NETWORK || !PRIVATE_KEY_HEX) {
  throw new Error("API_KEY, NETWORK, and PRIVATE_KEY_HEX must be set in .env");
}

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Your policy and asset setup
const policyId = "e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72";
const name = Buffer.from("MIN", 'utf8').toString('hex');
const mph = MintingPolicyHash.fromHex(policyId);
const assetClass = new AssetClass({
  mph: mph,
  tokenName: name
});

// Example: Load network parameters
const networkParamsJson = fs.readFileSync('./networkParams.json', 'utf8');
const networkParams = new NetworkParams(JSON.parse(networkParamsJson));

// Load or compile your Helios script beforehand
// Replace this with actual compiled code
// e.g. const compiledProgram = Program.new(...);
const compiledProgram = /* Your compiled Helios program */ null;

// Example beneficiary address (replace with actual)
const beneficiaryAddressStr = "addr_test1vz..."; 
const beneficiary = Address.fromBech32(beneficiaryAddressStr);

// Endpoint to submit a transaction
app.post('/api/submitTransaction', async (req, res) => {
  try {
    const { scriptAddress: scriptAddressStr } = req.body;
    if (typeof scriptAddressStr !== 'string') {
      return res.status(400).json({ error: 'scriptAddress is required and must be a string' });
    }

    const scriptAddress = Address.fromBech32(scriptAddressStr);
    const bfrost = new BlockfrostV0(NETWORK, API_KEY);

    // Get UTXOs from the script address
    const txInputs: TxInput[] = await bfrost.getUtxos(scriptAddress);

    // Filter UTXOs containing the token
    const filtered = txInputs.filter((x: TxInput) => x.value.assets.getTokens(assetClass.mintingPolicyHash));
    if (filtered.length === 0) {
      return res.status(400).json({ error: 'No suitable UTXOs found at the script address' });
    }

    // For simplicity, pick the first UTXO
    const chosenUtxo = filtered[0];

    // Construct the transaction
    const tx = new Tx();
    const redeemer = (new (Redeemer as any).Claim(beneficiary.pubKeyHash))._toUplcData();
    tx.addInputs([chosenUtxo], redeemer);
    tx.attachScript(compiledProgram);

    // Decide how much to send to beneficiary
    const dynamicReward = 100n; 
    const valueForBeneficiary = new Assets([[assetClass, dynamicReward]]);
    tx.addOutput(new TxOutput(beneficiary, new Value(undefined, valueForBeneficiary)));

    // Finalize (no extra UTXOs needed for this example)
    await tx.finalize(networkParams, beneficiary);

    // Sign the transaction with private key
    const privateKey = PrivateKey.fromHex(PRIVATE_KEY_HEX);
    tx.sign(privateKey);

    // Submit the transaction
    const txHash = await bfrost.submitTx(tx);

    return res.json({ txId: txHash.hex });
  } catch (err: any) {
    console.error("Error submitting transaction:", err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Just an example endpoint to fetch UTXOs from backend
app.post('/api/getUtxos', async (req, res) => {
  try {
    const { scriptAddress } = req.body;
    if (typeof scriptAddress !== 'string') {
      return res.status(400).json({ error: 'scriptAddress is required and must be a string' });
    }

    const bechAddress = Address.fromBech32(scriptAddress);
    const bfrost = new BlockfrostV0(NETWORK, API_KEY);
    const txInputs = await bfrost.getUtxos(bechAddress);

    // Return raw data or simplified structure, no need to fromData/fromCbor on frontend
    // Just return what you need. For instance:
    const simplifiedUtxos = txInputs.map((utxo) => ({
      txId: utxo.txId.hex,
      index: utxo.outputIndex,
      lovelace: utxo.value.lovelace,
      assets: utxo.value.assets.dump() // a raw dump of assets
    }));

    res.json(simplifiedUtxos);
  } catch (err: any) {
    console.error("Error fetching UTXOs:", err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
