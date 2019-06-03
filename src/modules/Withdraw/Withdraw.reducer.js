import withdrawInitialState from '../../common/data/withdraw'
import reducerUtil from '../../common/utils/reducer'
import {
  onReceiveTransactionInfoAction,
  checkTransactionStatusAction,
  onStartProgressAction,
  hideAction,
} from '../TransactionStatus/TransactionStatus.recuder'
import { TYPE_WITHDRAW } from '../TransactionStatus/TransactionStatus.utilities'
import { showAlertAction } from '../Alert/Alert.reducer'

import BlockchainSDK from '../../common/blockchain'

const SHOW_WITHDRAW_AFTER_CHECK = 'WITHDRAW_SHOW_WITHDRAW_AFTER_CHECK'
const CLOSE_WITHDRAW = 'WITHDRAW_CLOSE_WITHDRAW'
const ON_INPUT_SNT_VALUE = 'WITHDRAW_ON_INPUT_SNT_VALUE'

export const showWithdrawAfterCheckAction = dapp => {
  window.location.hash = 'withdraw'
  return {
    type: SHOW_WITHDRAW_AFTER_CHECK,
    payload: dapp,
  }
}

export const showWithdrawAction = dapp => {
  return (dispatch, getState) => {
    const state = getState()
    if (
      state.transactionStatus.progress &&
      state.transactionStatus.dappTx !== ''
    ) {
      dispatch(
        showAlertAction(
          'There is an active transaction. Please wait for it to finish and then you could be able to create your Ðapp',
        ),
      )
    } else dispatch(showWithdrawAfterCheckAction(dapp))
  }
}

export const closeWithdrawAction = () => {
  window.history.back()
  return {
    type: CLOSE_WITHDRAW,
    payload: null,
  }
}

export const withdrawAction = (dapp, sntValue) => {
  return async dispatch => {
    dispatch(closeWithdrawAction())
    dispatch(
      onStartProgressAction(
        dapp.name,
        dapp.image,
        'Status is an open source mobile DApp browser and messenger build for #Etherium',
        TYPE_WITHDRAW,
      ),
    )
    try {
      const blockchain = await BlockchainSDK.getInstance()
      const tx = await blockchain.DiscoverService.withdraw(dapp.id, sntValue)
      dispatch(onReceiveTransactionInfoAction(dapp.id, tx))
      dispatch(checkTransactionStatusAction(tx))
    } catch (e) {
      dispatch(hideAction())
      dispatch(showAlertAction(e.message))
    }
  }
}

export const onInputSntValueAction = sntValue => ({
  type: ON_INPUT_SNT_VALUE,
  payload: sntValue,
})

const showWithdrawAfterCheck = (state, dapp) => {
  return Object.assign({}, state, {
    visible: true,
    dapp,
    sntValue: dapp.sntValue.toString(),
  })
}

const closeWithdraw = state => {
  return Object.assign({}, state, {
    visible: false,
    dapp: null,
  })
}

const onInputSntValue = (state, sntValue) => {
  return Object.assign({}, state, {
    sntValue,
  })
}

const map = {
  [SHOW_WITHDRAW_AFTER_CHECK]: showWithdrawAfterCheck,
  [CLOSE_WITHDRAW]: closeWithdraw,
  [ON_INPUT_SNT_VALUE]: onInputSntValue,
}

export default reducerUtil(map, withdrawInitialState)
