import React, {Component} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import RestaurantMiddleware from '../../store/middleware/restaurantMiddleware';
import RestaurantActions from '../../store/actions/restaurantActions';
import Loader from '../../components/loader';
import StarRating from 'react-native-star-rating';
import ProgressiveImage from '../../components/progressiveImage';
import Globals from '../../utils/Globals';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  async componentDidMount() {
    this.props.startLoading();
    this.props.getList();
  }

  _renderItem = ({item}) => {
    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('About', {item});
          }}>
          <View style={{margin: 10, flexDirection: 'row'}}>
            <View style={{flex: 0.2}}>
              <ProgressiveImage
                style={styles.image}
                source={{uri: item.img[0].image}}
                thumbnail={require('../../assets/images/img.png')}
              />
            </View>
            <View style={{flex: 0.6, alignSelf: 'center'}}>
              <Text style={{fontSize: 13}}>{item.title}</Text>
              <View style={{width: 100, marginTop: 5}}>
                <StarRating
                  disabled={true}
                  maxStars={5}
                  rating={item.rating}
                  starSize={15}
                  fullStarColor={Globals.Colors.yellow}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('Map', {
                  item: item,
                  lat: item.lat,
                  long: item.long,
                });
              }}
              style={{flex: 0.2, justifyContent: 'center'}}>
              <View style={styles.green}>
                <Image
                  source={require('../../assets/images/map.png')}
                  resizeMode="contain"
                  style={{width: 20, height: 20, alignSelf: 'center'}}
                />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  keyExtractor = (item, index) => index.toString();

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.error !== prevProps.error) {
      // this.refs.toast.show('Something went wrong, Please try again.', 2000);
      console.log('something went wrong');
    } else if (this.props.data !== prevProps.data) {
      var responseData = this.props.data;
      console.log(
        'componentDidUpdate -> responseData',
        JSON.stringify(responseData),
      );

      this.setState({data: responseData});
    }
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <StatusBar translucent backgroundColor="transparent" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Restaurant List</Text>
        </View>
        <FlatList
          contentContainerStyle={styles.flatList}
          data={this.state.data}
          renderItem={this._renderItem}
          keyExtractor={this.keyExtractor}
        />

        {this.props.isLoading ? <Loader /> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    justifyContent: 'center',
    backgroundColor: Globals.Colors.green,
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

const mapStateToProps = (state) => {
  return {
    isLoading: state.RestaurantReducer.isLoading,
    error: state.RestaurantReducer.error,
    data: state.RestaurantReducer.data,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getList: (data) => dispatch(RestaurantMiddleware.getListMiddleware(data)),
    startLoading: () => dispatch(RestaurantActions.startLoading()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
