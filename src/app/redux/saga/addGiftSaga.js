import { call, put, takeLatest, all } from "redux-saga/effects";
import axios from "axios";
import { apiroute } from "../config";
import { addGiftFail, addGiftRequest, addGiftSuccess, fetchGiftFail, fetchGiftRequest, fetchGiftSuccess, deleteGiftFail, deleteGiftRequest, deleteGiftSuccess } from "../slices/addGiftSlice";

const apidata = (payload) => {
    return axios.post(apiroute.addGift, payload)
}
const giftListFetch = () => {
    return axios.get(apiroute.giftList)
}

const giftDeleteApi = (id) => {
    return axios.delete(apiroute.giftDelete(id));
}

// add / create gift
function* createAddGiftSaga(action) {
    try {
        const response = yield call(apidata, action.payload.formData);
        yield put(addGiftSuccess(response?.data));
    } catch (error) {
        console.log("erro h ye ", error.message);

        yield put(addGiftFail(error?.message));
    }
};


// fetch gift list 
function* fetchGiftListSaga() {
    try {
        const response = yield call(giftListFetch);
        yield put(fetchGiftSuccess(response?.data));
    } catch (error) {
        yield put(fetchGiftFail(error?.message));
    }
};

// delete gift by id 
function* deleteGiftSaga(action) {
    try {
        const id = action.payload;
        const response = yield call(giftDeleteApi, id);

        yield put(deleteGiftSuccess(response?.data));
    } catch (error) {
        yield put(deleteGiftFail(error?.message));
    }
};

export default function* addGiftSaga() {
    yield takeLatest(addGiftRequest.type, createAddGiftSaga);
    yield takeLatest(fetchGiftRequest.type, fetchGiftListSaga);
    yield takeLatest(deleteGiftRequest.type, deleteGiftSaga);
}