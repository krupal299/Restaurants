import React, {Component} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  PermissionsAndroid,
  ToastAndroid,
  Linking,
  TouchableOpacity,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import Loader from '../../components/loader';
import Globals from '../../utils/Globals';
import MapView, {Marker} from 'react-native-maps';
import Polyline from '@mapbox/polyline';
import StarRating from 'react-native-star-rating';
import Geolocation from 'react-native-geolocation-service';

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 22.5520191;
const LONGITUDE = 72.9205399;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const HORIZONTAL_PADDING = 120;
const VERTICAL_PADDING = 80;
const DEFAULT_PADDING = {
  top: VERTICAL_PADDING,
  right: HORIZONTAL_PADDING,
  bottom: VERTICAL_PADDING,
  left: HORIZONTAL_PADDING,
};
const zoomLevel = 12;

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: this.props.route.params.item,
      markers: [],
      coOrdinates: [],
      currentLat: LATITUDE,
      currentLong: LONGITUDE,
      destLat: this.props.route.params.lat,
      destLong: this.props.route.params.long,
    };

    this.mapView = null;
  }

  async componentDidMount() {
    // this.getDirections(
    //   this.state.currentLat + ',' + this.state.currentLong,
    //   this.state.item.lat + ',' + this.state.item.long,
    // );

    this.getLocation();
  }

  async hasLocationPermissionIOS() {
    const openSetting = () => {
      Linking.openSettings().catch(() => {
        Alert.alert('Unable to open settings');
      });
    };
    const status = await Geolocation.requestAuthorization('whenInUse');

    if (status === 'granted') {
      return true;
    }

    if (status === 'denied') {
      Alert.alert('Location permission denied');
      // BackHandler.exitApp();
    }

    if (status === 'disabled') {
      Alert.alert(
        `Turn on Location Services to allow PharmaLogix to determine your location.`,
        '',
        [
          {text: 'Go to Settings', onPress: openSetting},
          {
            text: "Don't Use Location",
            onPress: () => {
              // BackHandler.exitApp();
            },
          },
        ],
      );
    }

    return false;
  }

  async hasLocationPermission() {
    if (Platform.OS === 'ios') {
      const hasPermission = await this.hasLocationPermissionIOS();
      return hasPermission;
    }

    if (Platform.OS === 'android' && Platform.Version < 23) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'Location permission denied by user.',
        ToastAndroid.LONG,
      );
      BackHandler.exitApp();
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Location permission revoked by user.',
        ToastAndroid.LONG,
      );
      this.openLocationSettingsForAndroid();
    }

    return false;
  }

  async getLocation() {
    console.log('Collections -> getLocation -> getLocation');
    const hasLocationPermission = await this.hasLocationPermission();

    if (!hasLocationPermission) {
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        console.log(
          'TCL: CourierDetail -> getGeoLocation -> position',
          JSON.stringify(position),
        );

        this.setState({
          currentLat: position.coords.latitude,
          currentLong: position.coords.longitude,
        });

        this.getDirections(
          position.coords.latitude + ',' + position.coords.longitude,
          this.state.item.lat + ',' + this.state.item.long,
        );
      },
      (error) => {
        console.log(error);
      },
      {
        enableHighAccuracy: this.state.highAccuracy,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: this.state.forceLocation,
        showLocationDialog: this.state.showLocationDialog,
      },
    );
  }

  async getDirections(startLoc, destinationLoc) {
    console.log('TCL: MapScreen -> getDirections -> getDirections');
    try {
      let resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${Globals.MAP.API_KEY}&mode=${Globals.MAP.MODE}`,
      );
      let respJson = await resp.json();
        console.log(
          'TCL: MapScreen -> getDirections -> respJson',
          JSON.stringify(respJson),
        );
      if (respJson.status === 'ZERO_RESULTS') {
        console.log('ZERO_RESULTS');
        this.setState({coOrdinates: []});
        this.setState({
          markers: [
            {
              latitude: Number(this.state.currentLat),
              longitude: Number(this.state.currentLong),
            },
            {
              latitude: Number(this.state.destLat),
              longitude: Number(this.state.destLong),
            },
          ],
        });
        this.setState({isLoading: false});

        setTimeout(() => {
          this.mapView.fitToCoordinates(this.state.markers, {
            edgePadding: DEFAULT_PADDING,
            animated: false,
          });
        }, 100);
      } else {
        console.log('ZERO_RESULTS else')

        let points = Polyline.decode(
          respJson.routes[0].overview_polyline.points,
        );
        let coords = points.map((point, index) => {
          return {latitude: point[0], longitude: point[1]};
        });
        console.log('TCL: getDirections -> coords', JSON.stringify(coords));
        this.setState({coOrdinates: coords});

        if (coords.length === 1) {
          this.setState({coOrdinates: []});
        }
        console.log("TCL: getDirections -> coOrdinates", JSON.stringify(this.state.coOrdinates))

        this.setState({
          markers: [
            {
              latitude: Number(coords[0].latitude),
              longitude: Number(coords[0].longitude),
            },
            {
              latitude: Number(this.state.destLat),
              longitude: Number(this.state.destLong),
            },
          ],
        });

        this.mapView.fitToCoordinates(
          coords,
          {
            edgePadding: DEFAULT_PADDING,
            animated: false,
          },
          100,
        );

        // this.fitToCoords(coords)
      }
    } catch (error) {
      this.setState({coOrdinates: []});
      return error;
    }
  }

  showMarker(marker, i) {
    if (i === 0) {
      return (
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            backgroundColor: '#C8E6C9FF',
          }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              justifyContent: 'center',
              alignSelf: 'center',
              backgroundColor: Globals.Colors.green,
            }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                alignSelf: 'center',
                backgroundColor: 'white',
              }}
            />
          </View>
        </View>
      );
    } else {
      return (
        <View>
          <Image
            style={{width: 25, height: 35, alignSelf: 'center'}}
            resizeMode="contain"
            source={require('../../assets/images/shop-pin.png')}
          />
          <MapView.Callout
            style={{width: 180, height: 50, backgroundColor: 'white'}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  flex: 0.3,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                {/* <Text> */}
                <Image
                  style={{
                    width: 40,
                    height: 40,
                    marginTop: 5,
                    marginStart: 5,
                    borderRadius: 5,
                    alignItems: 'center',
                  }}
                  resizeMode="cover"
                  source={{uri: this.state.item.img[0].image}}
                />
                {/* </Text> */}
              </View>
              <View
                style={{
                  flex: 0.7,
                  flexDirection: 'column',
                  marginStart: 5,
                }}>
                <Text>{this.state.item.title}</Text>
                <View style={{width: 100, marginTop: 5}}>
                  <StarRating
                    disabled={true}
                    maxStars={5}
                    rating={this.state.item.rating}
                    starSize={15}
                    fullStarColor={Globals.Colors.yellow}
                  />
                </View>
              </View>
            </View>
          </MapView.Callout>
        </View>
      );
    }
  }

  // downloadEvents() {
  //   const startTime = new Date().getTime();
  //   axios.get('https://YourAPI/YourMethod').then((response) => {
  //     Realm.open(databaseOptions).then((realm) => {
  //       realm.write(() => {
  //         response.data.forEach((obj) => {
  //           if (
  //             realm.objects(EVENTS_SCHEMA).filtered(`EventID=${obj.EventID}`)
  //               .length === 0
  //           ) {
  //             realm.create(EVENTS_SCHEMA, obj);
  //           }
  //         });
  //         this.setState({size: realm.objects(EVENTS_SCHEMA).length});
  //         const endTime = new Date().getTime();
  //         this.setState({runTime: endTime - startTime});
  //       });
  //     });
  //   });
  // }

  render() {
    return (
      <View style={{flex: 1}}>
        <StatusBar translucent backgroundColor="transparent" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Map View</Text>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.goBack();
            }}
            style={styles.backView}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
        </View>
        <MapView
          initialRegion={{
            latitude: LATITUDE,
            longitude: LONGITUDE,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          style={styles.map}
          ref={(c) => (this.mapView = c)}>
          {this.state.markers.map((marker, i) => (
            <Marker.Animated
              key={i}
              style={{
                zIndex: i === 0 ? 2 : 1,
              }}
              ref={(marker) => {
                this.marker = marker;
              }}
              coordinate={marker}>
              {this.showMarker(marker, i)}
            </Marker.Animated>
          ))}

          <MapView.Polyline
            coordinates={this.state.coOrdinates}
            strokeWidth={4}
            strokeColor={Globals.Colors.green}
          />
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  callout: {
    width: 140,
    height: 100,
    backgroundColor: 'white',
  },
  calloutContainer: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },
  calloutHeaderText: {
    fontSize: 18,
  },
  map: {
    flex: 1,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    backgroundColor: Globals.Colors.green,
  },
  backView: {
    position: 'absolute',
    bottom: 10,
    left: 15,
  },
  back: {
    color: 'white',
    fontSize: 14,
  },
  headerTitle: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 10,
  },
  green: {
    width: 35,
    height: 35,
    backgroundColor: Globals.Colors.green,
    borderRadius: 5,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    margin: 5,
    borderRadius: 5,
    shadowColor: 'darkgray',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5,
    overflow: 'hidden',
  },
  flatList: {
    margin: 10,
  },
});
