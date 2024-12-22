import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import { BlockfrostV0, Address, AssetClass, MintingPolicyHash } from '@hyperionbt/helios';

dotenv.config();

const app = express();

const API_KEY = process.env.API_KEY;
const NETWORK = process.env.NETWORK;

app.use(cors({
    origin: 'http://localhost:3000',
    allowedHeaders: ['Content-Type']    // Allow headers needed for your request
  }));

  const policyId = "e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72";
  const name = Buffer.from("MIN", 'utf8').toString('hex');

  // const policyId = "";
  // const name = Buffer.from("", 'utf8').toString('hex');

  const mph = MintingPolicyHash.fromHex(policyId);

  const assetClass = new AssetClass({
    mph: mph, // Your policy hash
    tokenName: name// Convert to hex string
  }); 


// Middleware to parse JSON
app.use(express.json());

app.post('/api/getUtxos', async (req, res) => {
    console.log('POST /api/getUtxos called');

  try {
    const { scriptAddress } = req.body;
    console.log("address is " + scriptAddress);
    // if (!data) {
    //     return res.status(400).json({ error: 'scriptAddress is required' });
    // }

    var bechAddress = Address.fromBech32(scriptAddress);

    // Instantiate Blockfrost inside the backend
    const bfrost = new BlockfrostV0(NETWORK, API_KEY);
    const txInputs = await bfrost.getUtxos(bechAddress);
    const filtered = txInputs.filter(x => x.value.assets.getTokens(assetClass.mintingPolicyHash));
    const cborArray = filtered.map((txInput) => txInput.toFullCbor());

    res.json(cborArray);
  } catch (err) {
    console.error("Error fetching UTXOs:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log("Backend server listening on port ${PORT}");
});

