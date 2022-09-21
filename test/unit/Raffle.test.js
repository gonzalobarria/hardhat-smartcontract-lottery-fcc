const { assert, expect } = require('chai');
const { network, getNamedAccounts, deployments, ethers } = require('hardhat');
const {
  developmentChains,
  networkConfig,
} = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle unit Test', async () => {
      let raffle, vrfCoordinatorV2Mock, entranceFee, deployer;
      const chainId = network.config.chainId;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture('all');

        raffle = await ethers.getContract('Raffle', deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          'VRFCoordinatorV2Mock',
          deployer
        );
        entranceFee = await raffle.getEntranceFee();
      });

      describe('constructor', async () => {
        it('Inicia el raffle correctamente', async () => {
          const raffleState = await raffle.getRaffleState();
          const interval = await raffle.getInterval();
          assert.equal(raffleState.toString(), '0');
          assert.equal(interval, networkConfig[chainId]['interval']);
        });
      });

      describe('enterRaffle', async () => {
        it("reverts when you don't pay eough", async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWith(
            'Raffle__NotEnoughETHEntered'
          );
        });

        it('records playeres when they enter', async () => {
          await raffle.enterRaffle({ value: entranceFee });
          const playerFromContract = await raffle.getPlayer(0);
          assert.equal(playerFromContract, deployer);
        });

        it('emit event on enter', async () => {
          await expect(raffle.enterRaffle({ value: entranceFee })).to.emit(
            raffle,
            'RaffleEnter'
          );
        });

        it('no permite la entrada cuando está calculando', async () => {
          raffle.enterRaffle({ value: entranceFee });
          // const raffleState = await raffle.getRaffleState();
          // assert.equal(raffleState.toString(), '0');
        });
      });
    });
