/* function deployFunc() {
	console.log("Hi!");
}

module.exports.default = deployFunc; */

const { networkConfig, developmentChain } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const {verify} = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId;

	//if chainId is X use address Y

	//const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	let ethUsdPriceFeedAddress;
	if (developmentChain.includes(network.name)) {
		const ethUsdAggregator = await deployments.get("MockV3Aggregator");
		ethUsdPriceFeedAddress = ethUsdAggregator.address;
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	}

	// When going for localhost or hardhat network we want to use mocking
	const args = [ethUsdPriceFeedAddress]
	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	});
	if (
		!developmentChain.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(fundMe.address, args);
	}
	log("----------END OF DEPLOY SCRIPT----------");
};

module.exports.tags = ["all", "fundme"];
