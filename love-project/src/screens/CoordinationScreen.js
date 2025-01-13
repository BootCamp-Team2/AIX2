import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CoordinationScreen = () => {
    return(
        <ScrollView>
        <View>
                    <Text style={styles.top}>
                       <Icon name="menu" size={40} color="black" />                                      
                                   
                        <Text style={styles.topText}>            AI 스타일 코디           </Text>                       
                                      
                        <Icon name="check" size={40} color="black" />               
                    </Text>
                    <Text style={styles.main}>
                        나에게 어울리는 스타일을{'\n'}찾아보세요!
                    </Text>
                    
                    <TouchableOpacity style={styles.img} onPress={() => navigation.navigate("IdealTypeImg")}>
                        <Text style={styles.imgText}>
                        적용할 이미지를{'\n'}넣으세요!
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cloth} onPress={() => navigation.navigate("IdealTypeImg")}>
                        <Text style={styles.clothText}>
                        적용할 옷 스타일을{'\n'}입력하세요!
                        </Text>
                    </TouchableOpacity>
        
        
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("IdealTypeImg")}>
                        <Text style={styles.buttonText}>
                            이미지 생성
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.square} />

                    <TouchableOpacity style={styles.down} onPress={() => navigation.navigate("IdealTypeImg")}>
                        <Text style={styles.downText}>
                            이미지 다운로드
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            );
        };
        
        const styles = StyleSheet.create({
          
            top: {
                backgroundColor: '#FFF0F0', 
                alignSelf: 'center',
                marginBottom: 30,  
                padding:15, 
                textAlign:'center', 
                width: '100%',  
                height: 70,

                flexDirection: 'row', // Arrange children in a row
                alignItems: 'center', // Vertically center all items
                justifyContent: 'space-between',
            },


            
        
            topText: { 
                color : 'black',
                alignSelf: 'center',
                fontSize:24,        
                textAlign:'center',
                
                flex: 1, // Take up remaining space between the icons 
               
               
                    
            },
            
            main: { 
                fontSize: 23,
                height: 90, 
                fontWeight: 'bold', 
                marginBottom: 5, 
                color : '#3EB265', 
                textAlign:'center', 
                alignSelf: 'center' 
            },            
        
            img: {
                paddingTop:20,
                backgroundColor: 'transparent',
                borderRadius: 30, 
                width: '80%',
                height: 200,  
                marginBottom: 20, 
                textAlign:'center', 
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: '#81C999',
                borderWidth: 2,                
            },
        
            imgText: {
                fontSize:21,
                color : 'black', 
                width: '80%',
                height: 75, 
                alignItems: 'center', 
                textAlign:'center', 
                alignSelf: 'center'
            },

            cloth: {
                paddingTop: 25,
                backgroundColor: 'transparent',
                borderRadius: 30, 
                width: '80%',
                height: 120,  
                marginBottom: 20, 
                textAlign:'center', 
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: '#81C999',
                borderWidth: 2,
            },
        
            clothText: {
                fontSize:21,
                color : 'black', 
                width: '80%',
                height: 75, 
                alignItems: 'center', 
                textAlign:'center', 
                alignSelf: 'center'
            },

            button: {
                paddingTop:10,
                backgroundColor: '#81C999',
                borderRadius: 25, 
                width: '80%',
                height: 60, 
                alignItems: 'center', 
                marginBottom: 20, 
                textAlign:'center', 
                fontWeight: 'bold',
                alignSelf: 'center'
            },
        
            buttonText: {
                fontSize:23,
                color : 'white', 
                width: '80%',
                height: 75, 
                alignItems: 'center', 
                textAlign:'center', 
                alignSelf: 'center',
                marginVertical: 5,
            },

            square: {
                padding:10,
                backgroundColor: 'transparent',
                borderRadius: 30, 
                width: '80%',
                height: 200,  
                marginBottom: 20, 
                textAlign:'center', 
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: '#81C999',
                borderWidth: 2,
            },

            down: {
                padding:10,
                backgroundColor: 'transparent',
                borderRadius: 20, 
                width: '80%',
                height: 60, 
                alignItems: 'center', 
                marginBottom: 10, 
                textAlign:'center', 
                fontWeight: 'bold',
                alignSelf: 'center',
                borderWidth: 2,
                borderColor: '#81C999',                
            },
        
            downText: {
                fontSize:21,
                color : '#3EB265', 
                width: '80%',
                height: 75, 
                alignItems: 'center', 
                textAlign:'center', 
                alignSelf: 'center',
                marginVertical: 5,
            },
    });

export default CoordinationScreen;