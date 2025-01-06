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
    UplcProgram,
    Redeemer,
    AssetClass,
    PubKeyHash,
    Address,
    ConstrData,
    NativeScript,
    ByteArrayData,
    hexToBytes,
  } from "@hyperionbt/helios";
  import { network, getNetworkParams } from '../common/network';
  import GameReward from '../contracts/GameReward.hl'; // Ensure correct path to your contract
  
  const optimize = false;
  
  export function calculateCountdown(): number {
  
    const TimeBeginContract = 1736073600000;

    const TimeNow: number = Math.floor(Date.now()); 
    const CYCLE_DURATION = 600 // 10 minutes 
    const offsetInMs = 89680;
    const elapsedTime = TimeNow - (offsetInMs) - TimeBeginContract;
    const elapsedTimeInSeconds = elapsedTime / 1000;
    const positionInCycle = elapsedTimeInSeconds % CYCLE_DURATION;
  
    return positionInCycle;
  } 
  
  // The Helios contract says: struct Datum { benefitiary: PubKeyHash }
  export interface GameDatum {
    benefitiary: PubKeyHash; // The pubKeyHash as a hex string
  }

  // The Helios contract says: enum Redeemer { Cancel, Claim { recepiant: PubKeyHash } }
  export interface GameRedeemerClaim {
    __tag: "Claim";
    recepiant: string; // The same pubKeyHash in hex
  }
  import GAME_REWARD_CBOR_JSON from '../contracts/GameRewardCbor1.json'; // { cborHex: "4e4d010000..." }

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

      const policyId = "3a8d42fbc0e40b1c72d3ba204651ffbc3e4d4afb116605e6599523d2";
      const name = Buffer.from("BERT", 'utf8').toString('hex');

      const mph = MintingPolicyHash.fromHex(policyId);

      const assetClass = new AssetClass({
        mph: mph, 
        tokenName: name
      }); 

        console.log(assetClass)

      const utxos = await walletHelper.getUtxos();
      console.log("utxos" + utxos);

      // Get change address
      const benefitiary = await walletHelper.changeAddress;
      // Load in the vesting validator script (program)
      
      const cborHex = GAME_REWARD_CBOR_JSON.cborHex; 
      //const compiledProgram = Program.new(cborHex); 
      //const uplcProgram = new NativeScript(cborHex as unknown as number);
      const uplcProgram = UplcProgram.fromCbor(cborHex);

      //console.log("compiledProgram" + compiledProgram);
      console.log("benefitiary.pubKeyHash?.hex!)" + benefitiary.pubKeyHash?.hex!)

    
      //const gameReward = new GameReward();

      // Compile the vesting validator
      //const compiledProgram = gameReward.compile(optimize);
      console.log("Wallet address: " + benefitiary)
      const scriptAddress = Address.fromBech32("addr1w8ts9k76vfj5fx856s0ytzgr92q5nsdn4kzm2dgn07ndzncq08zq9")
    
      console.log(scriptAddress.toBech32());
      console.log("Script Address:" + scriptAddress)
      
      console.dir(scriptAddress, { depth: null });

      const datumObject: GameDatum = {
        benefitiary: benefitiary.pubKeyHash!
      };

      console.log("benefitiary.pubKeyHash!.hex", benefitiary.pubKeyHash!.hex)
      const gameDatum = createGameDatum("b9e2c61ce129745ee65cde82019ed978ee9509bc01278381f16cf41a");
      console.log("MethodDatum", gameDatum)
      console.log("Datum",  Datum.inline(
        new ConstrData(0, [ new ByteArrayData(hexToBytes(benefitiary.pubKeyHash?.hex!)) ])
      ))
      console.log("Datum2",new ConstrData(0, [ new ByteArrayData(hexToBytes(benefitiary.pubKeyHash?.hex!)) ]))
      // const gameDatum = new gameReward.types.Datum(
      //   benefitiary.pubKeyHash,
      // )

       // Create the vesting claim redeemer
      //  const redeember = (new gameReward.types.Redeemer.Claim(benefitiary.pubKeyHash))
      //  ._toUplcData();

      const claimRedeemer = createClaimRedeemer(benefitiary.pubKeyHash!.hex);
      console.log("claimRedeemerData" + claimRedeemer)
      console.log("claimRedeemer" + claimRedeemer)
      //console.log(filteredUtxos);
      const tx = new Tx();

      const sortedUtxos = await fetchUtxos(scriptAddress.toBech32())

      const CLAIM_WINDOW = 20; // 20 seconds 

      const positionInCycle = calculateCountdown();
      console.log("positionInCycle" + positionInCycle);
      window.onerror = () => positionInCycle < CLAIM_WINDOW;
      //const dynamicReward = calculateReward(Number(remainingSupply), TOTAL_SUPPLY, BASE_REWARD);
      const testValueBenefitiary= new Assets([[assetClass, BigInt(sortedUtxos.dynamicReward)]]);
      
      //const totalAmountUtxo = getTokenAmountFromUtxos(sortedUtxos.selected, assetClass);
      const amountToSendBack = BigInt(sortedUtxos.totalAmount) - BigInt(sortedUtxos.dynamicReward);

      const firstPartToSendBack = amountToSendBack / 2n; // First part is half of the total amount
      const secondPartToSendBack = amountToSendBack - firstPartToSendBack; // Second part is the remainder
      console.log("First " + firstPartToSendBack)
      console.log("Sevond " + secondPartToSendBack)
      console.log(sortedUtxos.dynamicReward)

      const valueContract1= new Assets([[assetClass, firstPartToSendBack]]);
      const valueContract2= new Assets([[assetClass, secondPartToSendBack]]);

      //tx.addInputs(utxos[0]);
      tx.addInputs(sortedUtxos.selected, claimRedeemer.data);
      tx.attachScript(uplcProgram);

      var userClaimOutput = new TxOutput(
        benefitiary,
        new Value(undefined, testValueBenefitiary));

      tx.addOutput(userClaimOutput)

    
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
    const adaPerScriptOutput = totalAdaInInputs / 2n; // Assuming two script outputs\

    if (amountToSendBack != BigInt(0)){
      var scriptUtxo1 =new TxOutput(
        scriptAddress,
        new Value(adaPerScriptOutput, valueContract1),  // Remaining treasury tokens
        gameDatum
       );

       tx.addOutput(scriptUtxo1);

      var scriptUtxo2 = new TxOutput(
        scriptAddress,
        new Value(totalAdaInInputs - adaPerScriptOutput, valueContract2),  // Remaining treasury tokens
        gameDatum
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

      const policyId = "3a8d42fbc0e40b1c72d3ba204651ffbc3e4d4afb116605e6599523d2";
      const name = Buffer.from("BERT", 'utf8').toString('hex');

      const mph = MintingPolicyHash.fromHex(policyId);

      const assetClass = new AssetClass({
        mph: mph, // Your policy hash
        tokenName: name// Convert to hex string
      }); 

        console.log(assetClass)

      const minAda : number = 1_000_000; // minimum lovelace to send
      const minAdaVal = new Value(BigInt(minAda));

      const testValueScript = new Assets([[assetClass, BigInt(125550)]]);

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
    
  async function fetchUtxos(scriptAddress: string): Promise<{ selected: TxInput[]; totalAmount: bigint, dynamicReward: bigint }> {
    const response = await fetch(`/api/getUtxos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scriptAddress}),
    });
  
    const data = await response.json(); // Raw JSON array from backend
  
    // `Convert JSON back to TxInput objects
    const selectedUtxos = data.selected.map((utxo: any) => TxInput.fromFullCbor(utxo));
    const dynamicReward: bigint = BigInt(data.dynamicReward);
    const totalAmount: bigint = BigInt(data.totalAmount);
    console.log("selectedUtxos"+ selectedUtxos);
    console.log("dynamicReward" + dynamicReward);
    console.log("totalAmount"+ totalAmount);

    return {
      selected: selectedUtxos,
      totalAmount: totalAmount,
      dynamicReward: dynamicReward,
    };
  }
  

  function createClaimRedeemer(pubKeyHashHex: string): Redeemer {
    const bytes = hexToBytes(pubKeyHashHex);
    const constrData = new ConstrData(1, [new ByteArrayData(bytes)]);
    return new Redeemer(constrData);
  }
  
  function createGameDatum(benefitiaryHashHex: string): Datum {
    const bytes = hexToBytes(benefitiaryHashHex);
    const constrData = new ConstrData(0, [new ByteArrayData(bytes)]);
    return Datum.inline(constrData);
  }
