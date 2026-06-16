import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export function Footer() {

    const navigation = useNavigation<any>();
    const route = useRoute();

    const atual = route.name;

    return (
        <View style={styles.container}>

            <TouchableOpacity
                style={styles.item}
                onPress={() => navigation.navigate('Home')}
            >
                <Ionicons
                    name="home"
                    size={28}
                    color={atual === 'Home' ? '#FFC107' : '#8A8A8A'}
                />

                <Text
                    style={[
                        styles.text,
                        {
                            color:
                                atual === 'Home'
                                    ? '#FFC107'
                                    : '#8A8A8A'
                        }
                    ]}
                >
                    Início
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.item}
                onPress={() => navigation.navigate('Catalogo')}
            >
                <Ionicons
                    name="book"
                    size={28}
                    color={atual === 'Catalogo' ? '#FFC107' : '#8A8A8A'}
                />

                <Text
                    style={[
                        styles.text,
                        {
                            color:
                                atual === 'Catalogo'
                                    ? '#FFC107'
                                    : '#8A8A8A'
                        }
                    ]}
                >
                    Catálogo
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.item}
                onPress={() => navigation.navigate('Favoritos')}
            >
                <Ionicons
                    name="star"
                    size={28}
                    color={atual === 'Favoritos' ? '#FFC107' : '#8A8A8A'}
                />

                <Text
                    style={[
                        styles.text,
                        {
                            color:
                                atual === 'Favoritos'
                                    ? '#FFC107'
                                    : '#8A8A8A'
                        }
                    ]}
                >
                    Favoritos
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    height: 75,
    backgroundColor: '#1F1F1F',

    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    },

    item: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    text: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '600',
    },
});