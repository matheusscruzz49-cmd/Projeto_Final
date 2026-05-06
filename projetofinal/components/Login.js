import * as React from 'react';
import { TextInput, Text, View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import firebase from '../config/config';

class LoginInvestidor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      senha: '',
      carregando: false,
    };
  }

  fazerLogin() {
    const { email, senha } = this.state;

    if (email.trim() === '') {
      Alert.alert('Atenção', 'Por favor, digite seu e-mail.');
      return;
    }
    if (senha.trim() === '') {
      Alert.alert('Atenção', 'Por favor, digite sua senha.');
      return;
    }

    this.setState({ carregando: true });

    firebase.database().ref('usuarios')
      .orderByChild('email')
      .equalTo(email.trim().toLowerCase())
      .once('value', snapshot => {
        const data = snapshot.val();

        if (data == null) {
          this.setState({ carregando: false });
          Alert.alert('Acesso Negado', 'E-mail não encontrado.');
          return;
        }

        const uid = Object.keys(data)[0];
        const usuario = { uid, ...data[uid] };

        if (usuario.senha !== senha) {
          this.setState({ carregando: false });
          Alert.alert('Acesso Negado', 'Senha incorreta.');
          return;
        }

        this.setState({ carregando: false });
        Alert.alert('Bem-vindo!', `Olá, ${usuario.nome}!\nSaldo disponível: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
        this.props.onLogin(usuario);
      })
      .catch(error => {
        this.setState({ carregando: false });
        Alert.alert('Erro', error.message);
      });
  }

  render() {
    const { email, senha, carregando } = this.state;

    return (
      <View style={estilos.container}>
        <Text style={estilos.logo}>StockApp</Text>
        <Text style={estilos.subtitulo}>Acesse sua conta de investidor</Text>

        <TextInput
          style={estilos.input}
          placeholder="E-mail"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={texto => this.setState({ email: texto })}
        />

        <TextInput
          style={estilos.input}
          placeholder="Senha"
          placeholderTextColor="#999"
          secureTextEntry={true}
          value={senha}
          onChangeText={texto => this.setState({ senha: texto })}
        />

        <TouchableOpacity
          style={[estilos.botao, carregando && { opacity: 0.7 }]}
          onPress={() => this.fazerLogin()}
          disabled={carregando}
        >
          {carregando
            ? <ActivityIndicator color="#fff" />
            : <Text style={estilos.txtBotao}>Entrar</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.props.navigation.navigate('Cadastrar')}>
          <Text style={estilos.linkTexto}>Não tem uma conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#008b8b',
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  input: {
    height: 55,
    padding: 15,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 14,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  botao: {
    height: 55,
    backgroundColor: '#008b8b',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 6,
    elevation: 3,
  },
  txtBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkTexto: {
    marginTop: 22,
    textAlign: 'center',
    color: '#008b8b',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});

export default LoginInvestidor;