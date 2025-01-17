import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const AvatarScreen = () => {
    const navigation = useNavigation();

    return(
        <View style={[styles.container]}>
            <View style={styles.content}>
                <Text>
                    아바타 생성 화면
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({ 
    container: { 
        flex: 1, 
        justifyContent: 'flex-start', 
    }, 
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AvatarScreen;