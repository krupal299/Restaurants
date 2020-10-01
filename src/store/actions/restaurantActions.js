import {START_LOADING, STOP_LOADING, GET_LIST} from '../actionTypes';

export default class RestaurantActions {
  static startLoading() {
    return {
      type: START_LOADING,
    };
  }
  static stopLoading() {
    return {
      type: STOP_LOADING,
    };
  }
  static getListSuccess(data) {
    return {
      type: GET_LIST,
      data,
    };
  }

  static getListFailed(error) {
    return {
      type: GET_LIST,
      error,
    };
  }
}
