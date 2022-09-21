const hre = require('hardhat');

async function verify(address, constructorArguments = []) {
  console.log('Verificando Contrato');

  try {
    await hre.run('verify:verify', { address, constructorArguments });
  } catch (error) {
    if (error.message.toLowerCase().includes('already verified')) {
      console.log('Already Verified!');
    } else console.log('error', error);
  }
}

module.exports = {
  verify,
};
