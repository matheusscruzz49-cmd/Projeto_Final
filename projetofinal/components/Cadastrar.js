import * as React from 'react';
import { TextInput, Text, View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import firebase from '../config/config';

class CadastroInvestidor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      carregando: false,
    };
  }

  cadastrar() {
    const { nome, email, senha, confirmarSenha } = this.state;

    if (nome.trim() === '') {
      Alert.alert('Atenção', 'Por favor, digite seu nome completo.');
      return;
    }
    if (email.trim() === '') {
      Alert.alert('Atenção', 'Por favor, digite seu e-mail.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Atenção', 'Digite um e-mail válido.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    this.setState({ carregando: true });

    firebase.database().ref('usuarios')
      .orderByChild('email')
      .equalTo(email.trim().toLowerCase())
      .once('value', snapshot => {
        if (snapshot.val() !== null) {
          this.setState({ carregando: false });
          Alert.alert('E-mail já cadastrado', 'Este e-mail já possui uma conta. Faça login.');
          return;
        }

        const novoUsuario = {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha: senha,
          saldo: 10000.00,
          dataCadastro: new Date().toISOString(),
        };

        firebase.database().ref('usuarios').push(novoUsuario)
          .then(ref => {
            const uid = ref.key;
            const usuarioLogado = { uid, ...novoUsuario };
            this.setState({ carregando: false });
            Alert.alert(
              'Conta criada com sucesso!',
              `Bem-vindo, ${novoUsuario.nome}!\nSaldo inicial: R$ 10.000,00`,
              [{ text: 'Começar', onPress: () => this.props.onLogin(usuarioLogado) }]
            );
          })
          .catch(error => {
            this.setState({ carregando: false });
            Alert.alert('Erro', 'Falha ao cadastrar: ' + error.message);
          });
      })
      .catch(error => {
        this.setState({ carregando: false });
        Alert.alert('Erro', error.message);
      });
  }

  render() {
    const { nome, email, senha, confirmarSenha, carregando } = this.state;

    return (
      <View style={estilos.container}>
        <Text style={estilos.logo}>StockApp</Text>
        <Text style={estilos.subtitulo}>Crie sua conta para começar a investir</Text>

        <TextInput
          style={estilos.input}
          placeholder="Nome completo"
          placeholderTextColor="#999"
          value={nome}
          onChangeText={texto => this.setState({ nome: texto })}
        />

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
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor="#999"
          secureTextEntry={true}
          value={senha}
          onChangeText={texto => this.setState({ senha: texto })}
        />

        <TextInput
          style={estilos.input}
          placeholder="Confirmar senha"
          placeholderTextColor="#999"
          secureTextEntry={true}
          value={confirmarSenha}
          onChangeText={texto => this.setState({ confirmarSenha: texto })}
        />

        <TouchableOpacity
          style={[estilos.botao, carregando && { opacity: 0.7 }]}
          onPress={() => this.cadastrar()}
          disabled={carregando}
        >
          {carregando
            ? <ActivityIndicator color="#fff" />
            : <Text style={estilos.txtBotao}>Criar Conta</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.props.navigation.navigate('Entrar')}>
          <Text style={estilos.linkTexto}>Já tem uma conta? Faça login</Text>
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
    marginBottom: 30,
    color: '#666',
  },
  input: {
    height: 55,
    padding: 15,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 12,
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

export default CadastroInvestidor;