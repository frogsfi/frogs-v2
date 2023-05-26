
const express = require('express')
const app = express()
const port = 3011
const { PrismaClient, User } = require('@prisma/client')
var cors = require('cors')
var bodyParser = require('body-parser')
// import { ethers } from "ethers"
const { ethers } = require("ethers")
const dotenv = require('dotenv')
const constants = require("../blockchain/scripts/json/constants.json")
const lotteryAbi = require("../blockchain/artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json")
const Constants = require("../frontend/config.json")
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
dotenv.config()
const prisma = new PrismaClient()

const infura = 'e896ad4f86a749038fe8e1de62a9b540'
const prefix = Constants.prefix

const afterDraw = async (contract: any, drawNumber: any, allReward: any, participantsReward: any) => {
    console.log(drawNumber.toString(), allReward.toString(), participantsReward.toString())
    const filter = await contract.queryFilter(contract.filters.Victory())
    // const filter = await contract.queryFilter(contract.filters.Victory(), await provider.getBlockNumber() - 5)
    let afterDrawData = []
    let referalsReward = BigInt(0)
    const len = filter.length
    for (let index = len - 1; index >= 0; index--) {
        const element = filter[index];
        // console.log(element.args)
        if (element.args._drawNumber < drawNumber)
            break
        const user = await prisma.user.findUnique({
            where: {
                wallet: element.args?._winner.toLowerCase()
            },
            select: {
                percent: true,
                refererId: true
            }
        })
        // console.log(user)
        const referer = await prisma.user.findUnique({
            where: {
                id: user?.refererId as any
            },
            select: {
                wallet: true
            }
        })
        const reward = Math.round(element.args?._amount / 100 * (user?.percent as number / 100))
        afterDrawData.push({
            wallet: referer?.wallet,
            reward: BigInt(reward)
        })
        referalsReward += BigInt(reward)
    }
    console.log(afterDrawData)
    try {
        await contract.afterDraw(afterDrawData, BigInt(referalsReward))
    } catch (error) {
        console.log(error)
    }
    console.log("done:", drawNumber)
}

app.post('/getUser', async (req: any, res: any) => {
    try {
        let { wallet } = req.body
        wallet = wallet.toLowerCase()
        const user = await prisma.user.findUnique({
            where: {
                wallet
            }
        })
        const referer = await prisma.user.findUnique({
            where: {
                id: user.refererId
            },
            select: {
                wallet: true
            }
        })
        res.send({ user, referer })
    } catch (error: any) {
        console.log(error)
        res.send({ user: null, error: error.toString() })
    }
})

app.listen(port, async () => {
    let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
    if (prefix != 'localhost_') {
        // provider = new ethers.providers.InfuraProvider('sepolia', infura)
        provider = new ethers.providers.InfuraProvider('sepolia', infura)//https://sepolia.infura.io/v3/e896ad4f86a749038fe8e1de62a9b540
    }
    console.log(provider.connection)
    const contract = new ethers.Contract(constants.addresses[prefix + 'Lottery_CAKE_BNB'], lotteryAbi.abi, new ethers.Wallet(constants[prefix + 'privateKey'], provider))
    // contract.on('Victory', async (drawNumber: any, winner: any, rew: any) => {
    //     console.log(drawNumber, winner, rew)
    // })
    // contract.on('NewParticipant', async (address: any) => {
    //     console.log(address)
    // })
    contract.on('Draw', async (drawNumber: any, allReward: any, participantsReward: any) => {
        afterDraw(contract, drawNumber, allReward, participantsReward)
    })
    // await uni()
    console.log(`Example app listening on port ${port}`)
})

const abi = [{ "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "address", "name": "minter_", "type": "address" }, { "internalType": "uint256", "name": "mintingAllowedAfter_", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "delegator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "fromDelegate", "type": "address" }, { "indexed": true, "internalType": "address", "name": "toDelegate", "type": "address" }], "name": "DelegateChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "delegate", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "previousBalance", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newBalance", "type": "uint256" }], "name": "DelegateVotesChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "minter", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newMinter", "type": "address" }], "name": "MinterChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [], "name": "DELEGATION_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "DOMAIN_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "PERMIT_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint32", "name": "", "type": "uint32" }], "name": "checkpoints", "outputs": [{ "internalType": "uint32", "name": "fromBlock", "type": "uint32" }, { "internalType": "uint96", "name": "votes", "type": "uint96" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "delegatee", "type": "address" }], "name": "delegate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "delegatee", "type": "address" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "delegateBySig", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "delegates", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "getCurrentVotes", "outputs": [{ "internalType": "uint96", "name": "", "type": "uint96" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "blockNumber", "type": "uint256" }], "name": "getPriorVotes", "outputs": [{ "internalType": "uint96", "name": "", "type": "uint96" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "minimumTimeBetweenMints", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "dst", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }], "name": "mint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "mintCap", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "minter", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "mintingAllowedAfter", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "numCheckpoints", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "permit", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "minter_", "type": "address" }], "name": "setMinter", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "dst", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "src", "type": "address" }, { "internalType": "address", "name": "dst", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }]

const uni = async () => {
    const provider = new ethers.providers.InfuraProvider(1, infura)//https://sepolia.infura.io/v3/e896ad4f86a749038fe8e1de62a9b540
    const contract = new ethers.Contract('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', abi, new ethers.Wallet(constants[prefix + 'privateKey'], provider))
    contract.on('Transfer', (from: any, to: any, amount: any) => {
        console.log(from, to, amount)
    })
}