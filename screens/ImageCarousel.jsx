import React, { useRef, useState } from 'react';
import { View, Image, Dimensions, StyleSheet, Animated, FlatList } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const ImageCarousel = ({ images }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image resizeMode="cover" source={{ uri: item }} style={styles.image} />
          </View>
        )}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />
      {/* Pagination */}
      <View style={styles.pagination}>
        {images.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * screenWidth,
              index * screenWidth,
              (index + 1) * screenWidth,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[styles.paginationDot, { opacity }]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth, // Ensure full width for carousel
    height: 200, // Adjust the height of the carousel
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: screenWidth,
    marginTop:-20,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 15,
    marginBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',

  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'grey',
    marginHorizontal: 4,
    
  },
});

export default ImageCarousel;
