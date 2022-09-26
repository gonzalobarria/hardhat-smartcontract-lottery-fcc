require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-deploy');
require('solidity-coverage');
require('hardhat-gas-reporter');
require('hardhat-contract-sizer');
require('dotenv').config();

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || 'https://rinkeby.net';
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'key';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'key';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || 'key';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
      },
      {
        version: '0.4.24',
      },
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  mocha: {
    timeout: 200000,
  },
  gasReporter: {
    enabled: false,
    outputFile: 'gas-report.txt',
    noColors: true,
    currency: 'USD',
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
};
