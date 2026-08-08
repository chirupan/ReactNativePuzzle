import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { Button } from './Button';

// props for Toggle button
export interface ToggleProps {
  options: number[],
  value: number,
  onChange: (x: number) => void
}

// Toggle component
export function Toggle({ 
  options, 
  value, 
  onChange 
}: ToggleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Size</Text>
      <View style={styles.buttons}>
        {options.map((option, index) => {
          const style = {
            marginLeft: index % 2 === 1 ? 10 : 0,
            marginTop: index >= 2 ? 10 : 0,
          };

          return (
            <View key={option} style={[styles.item, style]}>
              <Button
                title={option.toString()}
                disabled={option !== value}
                onPress={() => onChange(option)}
                color={'#69B8FF'}
                height={100}
                fontSize={36}
                borderRadius={12}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 210,
  },
  item: {
    width: 100,
  },
  title: {
    fontSize: 24,
    lineHeight: 24,
    color: '#69B8FF',
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
});
