import React, {Component} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  FlatList,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Loader from '../../components/loader';
import ProgressiveImage from '../../components/progressiveImage';
import Globals from '../../utils/Globals';
import StarRating from 'react-native-star-rating';
import {SliderBox} from 'react-native-image-slider-box';
import {ScrollView} from 'react-native-gesture-handler';

export default class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: this.props.route.params.item,
    };
  }

  render() {
    const images = this.state.item.img.map((item) => item.image);
    return (
      <View style={{flex: 1}}>
        <ScrollView>
          <StatusBar translucent backgroundColor="transparent" />
          <SliderBox images={images} sliderBoxHeight={250} />
          <View style={styles.backView}>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.goBack();
              }}>
              <Text style={styles.back}>Back</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>{this.state.item.title}</Text>
          <Text style={styles.phone}>{this.state.item.phone_no}</Text>
          <View style={styles.rating}>
            <View style={{width: 100, marginTop: 5}}>
              <StarRating
                disabled={true}
                maxStars={5}
                rating={this.state.item.rating}
                starSize={15}
                fullStarColor={Globals.Colors.yellow}
              />
            </View>
            <Text style={styles.reviews}>(1000 Reviews)</Text>
          </View>
          <Text style={styles.des}>Description</Text>
          <Text style={styles.desc}>{this.state.item.description}</Text>
          <Text style={styles.des}>Address</Text>
          <Text style={styles.desc}>
            {this.state.item.address +
              ' ' +
              this.state.item.city +
              ' ' +
              this.state.item.state +
              ' ' +
              this.state.item.country +
              ' ' +
              this.state.item.pincode}
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  desc: {
    fontSize: 13,
    marginHorizontal: 15,
    marginTop: 5,
  },
  des: {
    fontSize: 15,
    fontWeight: 'bold',
    marginStart: 15,
    marginTop: 15,
  },
  reviews: {
    marginStart: 10,
    fontSize: 12,
    alignSelf: 'center',
  },
  rating: {
    marginStart: 15,
    marginTop: 5,
    flexDirection: 'row',
  },
  phone: {
    fontSize: 15,
    marginStart: 15,
    marginTop: 5,
    color: 'gray',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginStart: 15,
    marginTop: 15,
  },
  back: {
    color: 'white',
    alignSelf: 'center',
  },
  backView: {
    position: 'absolute',
    top: 30,
    left: 15,
    width: 50,
    height: 15,
    borderRadius: 5,
    justifyContent: 'center',
  },
});
