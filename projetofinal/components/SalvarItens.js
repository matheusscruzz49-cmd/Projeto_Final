import * as React from 'react';
import { TextInput, Text, View, StyleSheet, TouchableHighlight, Alert } from 'react-native';
import firebase from '../config/config';

class CadastroInvestidor extends React.Component {
  constructor(props) {
    super(props);
    this.nome = "";
    this.email = "";
  }

  cadastrar() {
    if (this.nome.trim() !== "" && this.email.trim() !== "") {
      firebase.database().ref("usuarios").push({
        nome: this.nome,
        email: this.email,
        saldo: 10000.00, 
        dataCadastro: new Date().toISOString()
      })
      .then(() => {
        Alert.alert("Sucesso", "Conta de investidor criada!");
      })
      .catch((error) => {
        Alert.alert("Erro", "Falha ao cadastrar: " + error.message);
      });
    } else {
      Alert.alert("Atenção", "Preencha todos os campos para continuar.");
    }
  }

  render() {
    return (
      <View style={estilos.container}>
        <Text style={estilos.logo}>StockApp 📈</Text>
        <Text style={estilos.subtitulo}>Crie sua conta para começar a investir</Text>

        <TextInput 
          style={estilos.input} 
          placeholder="Nome Completo"
          placeholderTextColor="#999"
          onChangeText={(texto) => { this.nome = texto }}
        />

        <TextInput 
          style={estilos.input} 
          placeholder="E-mail"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(texto) => { this.email = texto }}
        />

        <TouchableHighlight 
          style={estilos.botao} 
          onPress={() => this.cadastrar()}
          underlayColor="#00ced1"
        >
          <Text style={estilos.txtBotao}>Finalizar Cadastro</Text>
        </TouchableHighlight>

        <Text style={estilos.voltarLogin}>Já possui uma conta? Faça Login</Text>
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
    color: '#008b8b' // Mesmo tom de verde/azul do Login
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
    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    // Sombra para Android
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
    backgroundColor: '#f9f9f9', // Fundo leve igual ao Login
    color: '#333'
  },
  voltarLogin: {
    marginTop: 20,
    textAlign: 'center',
    color: '#008b8b',
    textDecorationLine: 'underline'
  }
});

export default CadastroInvestidor;