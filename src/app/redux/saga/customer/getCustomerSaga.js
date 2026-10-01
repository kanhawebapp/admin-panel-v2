import axios from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import { apiroute, AuthHeader } from "../../config";
import { sendRequestCustomer, FetchCustomerFail, FetchCustomerList } from "../../slices/customer/getCustomer";





const api = () => {
    const token = AuthHeader();
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    return axios.get(apiroute.CUSTOMER_LIST, { headers })
}






function* customerList() {
    try {
        const list = yield call(api);
       if(list?.status === 200){
        yield put(FetchCustomerList(list?.data?.user))
       }else{
        yield put(FetchCustomerFail(list?.data));
       }

    } catch (error) {
        console.log("error", error?.message);

    }
}



export default function* getCustomerSaga() {
    yield takeLatest(sendRequestCustomer.type, customerList);
}