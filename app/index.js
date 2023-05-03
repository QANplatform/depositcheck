const ethers = require('ethers');
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
        console.log('Example (normal transfer): docker run --rm qanplatform/depositcheck eth 0x9dd3bd166f7c56a097e32576d59d35be83c9914bbca67f56a17dbe77d1024d62');
        console.log('Example (locked transfer): docker run --rm qanplatform/depositcheck eth 0x3722aa757f34593ed45f0be96eb8f44166e279b640121b682b49f50c4e6e06fc');
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

    // DEFINE QANX ADDRESS AND LOCK TOPIC
    QANX_ADDR = '0xAAA9214F675316182Eaa21C85f0Ca99160CC3AAA';
    QANX_LOCK_APPLIED_TOPIC = '0x74e0938598868b4c1e871f3cff0292e8399ee8cc53264926f8956ef711f7bc37';

    // CHECK LOGS OF RECEIPT
    receipt.logs.map(log => {

        // IF A LOG WAS EMITTED BY THE QANX CONTRACT, AND THE EVENT TOPIC IS "LockApplied"
        if(log.address === QANX_ADDR && log.topics[0] === QANX_LOCK_APPLIED_TOPIC){

            // THEN THIS TRANSACTION CERTAINLY ORIGINATED FROM A LOCKED TRANSFER METHOD
            console.log(`${txhash} transfers locked QANX tokens, we should ignore it!`);
            process.exit(1);
        }
    });
    
    // REACHING THIS POINT MEANS THAT THIS IS A NON-LOCKED TRANSFER
    console.log(`${txhash} does not involve locked QANX tokens.`);
    process.exit(0);
})();
