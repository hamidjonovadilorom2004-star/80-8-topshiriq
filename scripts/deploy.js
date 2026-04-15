const hre = require("hardhat");

async function main() {
  const RealEstate = await hre.ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();

  await realEstate.waitForDeployment();

  console.log("RealEstate deployed to:", await realEstate.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
