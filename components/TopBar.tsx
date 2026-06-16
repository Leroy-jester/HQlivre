import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
    useSafeAreaInsets
} from 'react-native-safe-area-context';

type Props = {
    type: 'main' | 'details';
    mangaNome?: string;
    favorito?: boolean;
    onMenu?: () => void;
    onBack?: () => void;
    onToggleFavorite?: () => void;
};

export function TopBar({
    type,
    mangaNome,
    favorito,
    onMenu,
    onBack,
    onToggleFavorite
}: Props) {

    const insets = useSafeAreaInsets();

    const titulo =
        mangaNome && mangaNome.length > 13
            ? mangaNome.slice(0, 10) + '...'
            : mangaNome;

    return (
        <View
            style={[
                styles.wrapper,
                {
                    paddingTop: insets.top
                }
            ]}
        >
            <View style={styles.container}>

                <View style={styles.side}>
                    {type === 'main' ? (
                        <TouchableOpacity onPress={onMenu}>
                            <Ionicons
                                name="menu"
                                size={28}
                            />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={onBack}>
                            <Ionicons
                                name="arrow-back"
                                size={28}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.center}>
                    {type === 'main' ? (
                        <Image
                            source={require('../assets/HQlivre.png')}
                            style={styles.logo}
                        />
                    ) : (
                        <Text
                            numberOfLines={1}
                            style={styles.title}
                        >
                            {titulo}
                        </Text>
                    )}
                </View>

                <View style={styles.side}>
                    {type === 'main' ? (
                        <Ionicons
                            name="person-circle-outline"
                            size={32}
                        />
                    ) : (
                        <TouchableOpacity
                            onPress={onToggleFavorite}
                        >
                            <Ionicons
                                name={
                                    favorito
                                        ? 'star'
                                        : 'star-outline'
                                }
                                size={28}
                            />
                        </TouchableOpacity>
                    )}
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#680606',
    },

    container: {
        backgroundColor: '#680606',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },

    side: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    logo: {
        width: 120,
        height: 40,
        resizeMode: 'contain',
    },
});