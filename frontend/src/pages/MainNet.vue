<template>
  <div>
    <modal v-model:show="modalVisible">{{ modalContent }}</modal>
    <div class="container">
      <div class="pools">
        <div class="pool">
          <div class="pool__header">
            <div class="pool__title">CAKE-BNB</div>
          </div>
          <template v-if="$store.state.account">
            <div class="pool__body">
              <div class="pool__token">
                <div class="pool__token__header">
                  <label class="pool__token__name">CAKE</label>
                  <div class="pool__token__balance">balance: <span>{{ wallet.cake }}</span></div>
                </div>
                <input-text class="pool__token__count" v-model="form.deposit.cake" @input="formDepositBnbSync" v-focus />
                <div class="pool__token__footer">
                  <div class="pool__token__estimate">~<span>{{ form.deposit.cake * pancake.rates.cakeusdt }}</span> USD
                  </div>
                  <btn-link class="pool__token__max" @click="formDepositCakeMaximize">max</btn-link>
                </div>
              </div>
              <div class="pool__plus">+</div>
              <div class="pool__token">
                <div class="pool__token__header">
                  <label class="pool__token__name">BNB</label>
                  <div class="pool__token__balance">balance: <span>{{ wallet.bnb }}</span></div>
                </div>
                <input-text class="pool__token__count" v-model="form.deposit.bnb" @input="formDepositCakeSync" />
                <div class="pool__token__footer">
                  <div class="pool__token__estimate">~<span>{{ form.deposit.bnb * pancake.rates.bnbusdt }}</span> USD
                  </div>
                  <btn-link class="pool__token__max" @click="formDepositBnbMaximize">max</btn-link>
                </div>
              </div>
              <div class="pool__rates">
                <div class="pool__rate">
                  <div class="pool-rate__value">{{ pancake.rates.bnbcake }}</div>
                  <div class="pool-rate__label">CAKE per BNB</div>
                </div>
                <div class="pool__rate">
                  <div class="pool-rate__value">{{ pancake.rates.cakebnb }}</div>
                  <div class="pool-rate__label">BNB per CAKE</div>
                </div>
              </div>
              <div>
                <btn-primary @click="deposit">Deposit</btn-primary>
              </div>
              <table>
                <tr>
                  <th>Your</th>
                  <th>LP</th>
                  <th>CAKE</th>
                  <th>BNB</th>
                  <th>USDT</th>
                </tr>
                <tr>
                  <td>deposit</td>
                  <td><small>{{ frog.user.deposit }}</small></td>
                  <td><small>{{ frog.user.deposit * pancake.rates.lpcake }}</small></td>
                  <td><small>{{ frog.user.deposit * pancake.rates.lpbnb }}</small></td>
                  <td><small>{{ frog.user.deposit * (pancake.rates.lpcake * pancake.rates.cakeusdt + pancake.rates.lpbnb *
                    pancake.rates.bnbusdt) }}</small></td>
                </tr>
                <tr>
                  <td>balance</td>
                  <td><small>{{ frog.user.balance }}</small></td>
                  <td><small>{{ frog.user.balance * pancake.rates.lpcake }}</small></td>
                  <td><small>{{ frog.user.balance * pancake.rates.lpbnb }}</small></td>
                  <td><small>{{ frog.user.balance * (pancake.rates.lpcake * pancake.rates.cakeusdt + pancake.rates.lpbnb *
                    pancake.rates.bnbusdt) }}</small></td>
                </tr>
                <tr>
                  <td>withdraw</td>
                  <td><small>{{ frog.user.withdraw }}</small></td>
                  <td><small>{{ frog.user.withdraw * pancake.rates.lpcake }}</small></td>
                  <td><small>{{ frog.user.withdraw * pancake.rates.lpbnb }}</small></td>
                  <td><small>{{ frog.user.withdraw * (pancake.rates.lpcake * pancake.rates.cakeusdt + pancake.rates.lpbnb
                    * pancake.rates.bnbusdt) }}</small></td>
                </tr>
              </table>
              <div>
                <input type="text" v-model="form.withdraw.lp" />
                <btn-primary @click="withdraw">Withdraw</btn-primary>
              </div>
              <br>
              <div>
                <h3>Last Draw Number: {{ frog.drawNumber }}</h3>
              </div>
              <div>
                <h3>Total Farm: {{ frog.farmTotal }}</h3>
              </div>
              <div>
                <h3>Your Reward: {{ frog.user.reward }}</h3>
              </div>
              <div>
                <h3>Your Referer: {{ frog.referalInfo.referer }}</h3>
              </div>
              <div>
                <h3>Your Percent: {{ frog.referalInfo.percent }}</h3>
              </div>
              <div>
                <h3>Your Referal Reward: {{ frog.user.referalReward }}</h3>
              </div>
              <div>
                <h3>Now In Lottery: {{ frog.nowIn }}</h3>
              </div>
              <div>
                <h3>Beneficiary : {{ frog.beneficiaryAmount }}</h3>
              </div>
              <btn-primary @click="claimReward" v-if="frog.user.reward">Claim Reward</btn-primary>
              <btn-primary @click="claimReferalReward" v-if="frog.user.referalReward">Claim Referal Reward</btn-primary>
            </div>
          </template>
          <template v-else>
            <div class="pool__body">
              Please connect your wallet to select this pool
            </div>
            <div class="pool_footer">

            </div>
          </template>
        </div>
      </div> <!-- .pools -->
      <btn-primary @click="getCake">getCake</btn-primary>
      <h2>Set referer</h2>
      <form @submit.prevent class="admin-form">
        <input-text v-model="this.frog.referalInfo.inputReferer" placeholder="Address" class="input" />
        <btn-primary @click="setReferer">Set referer</btn-primary>
      </form>
      <div>
        <h2>Admin</h2>
        <br>
        <h3>Owner <small>(current: {{ frog.owner }})</small></h3>
        <h3>Beneficiary <small>(current: {{ frog.beneficiary }})</small></h3>
        <h3>Farm Total: <small> {{ frog.farmTotal }}</small></h3>
        <h3>Last Draw number: <small> {{ frog.drawNumber }}</small></h3>
        <form @submit.prevent class="admin-form" v-if="isOwner || isBeneficiary">
          <input-text v-model="form.newBeneficiary" placeholder="New Beneficiary Address" class="input" />
          <btn-primary @click="setBeneficiary">Set beneficiary</btn-primary>
        </form>
        <form @submit.prevent class="admin-form" v-if="isOwner">
          <input-text v-model="form.newOwner" placeholder="New Owner Address" class="input" />
          <btn-primary @click="setOwner">Set owner</btn-primary>
        </form>
        <form @submit.prevent class="admin-form" v-if="isOwner">
          <input-text v-model="form.newFeePercent" placeholder="New Fee Percent" class="input" />
          <btn-primary @click="setFeePercent">Set fee percent</btn-primary>
        </form>
        <template v-if="frog.participants">
          <h2>Current Participants</h2>
          <table>
            <thead>
              <th>Address</th>
              <th>LP</th>
              <th>Reward</th>
            </thead>
            <tbody>
              <tr v-for="participant in frog.participants">
                <td>{{ participant.address }}</td>
                <td>{{ participant.balance }}</td>
                <td>{{ participant.reward }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-if="frog.victories">
          <h2>Table of Winners</h2>
          <table>
            <thead>
              <th>Draw</th>
              <th>Winner</th>
              <th>Amount</th>
            </thead>
            <tbody>
              <tr v-for="victory in frog.victories">
                <td>{{ victory.drawNumber }}</td>
                <td>{{ victory.winner }}</td>
                <td>{{ victory.amount }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-if="frog.draws">
          <h2>Table of Draws</h2>
          <table>
            <thead>
              <th>#</th>
              <th>Fund</th>
              <th>Reward</th>
            </thead>
            <tbody>
              <tr v-for="draw in frog.draws">
                <td>{{ draw.number }}</td>
                <td>{{ draw.fund }}</td>
                <td>{{ draw.reward }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <btn-primary @click="draw">Draw</btn-primary>
      </div>
    </div> <!-- .container -->
  </div> <!-- .app -->
</template>

<script>
import Web3 from 'web3';
import axios from 'axios';
import AppHeader from '@/components/AppHeader';
import Modal from "@/components/UI/Modal";
import BtnPrimary from "@/components/UI/BtnPrimary";
import constants from "../../../blockchain/scripts/json/constants.json"
import { ethers } from "ethers"
import config from "../../config.json"


// ../../blockchain/artifacts/

import cakeAbi from '../contracts/pancekeswap-fork/utils/CakeToken.sol/CakeToken.json'
import bnbAbi from '../contracts/frogs/ERC20.sol/ERC20Token.json'
import lotteryAbi from '../contracts/frogs/FrogLottery.sol/FrogLottery.json'
import factoryAbi from '../contracts/frogs/Factory.sol/Factory.json'
import referalAbi from "../contracts/frogs/FrogReferal.sol/FrogReferal.json"
import routerAbi from "../contracts/pancekeswap-fork/router.sol/PancakeRouter.json"
import pairAbi from "../contracts/pancekeswap-fork/pancakepair.sol/PancakePair.json"

const bnbChainId = '0x38';
const bnbRpcUrl = 'https://bsc-dataseed.binance.org';
let prefix = config.prefix

const CakeContractABI = cakeAbi.abi
let CakeContractAddress = constants.addresses[prefix + 'CAKE'];

const BnbContractABI = bnbAbi.abi
let BnbContractAddress = constants.addresses[prefix + 'BNB'];

const FrogContractABI = lotteryAbi.abi
let FrogContractAddress = constants.addresses[prefix + 'Lottery_CAKE_BNB'];

const FactoryABI = factoryAbi.abi
let FactoryAddress = constants.addresses[prefix + 'Factory'];

const FrogReferalABI = referalAbi.abi
let FrogReferalAddress = constants.addresses[prefix + 'FrogReferal'];

const backendUrl = config.backendUrl
const PancakeRouterABI = routerAbi.abi
let PancakeRouterAddress = constants.addresses[prefix + 'Router'];

const PancakePairCakeWbnbABI = pairAbi.abi
let PancakePairCakeWbnbAddress = constants.addresses[prefix + 'LPToken_CAKE_BNB'];
let UsdtContractAddress = constants.addresses[prefix + 'USDT']

export default {
  components: {
    BtnPrimary,
    Modal
  },

  data() {
    return {
      isOwner: false,
      isBeneficiary: false,
      chainId: 11155111,
      form: {
        newBeneficiary: '',
        newOwner: '',
        newFeePercent: 0,
        deposit: {
          cake: 0,
          bnb: 0,
        },
        withdraw: {
          lp: 0,
        },
      },
      frog: {
        owner: 0,
        beneficiary: 0,
        farmTotal: 0,
        drawNumber: 0,
        minUsd: 0,
        maxUsd: 0,
        nowIn: -1,
        beneficiaryAmount: -1,
        user: {
          deposit: 0,
          balance: 0,
          withdraw: 0,
          reward: 0,
          referalReward: -1
        },
        referalInfo:
        {
          inputReferer: '',
          referer: "-1",
          percent: -1
        },
        participants: [],
        draws: [],
        victories: [],
      },
      wallet: {
        cake: 0,
        bnb: 0
      },
      pancake: {
        rates: {
          bnbusdt: 0,
          cakeusdt: 0,
          bnbcake: 0,
          cakebnb: 0,
          lpcake: 0,
          lpbnb: 0,
          cakelp: 0,
          bnblp: 0,
        }
      },
      modalVisible: false,
      modalContent: '',
    }
  },
  methods: {
    async updateParams() {
      const web3 = new Web3(window.ethereum)
      const pancakeRouter = new web3.eth.Contract(PancakeRouterABI, PancakeRouterAddress)

      await pancakeRouter.methods.getAmountsOut(web3.utils.toWei('1', 'ether'), [BnbContractAddress, UsdtContractAddress]).call()
        .then(amountsOut => {
          if (!amountsOut[1]) this.pancake.rates.bnbusdt = 0;
          else this.pancake.rates.bnbusdt = web3.utils.fromWei(amountsOut[1]);
        })
      await pancakeRouter.methods.getAmountsOut(web3.utils.toWei('1', 'ether'), [CakeContractAddress, UsdtContractAddress]).call()
        .then(amountsOut => {
          if (!amountsOut[1]) this.pancake.rates.cakeusdt = 0;
          else this.pancake.rates.cakeusdt = web3.utils.fromWei(amountsOut[1]);
        })

      this.pancake.rates.bnbcake = (this.pancake.rates.bnbusdt / this.pancake.rates.cakeusdt).toFixed(2)
      this.pancake.rates.cakebnb = (this.pancake.rates.cakeusdt / this.pancake.rates.bnbusdt).toFixed(4)

      const pancakePairCakeWbnb = new web3.eth.Contract(PancakePairCakeWbnbABI, PancakePairCakeWbnbAddress);
      const reserves = await pancakePairCakeWbnb.methods.getReserves().call()
      const supply = await pancakePairCakeWbnb.methods.totalSupply().call()
      this.pancake.rates.lpcake = reserves._reserve0 / supply
      this.pancake.rates.lpbnb = reserves._reserve1 / supply
      this.pancake.rates.cakelp = supply / reserves._reserve0;
      this.pancake.rates.bnblp = supply / reserves._reserve1;


      const FrogContract = new web3.eth.Contract(FrogContractABI, FrogContractAddress);
      FrogContract.methods.minUsd().call()
        .then(minUsd => {
          this.frog.minUsd = parseFloat(web3.utils.fromWei(minUsd))
        });
      FrogContract.methods.maxUsd().call()
        .then(maxUsd => {
          this.frog.maxUsd = parseFloat(web3.utils.fromWei(maxUsd))
        });

      setTimeout(this.updateParams, 20000)
    },
    async updateBalances() {
      if (this.$store.state.account) {
        const web3 = new Web3(window.ethereum)
        new web3.eth.Contract(CakeContractABI, CakeContractAddress)
          .methods.balanceOf(this.$store.state.account.toLowerCase()).call()
          .then(balance => {
            this.wallet.cake = web3.utils.fromWei(balance)
          })
        new web3.eth.getBalance(this.$store.state.account.toLowerCase())
          .then(balance => {
            this.wallet.bnb = web3.utils.fromWei(balance)
          })

        const frog = new web3.eth.Contract(FrogContractABI, FrogContractAddress)
        frog.methods.depositOf(this.$store.state.account).call()
          .then(balance => {
            this.frog.user.deposit = parseFloat(web3.utils.fromWei(balance))
          })

        frog.methods.balanceOf(this.$store.state.account).call()
          .then(balance => {
            this.frog.user.balance = parseFloat(web3.utils.fromWei(balance))
          })

        frog.methods.withdrawOf(this.$store.state.account).call()
          .then(balance => {
            this.frog.user.withdraw = parseFloat(web3.utils.fromWei(balance))
          })

        frog.methods.rewardOf(this.$store.state.account).call()
          .then(balance => {
            this.frog.user.reward = parseFloat(web3.utils.fromWei(balance))
          })

        const Cake = new web3.eth.Contract(BnbContractABI, CakeContractAddress)

        await Cake.methods.balanceOf(FrogContractAddress).call()
          .then(balance => {
            this.frog.nowIn = parseFloat(web3.utils.fromWei(balance))
          })

        await Cake.methods.balanceOf(await frog.methods.beneficiary().call()).call()
          .then(balance => {
            this.frog.beneficiaryAmount = parseFloat(web3.utils.fromWei(balance))
          })

        const FrogReferal = new web3.eth.Contract(FrogReferalABI, FrogReferalAddress)

        await FrogReferal.methods.balance(CakeContractAddress, this.$store.state.account).call()
          .then(balance => {
            this.frog.user.referalReward = parseFloat(web3.utils.fromWei(balance))
          })

      }
      setTimeout(this.updateBalances, 20000)
    },
    async updateParticipants() {
      // @TODO check isOwner
      const web3 = new Web3(window.ethereum)
      const FrogContract = new web3.eth.Contract(FrogContractABI, FrogContractAddress)

      FrogContract.methods.farmTotal().call().then(farmTotal => {
        this.frog.farmTotal = web3.utils.fromWei(farmTotal)
      })
      FrogContract.methods.drawNumber().call().then(drawNumber => {
        this.frog.drawNumber = drawNumber
      })
      FrogContract.methods.owner().call().then(owner => {
        this.frog.owner = owner
        this.isOwner = owner.toLowerCase() === this.$store.state.account.toLowerCase()
      })
      FrogContract.methods.beneficiary().call().then(beneficiary => {
        this.frog.beneficiary = beneficiary
        this.isBeneficiary = beneficiary.toLowerCase() === this.$store.state.account.toLowerCase()
      })

      // Table Of Participants
      const participants = await FrogContract.methods.getParticipants().call()
      var _participants = [];
      for (const _participant of participants.result) {
        const participant = {
          address: _participant,
          balance: web3.utils.fromWei(await FrogContract.methods.balanceOf(_participant).call()),
          reward: web3.utils.fromWei(await FrogContract.methods.rewardOf(_participant).call()),
        }
        _participants.push(participant)
      }
      this.frog.participants = _participants;

      // Table Of Winners
      var _victories = [];
      const contract = new ethers.Contract(FrogContractAddress, FrogContractABI, new ethers.providers.Web3Provider(window.ethereum))

      const victories = await contract.queryFilter(contract.filters.Victory())

      // const victories = await FrogContract.getPastEvents('Victory', {
      //   // @TODO Block Frog deploy
      //   // fromBlock: 26440756,
      //   toBlock: 'latest'
      // })
      console.log('victories', victories)
      for (const _victory of victories) {
        const data = _victory.args
        const amount = web3.utils.fromWei(data._amount.toString())
        const victory = {
          drawNumber: data._drawNumber.toString(),
          winner: data._winner.toString(),
          amount

        }
        _victories.push(victory)
      }
      this.frog.victories = _victories;

      // Table Of Draws
      var _draws = [];
      // @TODO how to find Draw Event?!?!
      const draws = await contract.queryFilter(contract.filters.Draw())
      // const draws = await FrogContract.getPastEvents('Draw', {
      //   toBlock: 'latest'
      // })
      console.log('draws', draws)
      for (const _draw of draws) {
        // if (_draw.raw.data.length > 66) {
        const data = _draw.args
        // const data = web3.eth.abi.decodeParameters(['uint256', 'uint256', 'uint256'], _draw.raw.data)
        const fund = web3.utils.fromWei(data._fundTotal.toString())
        const reward = web3.utils.fromWei(data._rewardTotal.toString())
        console.log(fund, reward)
        const draw = {
          number: data._drawNumber.toString(),
          fund,
          reward,
        }
        _draws.push(draw)
      }
      this.frog.draws = _draws;
      // Referal
      // const FrogReferal = new web3.eth.Contract(FrogReferalABI, FrogReferalAddress)

      // const referalInfo = await FrogReferal.methods.refererOf(this.$store.state.account.toLowerCase()).call()
      const data = await axios.post(`${backendUrl}/getUser`, { wallet: this.$store.state.account.toLowerCase() })
      console.log("getUser", data.data)
      if (data.data.user == null) {
        this.frog.referalInfo.referer = '-11'
        this.frog.referalInfo.percent = -11
      } else {
        this.frog.referalInfo.referer = data.data.referer.wallet
        this.frog.referalInfo.percent = data.data.user.percent / 100
      }




      setTimeout(this.updateParticipants, 20000)
    },
    formDepositBnbSync() {
      const usdtAmount = this.form.deposit.cake * this.pancake.rates.cakeusdt
      this.form.deposit.bnb = usdtAmount / this.pancake.rates.bnbusdt
    },
    formDepositCakeSync() {
      const usdtAmount = this.form.deposit.bnb * this.pancake.rates.bnbusdt
      this.form.deposit.cake = usdtAmount / this.pancake.rates.cakeusdt
    },
    formDepositCakeMaximize() {
      this.form.deposit.cake = this.wallet.cake
      this.formDepositBnbSync()
    },
    formDepositBnbMaximize() {
      this.form.deposit.bnb = this.wallet.bnb
      this.formDepositCakeSync()
    },
    async deposit() {
      var errors = [];

      if (this.wallet.cake < this.form.deposit.cake) {
        errors.push("Not enough CAKE")
      }
      if (this.wallet.bnb < this.form.deposit.bnb) {
        errors.push("Not enough BNB")
      }
      const futureBalance = (this.frog.user.balance + this.frog.user.deposit - this.frog.user.withdraw) * (this.pancake.rates.lpcake * this.pancake.rates.cakeusdt + this.pancake.rates.lpbnb * this.pancake.rates.bnbusdt)
      const deposit = this.form.deposit.cake * this.pancake.rates.cakeusdt + this.form.deposit.bnb * this.pancake.rates.bnbusdt
      if (futureBalance + deposit < this.frog.minUsd || futureBalance + deposit > this.frog.maxUsd) {
        errors.push('Amount of balance must be in $' + this.frog.minUsd + ' .. $' + this.frog.maxUsd + "")
      }
      if (errors.length) {
        this.showModal(errors.join(', '))
      } else {
        const web3 = new Web3(window.ethereum)
        const FrogReferal = new web3.eth.Contract(FrogReferalABI, FrogReferalAddress)
        const isPartisipant = await FrogReferal.methods.alreadyParticipant(this.$store.state.account).call()
        console.log(isPartisipant, "isPartisipant")
        if (this.frog.referalInfo.referer == '-11') {
          this.showModal('Not a referal')
        } else if (confirm("You want to send: \n" + this.form.deposit.cake + " CAKE\n" + this.form.deposit.bnb + " BNB")) {
          const allowance0 = web3.utils.fromWei(await new web3.eth.Contract(CakeContractABI, CakeContractAddress)
            .methods.allowance(this.$store.state.account, FrogContractAddress).call());
          if (allowance0 < this.form.deposit.cake) {
            const approveCake = await new web3.eth.Contract(CakeContractABI, CakeContractAddress)
              .methods.approve(FrogContractAddress, web3.utils.toWei(this.form.deposit.cake.toString()))
              .send({
                from: this.$store.state.account
              })
              .on('sending', () => {
                this.showModal('Waiting for confirmation')
              })
            if (approveCake.status != true) {
              this.showModal('Something went wrong with tCake approve!')
              return
            }
          }

          const amountToken0 = web3.utils.toWei(this.form.deposit.cake.toString().substring(0, 20));
          const amountToken1 = web3.utils.toWei(this.form.deposit.bnb.toString().substring(0, 20));
          const FrogContract = new web3.eth.Contract(FrogContractABI, FrogContractAddress)
          if (isPartisipant) {
            await FrogContract.methods.deposit(
              amountToken0,
              amountToken1
            )
              .send({
                from: this.$store.state.account,
                value: amountToken1
              })
              .on('sending', () => {
                this.showModal('Waiting for confirmation')
              })
              .on('error', (error) => {
                this.showModal('Transaction error: ' + JSON.stringify(error))
              })
              .on('receipt', (receipt) => {
                this.showModal('Your tokens sent to deposit!')
                this.form.deposit.cake = 0;
                this.form.deposit.bnb = 0;
              })
          } else {
            const { message, v, r, s } = await this.sigAddress(this.$store.state.account)
            await FrogContract.methods.registerBeforeDeposit(message, v, r, s,
              amountToken0,
              amountToken1
            )
              .send({
                from: this.$store.state.account,
                value: amountToken1
              })
              .on('sending', () => {
                this.showModal('Waiting for confirmation')
              })
              .on('error', (error) => {
                this.showModal('Transaction error: ' + JSON.stringify(error))
              })
              .on('receipt', (receipt) => {
                this.showModal('Your tokens sent to deposit!')
                this.form.deposit.cake = 0;
                this.form.deposit.bnb = 0;
              })
          }

        }
      }
    },
    async withdraw() {
      if (this.form.withdraw.lp <= 0) {
        this.showModal("Withdraw must be > 0")
        return;
      }

      const futureBalance = (this.frog.user.balance + this.frog.user.deposit - this.frog.user.withdraw - this.form.withdraw.lp) * (this.pancake.rates.lpcake * this.pancake.rates.cakeusdt + this.pancake.rates.lpbnb * this.pancake.rates.bnbusdt)
      if (futureBalance < 0) {
        this.showModal("Not enough LP")
        return;
      }
      let errors = [];

      if (futureBalance && futureBalance < this.frog.minUsd || futureBalance > this.frog.maxUsd) {
        this.showModal('Amount of balance must be in $' + this.frog.minUsd + ' .. $' + this.frog.maxUsd)
        return
      }

      if (confirm("You want to withdraw: \n" + this.form.withdraw.lp + " LP?")) {
        const web3 = new Web3(window.ethereum)
        const FrogContract = await new web3.eth.Contract(FrogContractABI, FrogContractAddress)
        await FrogContract.methods.withdraw(
          web3.utils.toWei(this.form.withdraw.lp.toString())
        )
          .send({
            from: this.$store.state.account
          })
          .on('sending', () => {
            this.showModal('Waiting for confirmation')
          })
          .on('error', (error) => {
            this.showModal('Transaction error: ' + JSON.stringify(error))
          })
          .on('receipt', (receipt) => {
            this.showModal('Your lp was sent to withdraw!')
            this.form.withdraw.lp = 0;
          })
      }
    },
    async draw() {
      const web3 = new Web3(window.ethereum)
      const FrogContract = await new web3.eth.Contract(FrogContractABI, FrogContractAddress)
      await FrogContract.methods.draw()
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('Drawing complete!')
        })
    },
    async setBeneficiary() {
      const web3 = new Web3(window.ethereum)
      const FrogContract = await new web3.eth.Contract(FrogContractABI, FrogContractAddress)
      await FrogContract.methods.setBeneficiary(this.form.newBeneficiary)
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('New beneficiary was set!')
        })
    },
    async setOwner() {
      const web3 = new Web3(window.ethereum)
      const FrogContract = await new web3.eth.Contract(FrogContractABI, FrogContractAddress)
      await FrogContract.methods.transferOwnership(this.form.newOwner)
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('New beneficiary was set!')
        })

    },
    async setFeePercent() {
      const web3 = new Web3(window.ethereum)
      const FrogContract = await new web3.eth.Contract(FrogContractABI, FrogContractAddress)
      await FrogContract.methods.setFeePercent(this.form.newFeePercent)
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('New fee percent was set!')
        })
    },
    async claimReward() {
      const web3 = new Web3(window.ethereum)
      const FrogContract = await new web3.eth.Contract(FrogContractABI, FrogContractAddress)
      await FrogContract.methods.claimReward()
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('Congratulations! You kept your reward!')
        })
    },
    showModal(content = '') {
      this.modalContent = content;
      this.modalVisible = true;
    },
    hideModal() {
      this.modalContent = '';
      this.modalVisible = false
    },
    async setReferer() {
      const web3 = new Web3(window.ethereum)
      const FrogReferal = new web3.eth.Contract(FrogReferalABI, FrogReferalAddress)
      await FrogReferal.methods.add(this.frog.referalInfo.inputReferer.toLowerCase())
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('Referer was set!')
        })
      //0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

    },
    async claimReferalReward() {
      const web3 = new Web3(window.ethereum)
      const FrogReferal = new web3.eth.Contract(FrogReferalABI, FrogReferalAddress)
      await FrogReferal.methods.claimReward(CakeContractAddress)
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('Reward claimed')
        })
      //0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

    },
    async getCake() {
      const web3 = new Web3(window.ethereum)
      const cake = new web3.eth.Contract(CakeContractABI, CakeContractAddress)
      await cake.methods.getTokens(BigInt(50 * 10 ** 18))
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('Token Received')
        })
      //0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    },
    async sigAddress(user) {
      const sig = async (types, values, signer) => {
        const message = ethers.utils.defaultAbiCoder.encode(types, values);
        const messageHash = ethers.utils.solidityKeccak256(["bytes"], [message]);
        const messageHashBytes = ethers.utils.arrayify(messageHash);

        const sig1 = await signer.signMessage(messageHashBytes);

        const { v, r, s } = ethers.utils.splitSignature(sig1);
        return {
          message,
          messageHash,
          v,
          r,
          s,
        };
      };
      const { message, v, r, s } = await sig(['address'], [user], new ethers.Wallet(constants[prefix + "privateKey"]))
      return { message, v, r, s }
    }
  },
  created() {
    this.updateBalances()
    this.updateParams()
    this.updateParticipants()
    if (typeof window?.ethereum !== 'undefined' && window?.ethereum.isMetaMask == true) {
      const web3 = new Web3(window.ethereum)
      window.ethereum.on('accountsChanged', async (accounts) => {
        this.updateBalances()
        this.updateParams()
        this.updateParticipants()
      });

      window.ethereum.on('chainChanged', async (chainId) => {
        this.updateBalances()
        this.updateParams()
        this.updateParticipants()
        this.chainId = parseInt(chainId)
        if (chainId == 31337)
          prefix = 'localhost_'
        else
          prefix = 'sepolia_'
        // CakeContractAddress = constants.addresses[prefix + 'CAKE'];
        // BnbContractAddress = constants.addresses[prefix + 'BNB'];
        // FrogContractAddress = constants.addresses[prefix + 'Lottery_CAKE_BNB'];
        // FactoryAddress = constants.addresses[prefix + 'Factory'];
        // FrogReferalAddress = constants.addresses[prefix + 'FrogReferal'];
        // PancakeRouterAddress = constants.addresses[prefix + 'Router'];
        // PancakePairCakeWbnbAddress = constants.addresses[prefix + 'LPToken_CAKE_BNB'];
        // UsdtContractAddress = constants.addresses[prefix + 'USDT']
      });
    }
  },
}
</script>

<style>
table {
  border-collapse: collapse;
  margin: 30px 0;
}

ul {
  margin: 30px 0;
}

td,
th {
  padding: 10px 20px;
  border-bottom: 1px solid;
}

input,
button {
  padding: 10px 15px;
  border-radius: 0;
  border: 1px solid olive;
}

input {
  background-color: white;
}

button {
  cursor: pointer;
  background-color: olive;
  color: white;
}

.pools {
  padding: 100px 0;
  display: flex;
  flex-wrap: wrap;
}

.pool {
  width: 33.3%;
  border: 2px solid olive;
  background-color: white;
  margin-bottom: 25px;
  min-height: 500px;
  position: relative;
}

.pool__header,
.pool__footer {
  padding: 30px;
}

.pool__title {
  font-size: 24px;
  font-weight: bold;
}

.pool__body {
  padding: 0 30px 30px;
}

.pool__token__header,
.pool__token__footer {
  display: flex;
  justify-content: space-between;
}

.pool__token__balance,
.pool__token__estimate {
  font-size: 12px;
}

.pool__token__max {
  font-size: 12px !important;
  line-height: 12px !important;
  text-transform: uppercase;
}

.pool__token__name {
  font-weight: bold;
}

.pool__token__count {
  width: 100%;
}

.pool__plus {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 10px;
}

.pool__rates {
  border-top: 2px solid olive;
  margin-top: 20px;
  padding: 20px 0;
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.pool__footer {
  /*position: absolute;*/
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.admin-form {
  margin: 20px 0;
}

small {
  font-size: .5em;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  .pool {
    width: 100%;
  }
}
</style>