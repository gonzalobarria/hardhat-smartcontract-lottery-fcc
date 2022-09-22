const { assert, expect } = require('chai');
const { network, getNamedAccounts, deployments, ethers } = require('hardhat');
const {
  developmentChains,
  networkConfig,
} = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle unit Test', () => {
      let raffle, vrfCoordinatorV2Mock, entranceFee, deployer, interval;
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
        interval = await raffle.getInterval();
      });

      describe('constructor', () => {
        it('Inicia el raffle correctamente', async () => {
          const raffleState = await raffle.getRaffleState();
          assert.equal(raffleState.toString(), '0');
          assert.equal(interval, networkConfig[chainId]['interval']);
        });
      });

      describe('enterRaffle', () => {
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
          await raffle.enterRaffle({ value: entranceFee });
          // simulo que estoy 1 segundo sobre el intervalo de tiempo
          // para que se pueda hacer la transacción
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ]);
          // después de incrementar el tiempo tengo que minar
          // para que se ejecute la acción de incrementar tiempo
          await network.provider.send('evm_mine', []);
          await raffle.performUpkeep([]);
          await expect(
            raffle.enterRaffle({ value: entranceFee })
          ).to.be.revertedWith('Raffle__NotOpen');
        });
      });

      describe('checkUpKeep', () => {
        it("returns false if people haven't send any ETH", async () => {
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ]);
          await network.provider.send('evm_mine', []);

          // callStatic simula enviar una transacción
          const { upkeepNeeded } = raffle.callStatic.checkUpkeep([]);
          assert(!upkeepNeeded);
        });

        it('devuelve false si raffle no está abierto', async () => {
          await raffle.enterRaffle({ value: entranceFee });

          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ]);
          await network.provider.send('evm_mine', []);
          await raffle.performUpkeep([]);
          const raffleState = await raffle.getRaffleState();
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert.equal(raffleState, '1');
          assert.equal(upkeepNeeded, false);
        });

        it('devuelve falso si el tiempo no ha pasado', async () => {
          await raffle.enterRaffle({ value: entranceFee });
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() - 1,
          ]);
          await network.provider.send('evm_mine', []);
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          // assert.equal(upkeepNeeded, false);
          assert(!upkeepNeeded); // es lo mismo que arriba
        });

        

        it('devuelve true si todo se cumple', async () => {
          await raffle.enterRaffle({ value: entranceFee });
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ]);
          await network.provider.send('evm_mine', []);
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          // assert.equal(upkeepNeeded, false);
          assert(upkeepNeeded); // es lo mismo que arriba
        });
      });
    });
