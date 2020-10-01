import React, {Component, PropTypes} from 'react';
import {Animated, View, Image} from 'react-native';

export default class progressiveImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      thumbnailOpacity: new Animated.Value(0),
    };
  }

  onLoad() {
    Animated.timing(this.state.thumbnailOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  onThumbnailLoad() {
    Animated.timing(this.state.thumbnailOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  render() {
    return (
      <View
        style={[this.props.style, {padding: 0}]}
        backgroundColor={'#ffffff'}>
        <Animated.Image
          resizeMode={'contain'}
          key={this.props.key}
          style={[
            {
              position: 'absolute',
              opacity: this.state.thumbnailOpacity,
              height: this.props.style.height,
              width: this.props.style.width,
              overflow: 'hidden',
            },
          ]}
          source={this.props.thumbnail}
          onLoad={(event) => this.onThumbnailLoad(event)}
        />

        <Animated.Image
          resizeMode={'cover'}
          key={this.props.key}
          style={[{position: 'absolute'}, this.props.style]}
          source={this.props.source}
          onLoad={(event) => this.onLoad(event)}
        />
      </View>
    );
  }
}
