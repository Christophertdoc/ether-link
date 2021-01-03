const Web3 = require('web3')
const axios = require('axios')

const getWeb3 = async (params) => {
  const testnet = await axios.get('http://localhost:3000/node', { params: { network: params.network } })
  return new Web3(new Web3.providers.HttpProvider(testnet.data))
}

module.exports = {

  transact: async function(params) {
    const EthereumTx = require('ethereumjs-tx').Transaction
    const web3 = await getWeb3(params)
    web3.eth.defaultAccount = params.from
    const gasPrices = await axios.get('http://localhost:3000/gas')
    const nonce = await web3.eth.getTransactionCount(web3.eth.defaultAccount)
    const value = await web3.utils.toHex(web3.utils.toWei(params.ether, 'ether'))
    const gasPrice = await web3.utils.toHex(gasPrices.data.medium * 1000000000) // converts the gwei price to wei
    const gasLimit = await web3.utils.toHex(21000)
    const transaction = new EthereumTx({
      nonce,
      gasPrice,
      gasLimit,
      to: params.to,
      value
    }, {chain: params.network, hardfork: 'petersburg'})
    transaction.sign(Buffer.from(params.privateKey, 'hex'))
    const serializedTransaction = transaction.serialize()
    const raw = '0x' + serializedTransaction.toString('hex')
    return web3.eth.sendSignedTransaction(raw)
  },

  getBalance: async function(params) {
    const web3 = await getWeb3(params)
    web3.eth.defaultAccount = params.account
    return new Promise(function(resolve, reject) {
      resolve(web3.fromWei(web3.eth.getBalance(web3.eth.defaultAccount).toNumber(), 'ether'))
    })
  },

  getGasPrices: async function(params) {
    return await axios.get('http://localhost:3000/gas')
  },

  getNonce: async function(params) {
    return web3.eth.getTransactionCount(web3.eth.defaultAccount)
  }

}
