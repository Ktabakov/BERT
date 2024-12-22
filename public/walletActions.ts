import { 
    NetworkParams,
    Value,
    TxOutput,
    Tx,
    TxInput,
    Cip30Wallet,
    Datum,
    Assets,
    BlockfrostV0,
    UplcData,
    WalletHelper,
    MintingPolicyHash,
    AssetClass,
    Address,
    TxOutputId
  } from "@hyperionbt/helios";
  import { network, getNetworkParams } from '../common/network';
  import GameReward from '../contracts/vesting.hl'; // Ensure correct path to your contract
import { TxIn } from "@blockfrost/blockfrost-js/lib/types/api/utils/txs";
  
  const optimize = false;
 
function getTokenAmountFromUtxos(utxos: TxInput[], assetClass: AssetClass): bigint {
    let totalAmount = BigInt(0);
  
    utxos.forEach((utxo: TxInput) => {
        // Assuming utxo.value is in the right format
        const tokens = utxo.value.assets.getTokens(assetClass.mintingPolicyHash);
        tokens.forEach(([tokenName, amount]) => {
          totalAmount += BigInt(amount.value); // Add the amount to the total
          });
    });
  
    return totalAmount;
  }
  
  function calculateReward(remainingSupply: number, totalSupply: number, baseReward: number): number {
    const halvingThreshold = totalSupply * 0.1; // 10% of total supply as the halving threshold
  
    // Determine the number of halving steps
    const halvingSteps = Math.floor((totalSupply - remainingSupply) / halvingThreshold);
  
    // Calculate the reward after applying halving steps
    const reward = Math.floor(baseReward / (1 + halvingSteps));
  
    // Ensure the reward doesn't drop below 1
    return reward < 1 ? 1 : reward;
  }
  
  function pickUtxos(utxos: TxInput[], targetAmount: bigint, assetClass: AssetClass): { selected: TxInput[]; totalAmount: bigint } {
    const selected: TxInput[] = [];
    let totalAmount: bigint = 0n;
  
    // Keep track of the indices we've already picked
    const usedIndices = new Set<number>();
  
    while (totalAmount < targetAmount) {
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
  
  // Calculate the reward based on the time elapsed since contract deployment
  function calculateRewardInTime(TimeBeginContract: number): number {
    TimeBeginContract = TimeBeginContract / 1000;
    const HALVING_PERIOD: number = 2592000; // 1 month in seconds (60 * 60 * 24 * 30)
    const MAX_HALVINGS: number = 5; // Limit halvings to 5 times
    const BASE_REWARD: number = 1000; // Initial reward in tokens
  
    // Get current time in seconds
    const TimeNow: number = Math.floor(Date.now() / 1000); 
  
    // Calculate the elapsed time in seconds
    const timeElapsed: number = TimeNow - TimeBeginContract;
    // Determine halving steps based on elapsed time, but limit to MAX_HALVINGS
    let halvingSteps: number = Math.floor(timeElapsed / HALVING_PERIOD);
    halvingSteps = Math.min(halvingSteps, MAX_HALVINGS); // Cap halvings at MAX_HALVINGS
  
     // Ensure the number of halving steps doesn't exceed the maximum allowed
     const effectiveHalvings: number = Math.min(halvingSteps, MAX_HALVINGS);
    console.log("Halvings" + effectiveHalvings)
     // Directly calculate reward based on halving steps using a bit shift
     const reward: number = BASE_REWARD / (2 ** effectiveHalvings);
   
     // Return the reward, ensuring it doesn't fall below a minimum value
     return reward < 1 ? 1 : reward;
  }
  
  export function calculateCountdown(TimeBeginContract: number): number {
  
    const TimeNow: number = Math.floor(Date.now()); 
    const CYCLE_DURATION = 570 // 9 minutes and 30 seconds 
    const offsetInMs = 89680;
    const elapsedTime = TimeNow - (offsetInMs) - TimeBeginContract;
    const elapsedTimeInSeconds = elapsedTime / 1000;
    const positionInCycle = elapsedTimeInSeconds % CYCLE_DURATION;
  
    return positionInCycle;
  }
  
  // Function to filter and pick a random TxInput with sufficient value
  function pickRandomTxInputWithSufficientValue(
    txInputs: TxInput[],
    dynamicReward: bigint,
    assetClass: AssetClass
  ): { txInput: TxInput; tokenAmount: bigint, remainingUtxos: TxInput[] } {
    // Filter TxInputs that have sufficient token value
    const eligibleTxInputs = txInputs.filter((txInput: TxInput) => {
      // Extract the tokens and check their value
      const tokens = txInput.output.value.assets.getTokens(assetClass.mintingPolicyHash);
      let tokenAmount = BigInt(0);
  
      tokens.forEach(([tokenName, amount]) => {
        tokenAmount += BigInt(amount.value); // Add the amount to the token total
      });
  
      return tokenAmount >= dynamicReward; // Check if the total token value meets or exceeds the reward
    });
  
    // If there are no eligible TxInputs, throw an error
    if (eligibleTxInputs.length === 0) {
      throw new Error("No eligible TxInput found with sufficient token value.");
    }
  
    // Pick a random TxInput from the eligible list
    const randomIndex = Math.floor(Math.random() * eligibleTxInputs.length);
    const selectedTxInput = eligibleTxInputs[randomIndex];
  
    // Calculate the token value of the selected TxInput
    const tokens = selectedTxInput.output.value.assets.getTokens(assetClass.mintingPolicyHash);
    let tokenAmount = BigInt(0);
  
    tokens.forEach(([tokenName, amount]) => {
      tokenAmount += BigInt(amount.value); // Add the amount to the token total
    });
  
    const remainingUtxos = txInputs.filter((txInput) => txInput !== selectedTxInput);
  
    // Return the selected TxInput and its token value
    return { txInput: selectedTxInput, tokenAmount, remainingUtxos };
  }
  
  export async function claimTokens(walletAPI: any, setIsLoading: (val: boolean) => void, setTx: (val: {txId: string}) => void) {
    setIsLoading(true);

    if (!walletAPI) {
        throw new Error("Wallet API is not set.");
    }
    try {
      const cip30WalletAPI = new Cip30Wallet(walletAPI);

      const walletHelper = new WalletHelper(cip30WalletAPI);
      // Read in the network parameter file
      const networkParamsJson = await getNetworkParams(network);
      const networkParams = new NetworkParams(networkParamsJson);

      const policyId = "e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72";
      const name = Buffer.from("MIN", 'utf8').toString('hex');

      // const policyId = "";
      // const name = Buffer.from("", 'utf8').toString('hex');

      const mph = MintingPolicyHash.fromHex(policyId);

      const assetClass = new AssetClass({
        mph: mph, // Your policy hash
        tokenName: name// Convert to hex string
      }); 

        console.log(assetClass)

      const tokenAmount = BigInt(100);
      const tokenVal = new Value(tokenAmount);
      const utxos = await walletHelper.pickUtxos(tokenVal);

      // Get change address
      const benefitiary = await walletHelper.changeAddress;
      // Load in the vesting validator script (program)
      const gameReward = new GameReward();

      // Compile the vesting validator
      const compiledProgram = gameReward.compile(optimize);
      console.log("Wallet address: " + benefitiary)
      const scriptAddress = Address.fromHashes(compiledProgram.validatorHash)
    
      console.log(scriptAddress.toBech32());
      console.log("Script Address:" + scriptAddress)
      
      console.dir(scriptAddress, { depth: null });

      const filteredUtxos = await fetchUtxos(scriptAddress.toBech32())

      if (filteredUtxos.length == 0)
        throw new Error("No more tokens to claim. Game Over!");
   
      // const BASE_REWARD: number = 1000;  // Base reward
      // const TOTAL_SUPPLY = 10000; // Total token supply
      const CLAIM_WINDOW = 30; // 30 seconds 

      console.log("filteredUtxos" + filteredUtxos)
      const TimeBeginContract: number = Math.floor(new Date(Date.UTC(2024, 11, 8, 13, 45, 0)).getTime());
      //const remainingSupply = getTokenAmountFromUtxos(filteredUtxos, assetClass);
      const dynamicReward = calculateRewardInTime(TimeBeginContract)
      const positionInCycle = calculateCountdown(TimeBeginContract);
      console.log("positionInCycle" + positionInCycle);
      window.onerror = () => positionInCycle < CLAIM_WINDOW;
      //const dynamicReward = calculateReward(Number(remainingSupply), TOTAL_SUPPLY, BASE_REWARD);
      const testValueBenefitiary= new Assets([[assetClass, BigInt(dynamicReward)]]);

      //const result = pickRandomTxInputWithSufficientValue(filteredUtxos, BigInt(dynamicReward), assetClass);
      //console.log("randomUTXO:" + result.txInput)

      //const amountToSendBack = result.tokenAmount - BigInt(dynamicReward);
      // console.log("amountToSendBack" + amountToSendBack)
      // console.log("UtxoAmount" + result.tokenAmount)
      // console.log("The rest" + result.remainingUtxos)
      
      //console.log(filteredUtxos)
      // const remoteWallet = new RemoteWallet(false, [scriptAddress], [], txInputs);
      // const walletHelperScript = new WalletHelper(remoteWallet);
      const sortedUtxos = pickUtxos(filteredUtxos, BigInt(dynamicReward), assetClass); 
      
      sortedUtxos.selected.forEach(element => {
          console.log(element)
      });
      //const totalAmountUtxo = getTokenAmountFromUtxos(sortedUtxos.selected, assetClass);
      const amountToSendBack = BigInt(sortedUtxos.totalAmount) - BigInt(dynamicReward);

      const firstPartToSendBack = amountToSendBack / 2n; // First part is half of the total amount
      const secondPartToSendBack = amountToSendBack - firstPartToSendBack; // Second part is the remainder
      console.log("First " + firstPartToSendBack)
      console.log("Sevond " + secondPartToSendBack)
      console.log(dynamicReward	)

      const valueContract1= new Assets([[assetClass, firstPartToSendBack]]);
      const valueContract2= new Assets([[assetClass, secondPartToSendBack]]);


      const gameDatum = new gameReward.types.Datum(
        benefitiary.pubKeyHash,
      )

       // Create the vesting claim redeemer
       const redeember = (new gameReward.types.Redeemer.Claim(benefitiary.pubKeyHash))
       ._toUplcData();
    
      //console.log(filteredUtxos);
      const tx = new Tx();

      //tx.addInputs(utxos[0]);
      tx.addInputs(sortedUtxos.selected, redeember);
      tx.attachScript(compiledProgram);

      var userClaimOutput = new TxOutput(
        benefitiary,
        new Value(undefined, testValueBenefitiary));

      tx.addOutput(userClaimOutput);

    
    //Shiiit, fix. Someone could rediredt the rest of the tokens
    // const addressStr = "addr_test1qrarqhmklnhwcw3q0zm6sgm3g3l7pua0y36sql9k5ru8dsucglsked5f5yrcf9e9xgxjgmt7xk52knh8h0dgayc00arqlh7g60";
    // const address = Address.fromBech32(addressStr);
    // tx.addOutput(new TxOutput(
    //   address,
    //   new Value(undefined, testValueContract) // The amount being claimed
    // ));
    
    // Calculate total ADA in the selected script inputs
    let totalAdaInInputs = BigInt(0);
    sortedUtxos.selected.forEach(utxo => {
        totalAdaInInputs += BigInt(utxo.output.value.lovelace);
    });

    // Distribute ADA equally (or as required) among script outputs
    const adaPerScriptOutput = totalAdaInInputs / 2n; // Assuming two script outputs

    if (amountToSendBack != BigInt(0)){
      var scriptUtxo1 =new TxOutput(
        scriptAddress,
        new Value(adaPerScriptOutput, valueContract1),  // Remaining treasury tokens
        Datum.inline(gameDatum) // Contract requires datum
       );

       tx.addOutput(scriptUtxo1);

      var scriptUtxo2 = new TxOutput(
        scriptAddress,
        new Value(totalAdaInInputs - adaPerScriptOutput, valueContract2),  // Remaining treasury tokens
        Datum.inline(gameDatum) // Contract requires datum
       );
    
       tx.addOutput(scriptUtxo2);
    }  

      //var inputFees = await walletHelper.pickUtxos(new Value(tokenAmountFees));
      
      //tx.addInputs(inputFees[0]);
      console.log("We attatched everything!")

      await tx.finalize(networkParams, benefitiary, utxos[1]);

      // Sign the unsigned tx to get the witness
      const signatures = await cip30WalletAPI.signTx(tx);
      tx.addSignatures(signatures);

      const txHash = await cip30WalletAPI.submitTx(tx);

      setTx({ txId: txHash.hex });
      setIsLoading(false);

    } catch (err) {
        setIsLoading(false);
        console.error("submit tx failed", err);
        throw err; 
    }
  }
  
  export async function send(walletAPI: any, setIsLoading: (val: boolean) => void, setTx: (val: {txId: string}) => void) {
    setIsLoading(true);

    if (!walletAPI) {
      throw console.error("walletAPI is not set");
    }
    try {
      const cip30WalletAPI = new Cip30Wallet(walletAPI);
      // const blockfrost = new BlockFrostIPFS({
      //   network: network,
      //   projectId: "preprodJExO0MAMRgfpXz9Il4IqB2u9ddoylZBT",
      // });
      console.log("gmmm")

      const walletHelper = new WalletHelper(cip30WalletAPI);

      const policyId = "e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72";
      const name = Buffer.from("MIN", 'utf8').toString('hex');

      // const policyId = "";
      // const name = Buffer.from("", 'utf8').toString('hex');

      const mph = MintingPolicyHash.fromHex(policyId);

      const assetClass = new AssetClass({
        mph: mph, // Your policy hash
        tokenName: name// Convert to hex string
      }); 

        console.log(assetClass)

      const minAda : number = 1_000_000; // minimum lovelace to send
      const minAdaVal = new Value(BigInt(minAda));

      //  const benefitiaryValue = new Value(BigInt(10000), new Assets([
      //   [mph, [[name, BigInt(10000)]]]
      // ]))


      const testValueScript = new Assets([[assetClass, BigInt(10000)]]);


      // Get wallet UTXOs
      const utxos = await walletHelper.pickUtxos(new Value(undefined, testValueScript));
      console.log(utxos);

      // Get change address
      const benefitiary = await walletHelper.changeAddress;
      // Load in the vesting validator script (program)
      const gameReward = new GameReward();

      // Compile the vesting validator
      const compiledProgram = gameReward.compile(optimize);
      console.log("Wallet address: " + benefitiary)
      const scriptAddress = Address.fromHashes(compiledProgram.validatorHash)
    
        //remove
      console.log(scriptAddress.toBech32());
      console.log("Script Address:" + scriptAddress)
      
      // Construct the vesting datum
      const gameDatum = new gameReward.types.Datum(
        benefitiary.pubKeyHash,
      )
    
    //const redeember = (new gameReward.types.Redeemer.Claim())._toUplcData();
    
      const tx = new Tx();
      tx.addInputs(utxos[0]);
      tx.addOutput(new TxOutput(
        scriptAddress,
        new Value(undefined, testValueScript),
        Datum.inline(gameDatum)
      ));

      // tx.addOutput(new TxOutput(
      //   benefitiary,
      //   minAdaVal,
      // ));
    
      console.log("We attatched everything!")

      // Read in the network parameter file
      const networkParamsJson = await getNetworkParams(network);
      const networkParams = new NetworkParams(networkParamsJson);

      // Send any change back to the buyer
      await tx.finalize(networkParams, benefitiary, utxos[1]);

      // Sign the unsigned tx to get the witness
      const signatures = await cip30WalletAPI.signTx(tx);
      tx.addSignatures(signatures);

      console.log("signed");
      // Submit the signed tx
      const txHash = await cip30WalletAPI.submitTx(tx);

      setTx({ txId: txHash.hex });
      setIsLoading(false);

    } catch (err) {
        setIsLoading(false);
        throw console.error("submit tx failed", err);
    }
  }
    
  async function fetchUtxos(scriptAddress: string): Promise<TxInput[]> {
    const response = await fetch("http://localhost:3001/api/getUtxos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scriptAddress }),
    });
  
    const data = await response.json(); // Raw JSON array from backend
  
    // `Convert JSON back to TxInput objects
    const filteredUtxos = data.map((utxo: any) => TxInput.fromFullCbor(utxo));

    return filteredUtxos;
  }
  