/**
 * Script for local chains (mocks)
 */

module.exports = async({
    getNamedAccounts,
    deployments,
    getChainId
}) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await getChainId()

    if (chainId == 31337) {
        log("local network detected! Deploying Mocks...")

        // Deploy the test contracts/mocks for LinkToken and VRFCoordinator
        const LinkToken = await deploy('LinkToken', { from: deployer, log: true })
        const VRFCoordinatorMock = await deploy('VRFCoordinatorMock', {
            from: deployer,
            logs: true,
            args: [LinkToken.address]
        })
        log("Mocks deployed!")
    }
}
module.exports.tags = ['all', 'rsvg', 'svg']
