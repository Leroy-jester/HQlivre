import { Text } from "react-native";
import { TopBar } from "../components/TopBar";

export function Detail({ route }: any) {
  <TopBar type="main"/>
  const { id } = route.params;

  return (
    <Text>ID: {id}</Text>
  );
}