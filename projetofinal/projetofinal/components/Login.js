import * as React from 'react';
import { TextInput, Text, View, StyleSheet, TouchableHighlight, Alert } from 'react-native';
import firebase from '../config/config';

class LoginInvestidor extends React.Component {
  constructor(props) {
    super(props);
    this.emailDigitado = "";
    this.state = {
      carregando: false
    };
  }

  fazerLogin() {
    if (this.emailDigitado.trim() === "") {
      Alert.alert("Erro", "Por favor, digite seu e-mail.");
      return;
    }

    firebase.database().ref("usuarios")
      .orderByChild("email")
      .equalTo(this.emailDigitado.trim().toLowerCase())
      .once('value', snapshot => {
        let data = snapshot.val();

        if (data == null) {
          Alert.alert("Acesso Negado", "Usuário não encontrado.");
        } else {
          let chaves = Object.keys(data);
          let uid = chaves[0];
          let usuarioLogado = { uid, ...data[uid] };

          Alert.alert(
            "Bem-vindo!",
            `Olá ${usuarioLogado.nome}!\nSaldo disponível: R$ ${parseFloat(usuarioLogado.saldo).toFixed(2)}`
          );

          // Passa o objeto completo do usuário (com uid) para o App
          this.props.onLogin(usuarioLogado);
        }
      });
  }

  render() {
    return (
      <View style={estilos.container}>
        <Text style={estilos.logo}>StockApp 📈</Text>
        <Text style={estilos.subtitulo}>Acesse sua conta de investidor</Text>

        <TextInput
          style={estilos.input}
          placeholder="Digite seu e-mail cadastrado"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(texto) => { this.emailDigitado = texto }}
        />

        <TouchableHighlight
          style={estilos.botao}
          onPress={() => this.fazerLogin()}
          underlayColor="#00ced1"
        >
          <Text style={estilos.txtBotao}>Entrar no Home Broker</Text>
        </TouchableHighlight>

        <Text style={estilos.esqueceuSenha}>Esqueceu suas credenciais?</Text>
      </View>
    );
  }
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#008b8b'
  },
  subtitulo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666'
  },
  txtBotao: {
    color: "white",
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: "center"
  },
  botao: {
    height: 55,
    backgroundColor: "#008b8b",
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 5,
  },
  input: {
    height: 60,
    padding: 15,
    fontSize: 18,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9'
  },
  esqueceuSenha: {
    marginTop: 20,
    textAlign: 'center',
    color: '#008b8b',
    textDecorationLine: 'underline'
  }
});

export default LoginInvestidor;
