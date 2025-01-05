import axios from 'axios';
import { 
    config,    
} from "@hyperionbt/helios";

export {
    getNetworkParams,
    network
}

// Define Cardano network
const network = "mainnet"
config.set({ ...config, IS_TESTNET: true });

async function getNetworkParams(network: string) {

    var networkParamsUrl;
    switch(network) {
        case "preview":
            networkParamsUrl = `/params/preview.json`;
            break;
        case "preprod":
            networkParamsUrl = `/params/preprod.json`;
            break;
        case "mainnet":
            networkParamsUrl = `/params/mainnet.json`;
            break;
        default:
            alert("Network not set");
            throw new Error("getNetworkParams: network not set");
    }

    try {
       let res = await axios({
            url: networkParamsUrl,
            method: 'get',
            timeout: 8000,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if(res.status == 200){
            return res.data;
        } else {
          throw console.error("getNetworkParams: error getting network params: ", res);
        }   
    }
    catch (err) {
        throw console.error("getNetworkParams: error getting network params: ", err);
    }
}
