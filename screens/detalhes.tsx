import { Text } from "react-native";

export function Detail({ route }: any) {
  const { id } = route.params;

  return (
    <Text>ID: {id}</Text>
  );
}