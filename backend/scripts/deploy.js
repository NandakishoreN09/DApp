const hre = require("hardhat");

async function main() {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(); // No need for .deployed()

    console.log("Voting contract deployed to:", voting.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
