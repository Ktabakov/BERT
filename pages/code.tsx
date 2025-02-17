import React, { useState, useEffect } from "react";
import Head from "next/head";
import NavBar from "../components/NavBar";
import { claimTokens, calculateCountdown } from "../public/walletActions";
import WalletConnector from "../components/WalletConnector";
import ErrorPopup from "../components/ErrorPopup";
import InstructionsWindow from "../components/InstructionsWindow";
import SuccessNotification from "../components/SuccessNotification";
// import network if needed: import { network } from '../common/network';

const CLAIM_WINDOW = 20; // 20 seconds claim window 
const CYCLE_DURATION = 600; // 600 seconds cycle duration

const heliosCode = 
`spending GameReward
/* 
 Create a datum with the benefitiary PubKeyHash that will be included 
 into each UTXO locked at this script address.
*/
struct Datum {
    benefitiary: PubKeyHash
}

/*
 The vesting contract can be either canceled by the benefitiary
 or claimed by the beneficiary
 */
enum Redeemer {
    Cancel
    Claim {
        recepiant: PubKeyHash
    }
}

const TOKEN_POLICY_ID: MintingPolicyHash = MintingPolicyHash::new(#5b9006e5051296968c46a3e9206f2f02c8157ff041871290960d6adf)
   
const HALVING_PERIOD: Int = 7776000  // 3 months in seconds
const MAX_HALVINGS: Int = 2
const BASE_REWARD: Int = 10000  // Initial reward in tokens

func calculate_reward(current_time: Time) -> Int {
    // Start contract at 
    TimeBeginContract: Time = Time::new(1736073600000);  

    // Calculate time elapsed in seconds
    time_elapsed: Duration = current_time - TimeBeginContract;
    time_elapsed_in_seconds: Int = time_elapsed / Duration::new(1_000);  // Convert to seconds

    // Calculate the number of halving periods (each period is 1 month)
    halving_steps: Int = time_elapsed_in_seconds / HALVING_PERIOD;
    print(current_time.show());
    // Ensure the number of halvings doesn't exceed the maximum allowed
    halving_steps = if (halving_steps > MAX_HALVINGS) { MAX_HALVINGS } else { halving_steps };
    print(halving_steps.show());
    // Calculate reward using simple multiplication and division
    if (halving_steps == 0) {
        BASE_REWARD
    } else if (halving_steps == 1) {
        BASE_REWARD / 2
    } else if (halving_steps == 2) {
        BASE_REWARD / 4
    } else {
        BASE_REWARD / 4
    }

}

const CLAIM_WINDOW: Int = 20 
const CYCLE_DURATION: Int = 600 

func IsClaimWindow(current_time: Time) -> Bool {
    // Start contract 
    TimeBeginContract: Time = Time::new(1736073600000);  

     // Calculate the offset from the deployment start
     elapsed_time: Duration = current_time - TimeBeginContract;
     time_elapsed_in_seconds: Int = elapsed_time / Duration::new(1_000);  // Convert to seconds

 // Determine the position within the current cycle
    position_in_cycle: Int = time_elapsed_in_seconds % CYCLE_DURATION;
    in_claim_window: Bool = position_in_cycle <= CLAIM_WINDOW;
    print(position_in_cycle.show());
    in_claim_window
}

// Define the main validator function
func main(datum: Datum, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
    tx: Tx = ctx.tx;

        // AssetClass for the treasury tokens
        asset_class: AssetClass = AssetClass::new(
            TOKEN_POLICY_ID,  
            "BERT".encode_utf8()
        );

       validator_hash: ValidatorHash = ctx.get_current_validator_hash();

        // Get all outputs locked at the script address
       script_outputs: []TxOutput = tx.outputs_locked_by(validator_hash);

          total_tokens_begin: Int = tx.inputs.fold(
            (sum: Int, input: TxInput) -> Int {
              
                sum + input.output.value.get_safe(asset_class)
            },
            0
        );

            // Sum up all tokens in these outputs
            total_tokens_in_script: Int = script_outputs.fold(
                (sum: Int, output: TxOutput) -> Int {
                sum + output.value.get_safe(asset_class)
                },
               0 // Initial sum
            );
            
        // Calculate total ADA in script inputs
        total_ada_begin: Int = tx.inputs.fold((sum: Int, input: TxInput) -> Int {
            if (input.output.address.credential.switch {
                vh_credential: Validator => vh_credential.hash == validator_hash,
                _ => false
            }) {
                sum + input.output.value.get_lovelace()
            } else {
                sum
            }
        }, 0);

        // Calculate total ADA in script outputs
        total_ada_in_script: Int = tx.outputs.fold((sum: Int, output: TxOutput) -> Int {
            if (output.address.credential.switch {
                vh_credential: Validator => vh_credential.hash == validator_hash,
                _ => false
            }) {
                sum + output.value.get_lovelace()
            } else {
                sum
            }
        }, 0);

    current_time: Time = tx.time_range.start; 
    // Calculate dynamic reward based on the remaining supply
    dynamic_reward: Int = calculate_reward(current_time);

    isClaimWindow: Bool = IsClaimWindow(current_time);

     //expected_value: Value = Value::new(asset_class, EXPECTED_AMOUNT);
    // Depending on the redeemer provided in the transaction, process accordingly.
    redeemer.switch {
        Cancel => {
            // Tx must be signed by pkh in datum
            tx.is_signed_by(datum.benefitiary) 
        },
        red: Claim => {

            // Determine how many tokens to give
            tokens_to_give: Int = if (dynamic_reward > total_tokens_begin) { total_tokens_begin } else { dynamic_reward };

            assert(total_tokens_begin - tokens_to_give == total_tokens_in_script, "Not enough tokens sent back to script");
            
              // Check that the user receives exactly tokens_to_give
            assert(tx.value_sent_to(red.recepiant).get_safe(asset_class) == tokens_to_give, "Incorrect token payout");
            assert(isClaimWindow == true, "Not in claim window");
            
             // Now handle ADA and script outputs logic
             if (total_tokens_in_script == 0) {
                // Final claim scenario: no tokens remain
                // All ADA can be returned to the claimant, so no script outputs allowed
                assert(script_outputs.length == 0, "No script outputs should remain at final claim");
                // In this scenario, we don't need to enforce total_ada_in_script >= total_ada_begin,
                // since all ADA should now be leaving the script and going to the claimant.
                true
            } else {
                // Not final claim: tokens remain in the script
                // Require at least 2 script outputs for concurrency (adjust as needed)
                assert(script_outputs.length == 2, "I need 2 outputs");

                // Ensure no ADA leaves the contract yet
                assert(total_ada_in_script >= total_ada_begin, "No ADA can leave the contract");

                true
            }
        }
    }    
}`;

interface CodePageProps {
  // Define any props if necessary
}

const CodePage: React.FC<CodePageProps> = () => {
  // State variables for wallet and transaction management
  const [isConnected, setIsConnected] = useState(false);
  const [walletAPI, setWalletAPI] = useState<any>(undefined);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tx, setTx] = useState<{ txId: string }>({ txId: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isInClaimWindow, setIsInClaimWindow] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Try to reconnect wallet if a connection exists in localStorage
  useEffect(() => {
    const reconnectWallet = async () => {
      const savedWallet = localStorage.getItem("connectedWallet");

      if (typeof window !== "undefined" && savedWallet && window.cardano?.[savedWallet]) {
        try {
          const wAPI = await window.cardano[savedWallet].enable();
          const address = await wAPI.getChangeAddress();
          setWalletAPI(wAPI);
          setWalletAddress(address);

          const updateClaimWindowStatus = () => {
            const positionInCycle = calculateCountdown();
            setIsInClaimWindow(positionInCycle < CLAIM_WINDOW);
            setCountdown(
              positionInCycle < CLAIM_WINDOW
                ? CLAIM_WINDOW - positionInCycle
                : CYCLE_DURATION - positionInCycle
            );
          };

          updateClaimWindowStatus();
          const interval = setInterval(updateClaimWindowStatus, 1000);
          setConnectedWallet(savedWallet);
          setIsConnected(true);

          return () => clearInterval(interval);
        } catch (err) {
          console.error("Failed to reconnect wallet:", err);
          localStorage.removeItem("connectedWallet");
        }
      }
    };

    reconnectWallet();
  }, []);

  // Handler for wallet connection via modal
  const handleWalletConnect = async (api: any, walletName: string) => {
    if (api) {
      localStorage.setItem("connectedWallet", walletName);
      setWalletAPI(api);
      const address = await api.getChangeAddress();
      setWalletAddress(address);
      setIsConnected(true);
      setConnectedWallet(walletName);
      setIsWalletModalOpen(false);
    }
  };

  const toggleWalletModal = () => {
    setIsWalletModalOpen(!isWalletModalOpen);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    localStorage.removeItem("connectedWallet");
    setWalletAddress("");
  };

  // Handle claim tokens action
  const handleClaimTokens = async () => {
    try {
      setIsTransactionInProgress(true);
      await claimTokens(walletAPI, setIsLoading, setTx);
      setShowSuccess(false);
      setTimeout(() => setShowSuccess(true), 0);
    } catch (err: any) {
      if (err.info && err.info === "User declined to sign the transaction.") {
        console.log("Transaction canceled by user.");
      } else if (err.message && err.message.includes("wallet returned 0 utxos")) {
        console.log("Insufficient ADA in the user's wallet.");
        setError("Your wallet does not have enough ADA to claim tokens.");
      } else if (err.message && err.message.includes("Wallet API is not set.")) {
        console.log("No wallet connected");
        setError("Connect a wallet before claiming tokens.");
      } else if (err.message && err.message.includes("No more tokens to claim. Game Over!")) {
        console.log("No more tokens to claim. Game Over!");
        setError("No more tokens to claim. Game Over!");
      } else {
        setError("Something went wrong. Please try again.");
        console.log(err.message);
      }
    } finally {
      setIsTransactionInProgress(false);
    }
  };

  const closeErrorPopup = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleConnect = () => {
    setIsWalletModalOpen(true);
  };

  const openInstructions = () => {
    setIsInstructionsOpen(true);
  };

  // Optional: if you want a download button for the code (or any resource)
  const handleDownload = () => {
    window.open('/Code/HeliosCode.txt', '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[url('/logos/backgroundCrypto4Tiny.webp')] bg-cover bg-center">
      <Head>
        <title>Code - Claim Bert</title>
        <meta name="description" content="View the Helios on-chain code for Claim Bert dApp on Cardano." />
        <meta property="og:title" content="Claim Bert - Code" />
        <meta property="og:description" content="Explore the Helios smart contract code behind Claim Bert dApp." />
        <meta property="og:url" content="https://www.claimbert.com/code" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.claimbert.com/code" />
      </Head>

      {/* Navigation Bar */}
      <NavBar 
        isConnected={isConnected}
        walletAddress={walletAddress || ""}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onClaimTokens={handleClaimTokens}
        isInClaimWindow={isInClaimWindow}
        onHowToPlay={openInstructions}
        isTransactionInProgress={isTransactionInProgress}
      />

      {/* Instructions Window */}
      {isInstructionsOpen && (
        <InstructionsWindow onClose={() => setIsInstructionsOpen(false)} />
      )}

      {/* Wallet Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-center mb-4">Select Your Wallet</h3>
            <p className="text-lg text-center">Currently, only CIP-30-compatible browser wallets are supported.</p>
            <WalletConnector onWalletAPI={handleWalletConnect} />
            <button
              onClick={toggleWalletModal}
              className="mt-6 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {error && <ErrorPopup message={error} onClose={closeErrorPopup} />}

      {/* Success Notification */}
      {showSuccess && (
        <SuccessNotification
          message="Transaction Successful!"
          onClose={handleCloseSuccess}
        />
      )}

      {/* Main Content: Displaying Helios Code */}
      <main className="flex-grow mt-16 p-5 overflow-auto">
        <div className="relative w-full max-w-screen-xl mx-auto h-auto bg-white shadow-lg border rounded-lg overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Code is law</h1>
          <p className="text-2xl font-bold text-center mb-4">
            Smart Contract Address: addr1wygd2q56lc098fn0yrx9n6ngrjfjylxefxqztas6fffz7dsl4y9kn
          </p>
          <div className="overflow-auto max-h-[65vh]">
            <pre className="bg-gray-800 text-gray-100 p-4 rounded font-mono whitespace-pre-wrap break-words">
              <code>{heliosCode}</code>
            </pre>
          </div>
          <div className="mt-4 text-center">
            <button 
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition transform hover:scale-105"
            >
              Download Code
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer bg-gray-900 text-white p-2 md:p-4 text-xs md:text-sm flex-shrink-0">
        <div className="flex flex-col md:flex-row items-center w-full px-2 md:px-4">
          <div className="flex-1 text-left pl-2 md:pl-4">
            {tx.txId && walletAPI && (
              <>
                <h4 className="font-bold text-green-400">Transaction Success!</h4>
                <p>
                  <span className="font-semibold">TxId:</span>&nbsp;
                  <a
                    href={`https://cexplorer.io/tx/${tx.txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline break-all"
                  >
                    {tx.txId}
                  </a>
                </p>
              </>
            )}
          </div>

          <div className="flex-none mx-auto mt-2 md:mt-0">
            <a
              href="https://x.com/CardanoBert"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
              aria-label="Follow us on Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
              </svg>
            </a>
          </div>

          <div className="flex-1 text-center md:text-right mt-2 md:mt-0 md:pr-4">
            <p className="mb-1">ADA Donation Address:</p>
            <div className="flex items-center justify-center md:justify-end">
              <p className="break-all mr-2">
                addr1q9muvfmvxaxnhsm9ekek86jj4n7pan0n3038rv9cnjgg0cxwrmddhxvxma08n5gnke2g3c2wtvy6mske29sp78jw5a8qfdt3ze
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CodePage;
