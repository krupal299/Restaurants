import {combineReducers} from 'redux';
import RestaurantReducer from './restaurantReducer';

const RootReducer = combineReducers({
  RestaurantReducer,
});

export default RootReducer;
