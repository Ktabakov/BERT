import { 
    NetworkParams,
    Value,
    TxOutput,
    Tx,
    TxInput,
    Cip30Wallet,
    Datum,
    Assets,
    WalletHelper,
    MintingPolicyHash,
    AssetClass,
    Address,
  } from "@hyperionbt/helios";
  import { network, getNetworkParams } from '../common/network';
  import GameReward from '../contracts/GameReward.hl'; // Ensure correct path to your contract
  
  const optimize = false;
  
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
    const HALVING_PERIOD: number = 7776000; // 3 months in seconds 
    const MAX_HALVINGS: number = 2; // Limit halvings to 2 times
    const BASE_REWARD: number = 10000; // Initial reward in tokens
  
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
    const CYCLE_DURATION = 580 // 9 minutes 
    const offsetInMs = 89680;
    const elapsedTime = TimeNow - (offsetInMs) - TimeBeginContract;
    const elapsedTimeInSeconds = elapsedTime / 1000;
    const positionInCycle = elapsedTimeInSeconds % CYCLE_DURATION;
  
    return positionInCycle;
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

      // const tokenAmount = BigInt(3000000);
      // const tokenVal = new Value(tokenAmount);
      const utxos = await walletHelper.getUtxos();
      console.log("utxos" + utxos);

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
   
      // const TOTAL_SUPPLY = 10000; // Total token supply
      const CLAIM_WINDOW = 20; // 20 seconds 

      console.log("filteredUtxos" + filteredUtxos)
      const TimeBeginContract = Math.floor(new Date(Date.UTC(2024, 11, 25, 13, 45, 0)).getTime());
      console.log("TimeBeginContract" + TimeBeginContract)
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

      

      await tx.finalize(networkParams, benefitiary, utxos);
      console.log("dali finalizirahme?")
      // Sign the unsigned tx to get the witness
      const signatures = await cip30WalletAPI.signTx(tx);
      tx.addSignatures(signatures);
      console.log("Dali q signirahme?")

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


      const testValueScript = new Assets([[assetClass, BigInt(325500)]]);


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
    const response = await fetch(`/api/getUtxos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scriptAddress }),
    });
  
    const data = await response.json(); // Raw JSON array from backend
  
    // `Convert JSON back to TxInput objects
    const filteredUtxos = data.map((utxo: any) => TxInput.fromFullCbor(utxo));

    return filteredUtxos;
  }
  