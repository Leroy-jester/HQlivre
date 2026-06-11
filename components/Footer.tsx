import { View, Button } from 'react-native';

export function Footer() {

    return(
        <View>
                <Button
                    title="HOME"
                    onPress={() => navigation.navigate('Home')}
                />
                <Button
                    title="CATALOGO"
                    onPress={() => navigation.navigate('catalogo')}
                />
                <Button
                    title="FAVORITOS"
                    onPress={() => navigation.navigate('Favoritos')}
                />
        </View>
    )
}