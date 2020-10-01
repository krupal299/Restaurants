import {RestaurantActions} from '../actions';
import Globals from '../../utils/Globals';
import axios from 'axios';
const Realm = require('realm');

const ImageSchema = {
  name: 'Image',
  properties: {
    id: {type: 'int', default: 0},
    main_id: {type: 'int', default: 0},
    image: 'string',
  },
};

const RestaurantSchema = {
  name: 'Restaurant',
  properties: {
    id: {type: 'int', default: 0},
    title: 'string',
    phone_no: {type: 'int', default: 0},
    description: 'string',
    rating: {type: 'int', default: 0},
    address: 'string',
    city: 'string',
    state: 'string',
    country: 'string',
    pincode: {type: 'int', default: 0},
    long: 'string',
    lat: 'string',
    img: {type: 'list', objectType: 'Image'},
  },
};

export default class RestaurantMiddleware {
  static getListMiddleware() {
    return (dispatch) => {
      dispatch(RestaurantActions.startLoading());

      Realm.open({schema: [ImageSchema, RestaurantSchema]}).then((realm) => {
        let restaurants = realm.objects('Restaurant');
        console.log(
          'RestaurantMiddleware -> getListMiddleware -> restaurants',
          restaurants.length,
        );

        if (restaurants.length > 0) {
          
          var data = [];
          restaurants.forEach((restau) => {
            var obj = {};
            obj.id = restau.id;
            obj.title = restau.title;
            obj.phone_no = restau.phone_no;
            obj.description = restau.description;
            obj.rating = restau.rating;
            obj.address = restau.address;
            obj.city = restau.city;
            obj.state = restau.state;
            obj.country = restau.country;
            obj.pincode = restau.pincode;
            obj.long = restau.long;
            obj.lat = restau.lat;
            var img = [];
            restau.img.forEach((image) => {
              var imageObj = {};
              imageObj.id = image.id;
              imageObj.main_id = image.main_id;
              imageObj.image = image.image;
              img.push(imageObj);
            });
            obj.img = img;
            data.push(obj);
          });
          dispatch(RestaurantActions.getListSuccess(data));
          dispatch(RestaurantActions.stopLoading());
        } else {
          console.log('RestaurantMiddleware -> getListMiddleware -> else');
          fetch(Globals.url)
            .then((response) => response.json())
            .then((res) => {
              if (res.status === 200) {
                Realm.open({schema: [ImageSchema, RestaurantSchema]}).then(
                  (realm) => {
                    // Add persons and their cars
                    realm.write(() => {
                      res.data.forEach((ele) => {
                        let restaurant = realm.create('Restaurant', {
                          id: ele.id,
                          title: ele.title,
                          phone_no: ele.phone_no,
                          description: ele.description,
                          rating: ele.rating === null ? 0 : ele.rating,
                          address: ele.address,
                          city: ele.city,
                          state: ele.state,
                          country: ele.country,
                          pincode: ele.pincode,
                          long: ele.long,
                          lat: ele.lat,
                          img: [],
                        });
                        ele.img.forEach((image) => {
                          restaurant.img.push({
                            id: image.id,
                            main_id: image.main_id,
                            image: image.image,
                          });
                        });
                      });
                    });
                  },
                );

                dispatch(RestaurantActions.getListSuccess(res.data));
                dispatch(RestaurantActions.stopLoading());
              } else {
                dispatch(RestaurantActions.stopLoading());
                dispatch(
                  RestaurantActions.getListFailed('Something went wrong'),
                );
              }
            })
            .catch((error) => {
              dispatch(RestaurantActions.stopLoading());
              dispatch(RestaurantActions.getListFailed(error));
            });
        }
        realm.close();
      });
    };
  }
}
