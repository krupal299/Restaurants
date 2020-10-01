import {START_LOADING, STOP_LOADING, GET_LIST} from '../actionTypes';

const initialState = {
  isLoading: false,
  data: [],
  error: null,
};

export default function RestaurantReducer(state = initialState, action) {
  switch (action.type) {
    case START_LOADING:
      return {...state, isLoading: true};
    case STOP_LOADING:
      return {...state, isLoading: false};
    case GET_LIST:
      return {...state, data: action.data};
    default:
      return state;
  }
}
