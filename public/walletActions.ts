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
  import GameReward from '../contracts/GameReward.hl'; 

  const optimize = false;
  
  export function calculateCountdown(): number {
  
    const TimeBeginContract = 1736073600000;

    const TimeNow: number = Math.floor(Date.now()); 
    const CYCLE_DURATION = 600 
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

      const networkParamsJson = await getNetworkParams(network);
      const networkParams = new NetworkParams(networkParamsJson);

      const policyId = "5b9006e5051296968c46a3e9206f2f02c8157ff041871290960d6adf";
      const name = Buffer.from("BERT", 'utf8').toString('hex');

      const mph = MintingPolicyHash.fromHex(policyId);

      const assetClass = new AssetClass({
        mph: mph, 
        tokenName: name
      }); 

        console.log(assetClass)

      const utxos = await walletHelper.getUtxos();

      const benefitiary = await walletHelper.changeAddress;
 
      const gameReward = new GameReward();
      const compiledProgram = gameReward.compile(optimize);
      const scriptAddress = Address.fromHashes(compiledProgram.validatorHash, null, false)
    
      console.log(scriptAddress.toBech32());      
      console.dir(scriptAddress, { depth: null });

        const gameDatum = new gameReward.types.Datum(
        benefitiary.pubKeyHash,
      )

      const claimRedeemer = (new gameReward.types.Redeemer.Claim(benefitiary.pubKeyHash))
      ._toUplcData();
      const tx = new Tx();

      const sortedUtxos = await fetchUtxos(scriptAddress.toBech32())
      const CLAIM_WINDOW = 20; // 20 seconds 

      const positionInCycle = calculateCountdown();
      window.onerror = () => positionInCycle < CLAIM_WINDOW;
      const testValueBenefitiary= new Assets([[assetClass, BigInt(sortedUtxos.dynamicReward)]]);
      
      const amountToSendBack = BigInt(sortedUtxos.totalAmount) - BigInt(sortedUtxos.dynamicReward);

      const firstPartToSendBack = amountToSendBack / 2n; 
      const secondPartToSendBack = amountToSendBack - firstPartToSendBack; 

      const valueContract1= new Assets([[assetClass, firstPartToSendBack]]);
      const valueContract2= new Assets([[assetClass, secondPartToSendBack]]);

      tx.addInputs(sortedUtxos.selected, claimRedeemer);
      tx.attachScript(compiledProgram);

      var userClaimOutput = new TxOutput(
        benefitiary,
        new Value(undefined, testValueBenefitiary));

      tx.addOutput(userClaimOutput)

    let totalAdaInInputs = BigInt(0);
    sortedUtxos.selected.forEach(utxo => {
        totalAdaInInputs += BigInt(utxo.output.value.lovelace);
    });

    const adaPerScriptOutput = totalAdaInInputs / 2n; 

    if (amountToSendBack != BigInt(0)){
      var scriptUtxo1 =new TxOutput(
        scriptAddress,
        new Value(adaPerScriptOutput, valueContract1),  
        Datum.inline(gameDatum)
       );

       tx.addOutput(scriptUtxo1);

      var scriptUtxo2 = new TxOutput(
        scriptAddress,
        new Value(totalAdaInInputs - adaPerScriptOutput, valueContract2),  
        Datum.inline(gameDatum)
       );
    
       tx.addOutput(scriptUtxo2);
    }  
      
   
      await tx.finalize(networkParams, benefitiary, utxos);

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
  

  async function fetchUtxos(scriptAddress: string): Promise<{ selected: TxInput[]; totalAmount: bigint, dynamicReward: bigint }> {
    const response = await fetch(`/api/getUtxos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scriptAddress}),
    });
  
    const data = await response.json(); 
  
    const selectedUtxos = data.selected.map((utxo: any) => TxInput.fromFullCbor(utxo));
    const dynamicReward: bigint = BigInt(data.dynamicReward);
    const totalAmount: bigint = BigInt(data.totalAmount);

    return {
      selected: selectedUtxos,
      totalAmount: totalAmount,
      dynamicReward: dynamicReward,
    };
  }
