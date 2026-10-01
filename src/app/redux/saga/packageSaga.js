import { takeLatest, put, call } from "redux-saga/effects";
import axios from "axios";
import { apiroute, AuthHeader } from "../config";
import { 
    packageAddSuccessfully,
    packageaddfail,
    sendpackageRequest,
 
} from "../slices/packageSlice";



const apidata = (payload) => {
    const token = AuthHeader();
    const headers = {
        Authorization: `Bearer ${token}`
    };

    console.log("Headers:", headers);

    return axios.post(apiroute.packageAdd, payload, { headers });
};









function* packageAddSaga(action) {
    try {
        const response = yield call(apidata, action.payload);

        yield put(packageAddSuccessfully(response.data.package));

    } catch (error) {
        console.error("Package add error:", error?.message);
        yield put(packageaddfail(error.message));
    }
}

export default function* packageSaga() {
    yield takeLatest(sendpackageRequest.type, packageAddSaga);

}
