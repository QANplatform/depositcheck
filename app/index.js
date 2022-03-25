const ethers = require('ethers');
const ERC20 = new ethers.utils.Interface(require('./erc20.abi.json'));
const providers = {
    eth: ethers.getDefaultProvider(),
    bsc: new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org')
};

(async function(){

    // GET INPUT PARAMETERS
    const [,, chain, txhash] = process.argv;

    // SET PROVIDER BASED ON INPUT PARAM
    const provider = providers[chain];

    // VALIDATE INPUT PARAMS
    if(!provider || !/^0x([A-Fa-f0-9]{64})$/.test(txhash)){
        console.log('Usage:   docker run --rm qanplatform/depositcheck [eth|bsc] $TXHASH');
        console.log('Example: docker run --rm qanplatform/depositcheck eth 0xe58b406073dbccd09de43c278ec7d6f40eaba86d60c68c8c79ff784bc34ef9dc');
        process.exit(1);
    }

    // FETCH SPECIFIED TRANSACTION
    const tx = await provider.getTransaction(txhash);
    if(!tx?.hash){
        console.log(`Transaction ${txhash} was not found on ${chain}!`);
        process.exit(1);
    }

    // FETCH TRANSACTION RECEIPT
    const receipt = await provider.getTransactionReceipt(txhash);
    if(!receipt?.logs){
        console.log(`Transaction logs are not available for ${txhash}`);
        process.exit(1);
    }

    // PROCESS TRANSACTION LOGS
    receipt.logs.map(log => {

        // IF THIS IS A TRANSFER EVENT TOPIC
        if(log.topics[0] === ERC20.getEventTopic('Transfer')){

            // EXTRACT SENDER AND BENEFICIARY FROM TOPICS
            const [ , sender, beneficiary ] = log.topics;

            // IF SENDER AND BENEFICIARY ARE THE SAME, IGNORE TRANSACTION AS IT IS ZERO SUM ANYWAY
            if(sender === beneficiary){
                console.log(`${sender} is sending money to himself, DO NOT make deposit!`);
                process.exit(1);
            }
            
            // OPTION 1: IGNORE TRANSACTION IF NOT INITIATED FROM AN ERC20 STANDARD FUNCTION
            const func = tx.data?.slice(0, 10);
            if(func !== ERC20.getSighash('transfer(address, uint)') && func !== ERC20.getSighash('transferFrom(address, address, uint)')){
                console.log(`${func} is not an ERC20 standard transfer function, we should ignore transaction!`);
                process.exit(1);
            }

            // OPTION 2: EXPLICITLY BLOCK THE FUNCTION SELECTOR OF transferLocked() METHOD OF QANX
            if(func === '0xb80e74d7'){
                console.log(`This transaction is a locked QANX token transfer, we should ignore transaction!`);
                process.exit(1);
            }

            // IF THEY DIFFER, THIS COULD BE A VALID DEPOSIT TRANSACTION
            console.log(`${sender} is sending money to ${beneficiary} using function ${func}, this could be a valid deposit!`);
            process.exit(0);
        }
    });
})();
