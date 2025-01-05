import dotenv from 'dotenv';
import express from 'express';
import { BlockfrostV0, Address, AssetClass, MintingPolicyHash } from '@hyperionbt/helios';

dotenv.config();

const app = express();

const API_KEY = process.env.API_KEY;
const NETWORK = process.env.NETWORK;

  const policyId = "a3879594925e2ab170ed0c34204d84765411ad23e43e98771dd5a6d2";
  const name = Buffer.from("BERT", 'utf8').toString('hex');


  const mph = MintingPolicyHash.fromHex(policyId);

  const assetClass = new AssetClass({
    mph: mph, 
    tokenName: name
  }); 


// Middleware to parse JSON
app.use(express.json());

app.post('/api/getUtxos', async (req, res) => {
    console.log('POST /api/getUtxos called');

  try {
    const { scriptAddress } = req.body;
    console.log("address is " + scriptAddress);
    const reward = calculateRewardInTime();

    var bechAddress = Address.fromBech32(scriptAddress);

    // Instantiate Blockfrost inside the backend
    const bfrost = new BlockfrostV0(NETWORK, API_KEY);
    const txInputs = await bfrost.getUtxos(bechAddress);
    const filtered = txInputs.filter(x => x.value.assets.getTokens(assetClass.mintingPolicyHash));
    const { selected, totalAmount } = pickUtxos(filtered, reward, assetClass);

    const cborArray = selected.map((txInput) => txInput.toFullCbor());

    res.json({
      selected: cborArray,
      totalAmount: totalAmount.toString(),
      dynamicReward: reward
    });

  } catch (err) {
    console.error("Error fetching UTXOs:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log("Backend server listening on port ${PORT}");
});


function pickUtxos(utxos, targetAmount, assetClass) {
  const selected = [];
  let totalAmount = 0n;

  // Keep track of the indices we've already picked to avoid duplicates
  const usedIndices = new Set();

  while (totalAmount < targetAmount) {
    // If all UTXOs have been used and targetAmount not reached
    if (usedIndices.size === utxos.length) {
      break; // Exit the loop
    }

    // Generate a random index within the bounds of the UTXOs array
    const randomIndex = Math.floor(Math.random() * utxos.length);

    // If we've already selected this index, skip it
    if (usedIndices.has(randomIndex)) {
      continue;
    }

    // Mark the index as used
    usedIndices.add(randomIndex);

    // Add the UTXO to the selected list
    const selectedUtxo = utxos[randomIndex];
    selected.push(selectedUtxo);

    // Get the amount of the specified asset in this UTXO
    const tokens = selectedUtxo.value.assets.getTokens(assetClass.mintingPolicyHash);

    tokens.forEach(([tokenName, amount]) => {
      totalAmount += BigInt(amount.value); // Add the amount to the total
    });
  }

  return {
    selected,
    totalAmount,
  };
}

function calculateRewardInTime() {
  // Define the contract start time (UTC)
  // Note: Months are 0-based in JavaScript Date.UTC (0 = January, 11 = December)
  const TimeBeginContract = 1736073600000 / 1000;
  console.log("TimeBeginContract:", TimeBeginContract);

  const HALVING_PERIOD = 7776000; // 3 months in seconds
  const MAX_HALVINGS = 2; // Limit halvings to 2 times
  const BASE_REWARD = 10000; // Initial reward in tokens

  // Get current time in seconds
  const TimeNow = Math.floor(Date.now() / 1000);

  // Calculate the elapsed time in seconds
  const timeElapsed = TimeNow - TimeBeginContract;

  // Determine halving steps based on elapsed time, but limit to MAX_HALVINGS
  let halvingSteps = Math.floor(timeElapsed / HALVING_PERIOD);
  halvingSteps = Math.min(halvingSteps, MAX_HALVINGS); // Cap halvings at MAX_HALVINGS

  console.log("Halvings:", halvingSteps);

  // Calculate reward based on halving steps
  const reward = BASE_REWARD / (2 ** halvingSteps);

  // Ensure the reward doesn't fall below a minimum value
  return reward < 1 ? 1 : reward;
}
