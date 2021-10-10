/**
 * Deployment script for RandomSVG.sol using HardHat
 */

let {networkConfig} = require('../helper-hardhat-config.js')

module.exports = async ({
    getNamedAccounts, // get metamask accounts
    deployments,      
    getChainId
}) => {
    //
    const { deploy, get, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();

    // Look at the constructor inputs for RandomSVG -- you will need these
    // If we are on a local chain like hardhat, what is the link token address? 
    //     -- there is none, so use a fake one to test locally (i.e. Mocking)
    //     -- But for real chains we will use a real one

    let linkTokenAddress, vrfCoordinatorAddress

    if (chainId == 31337) {
        // means we are on a local chain and are mocking the link token
        let linkToken = await get('LinkToken')
        linkTokenAddress = linkToken.address
        let vrfCoordinatorMock = await get('VRFCoordinatorMock')
        vrfCoordinatorAddress = vrfCoordinatorMock.address
    }
    else {
        // Not on a local chain
        // Find the values in helper-hardhat-config.js
        // We are on Rinkeby - https://docs.chain.link/docs/vrf-contracts/
        linkTokenAddress = networkConfig[chainId]['linkToken']
        vrfCoordinatorAddress = networkConfig[chainId]['vrfCoordinator']
    }
    const keyHash = networkConfig[chainId]['keyHash']
    const fee = networkConfig[chainId]['fee']
    let args = [vrfCoordinatorAddress, linkTokenAddress, keyHash, fee]

    log('-----------------------------------')
    const RandomSVG = await deploy('RandomSVG', {
        from: deployer,
        args: args,
        log: true
    })
    log('You have deployed your NFT contract!')

    const networkName = networkConfig[chainId]["name"];
    log(`Verify with: \n npx hardhat verify --network ${networkName} ${RandomSVG.address} ${args.toString().replace(/,/g, " ")} `)

    // Fund RandomSVG contract with LINK
    const linkTokenContract = await ethers.getContractFactory("LinkToken")
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const linkToken = new ethers.Contract(linkTokenAddress, linkTokenContract.interface, signer)
    let fund_tx = await linkToken.transfer(RandomSVG.address, fee);
    await fund_tx.wait(1)

    // Create an NFT by calling a random number
    const RandomSVGContract = await ethers.getContractFactory("RandomSVG")
    const randomSVG = new ethers.Contract(RandomSVG.address, RandomSVGContract.interface, signer)
    let creation_tx = await 
    randomSVG.create({ gasLimit: 300000, value: '100000000000000000'})
    let receipt = await creation_tx.wait(1)
    //log("receipt: ", receipt.events[3].topics)
    let tokenId = receipt.events[3].topics[2]
    log(`You've made your NFT! This is token number ${tokenId.toString()}`)
    log(`Let's wait for Chainlink node to respond..`)

    
    if (chainId != 31337) {
        log('NOT A LOCAL CHAIN')
        await new Promise(r => setTimeout(r, 180000))
        log(`now let's finish the mint`)
        let finish_tx = await randomSVG.finishMint(tokenId, { gasLimit: 2000000 })
        await finish_tx.wait(1)
        log(`You can view the tokenURI here ${await randomSVG.tokenURI(tokenId)}`)
    }
    else {
        // ON LOCAL CHAIN -- mocking
        const VRFCoordinatorMock = await deployments.get("VRFCoordinatorMock")
        vrfCoordinator = await ethers.getContractAt("VRFCoordinatorMock", VRFCoordinatorMock.address, signer)
        let vrf_tx = await vrfCoordinator.callBackWithRandomness(receipt.logs[3].topics[1], 69420, randomSVG.address)
        await vrf_tx.wait(1)
        log("Now lets finish the mint!")
        let finish_tx = await randomSVG.finishMint(tokenId, { gasLimit: 2000000, gasPrice: 20000000000})
        await finish_tx.wait(1)
        // log('finish_tx', finish_tx)
        log(`You can view the tokenURI here: ${await randomSVG.tokenURI(tokenId)}`)
    }
    
}

module.exports.tags = ['all', 'rsvg']