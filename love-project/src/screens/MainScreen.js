import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const MainScreen = () => {
    const navigation = useNavigation();


    return(
        <View style={[styles.container]}>
            <Text>
                메인화면
            </Text>
            
            {/* 매칭화면 */} 
            <TouchableOpacity 
                style={[styles.button]} 
                onPress={() => navigation.navigate("MatchingScreen", { screen: 'MatchingScreen' })}> 
                <Text style={styles.BtnText}>매칭화면</Text>
            </TouchableOpacity> 

            {/* 대화 시뮬레이션 화면 */} 
            <TouchableOpacity 
                style={[styles.button]} 
                onPress={() => navigation.navigate("ConversationScreen", { screen: 'ConversationScreen' })}> 
                <Text style={styles.BtnText}>대화 시뮬레이션 화면</Text>
            </TouchableOpacity> 

            {/* 코디 화면 */} 
            <TouchableOpacity 
                style={[styles.button]} 
                onPress={() => navigation.navigate("CoordinationScreen", { screen: 'CoordinationScreen' })}> 
                <Text style={styles.BtnText}>코디 화면</Text>
            </TouchableOpacity> 

            {/* 프로필 화면 */} 
            <TouchableOpacity 
                style={[styles.button]} 
                onPress={() => navigation.navigate("ProfileScreen", { screen: 'ProfileScreen' })}> 
                <Text style={styles.BtnText}>프로필 화면</Text>
            </TouchableOpacity> 

            {/* 설정 화면 */} 
            <TouchableOpacity 
                style={[styles.button]} 
                onPress={() => navigation.navigate("SettingScreen", { screen: 'SettingScreen' })}> 
                <Text style={styles.BtnText}>설정 화면</Text>
            </TouchableOpacity> 
        </View>
    );
};

const styles = StyleSheet.create({ 
    container: { 
        flex: 1, 
        justifyContent: 'flex-start', 
    }, 
    button: { 
        margin: 10,
        marginTop:20,
        backgroundColor: "#009688",
        padding: 10,
        width: "110%",
        alignSelf: "center",
        borderRadius: 10
    }, 
    BtnText: {
        fontWeight: 'bold',
        fontSize:16,
        textAlign: 'center',
        color: 'white',
        paddingTop:7,
        height:30
      },
});

export default MainScreen;