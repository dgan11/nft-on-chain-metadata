const fs = require("fs");
let { networkConfig } = require('../helper-hardhat-config') 


// Start the deployment function
module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId
}) => {
    //
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();

    // Deploy SVFNFT.sol to the network and get back the contract address for it
    log(" ------------------------------ ")
    const SVGNFT = await deploy("SVGNFT", {
        from: deployer,
        log: true
    })
    log(`1) You have deployed an NFT contract to ${SVGNFT.address}`)

    // Read in the img/triangle.svg file
    let filepath = "./img/triangle.svg"
    let svg = fs.readFileSync(filepath, { encoding: "utf8" })
    
    // ---- call the SVGNFT.sol create()
    // Get all the contract information about SVGNFT
    const svgNFTContract = await ethers.getContractFactory("SVGNFT")

    // Get the signer of the transaction from the first account in metamask
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]

    // Line that actually gets an SVGNFT        address, contract interface, signer
    const svgNFT = new ethers.Contract(SVGNFT.address, svgNFTContract.interface, signer)
    const networkName = networkConfig[chainId]['name']

    log(`2) Verify with \n npx hardhat verify --network ${networkName} ${svgNFT.address}`)

    // Call the mint function / create the transaction
    let transactionResponse = await svgNFT.create(svg); // calling the create() from SVGNFT.sol
    let receipt = await transactionResponse.wait(1) // wait one block for this transaction to go through

    log(`3) You've made an NFT`)
    log(`4) You can view the tokenURI here ${await svgNFT.tokenURI(0)}`);
}
module.exports.tags = ["all", "svg"];