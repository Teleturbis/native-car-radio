import { Text, OpenURLButton } from 'react-native';

export default function Login() {
  return (
    <OpenURLButton url='http://localhost:5000/auth/login'>
      <Text>Login with Spotify</Text>
    </OpenURLButton>
  );
}
