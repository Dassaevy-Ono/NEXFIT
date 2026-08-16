import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

type TipoUsuario = 'student' | 'trainer';

type CadastroScreenProps = {
  tipoUsuario: TipoUsuario;
  onVoltar: () => void;
};

export function CadastroScreen({
  tipoUsuario,
  onVoltar,
}: CadastroScreenProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const cadastrar = async () => {
    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não são iguais.');
      return;
    }

    try {
      setCarregando(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: {
          data: {
            full_name: nome.trim(),
            role: tipoUsuario,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        Alert.alert('Sucesso', 'Sua conta foi criada.');
      } else {
        Alert.alert(
          'Cadastro realizado',
          'Verifique seu e-mail para confirmar a conta.'
        );
      }

      setNome('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar o cadastro.';

      Alert.alert('Erro no cadastro', mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const perfil =
    tipoUsuario === 'student' ? 'ALUNO' : 'PERSONAL';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>
          Nex<Text style={styles.logoDestaque}>FIT</Text>
        </Text>

        <Text style={styles.titulo}>CRIAR CONTA</Text>
        <Text style={styles.perfil}>PERFIL: {perfil}</Text>

        <View style={styles.formulario}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome"
            placeholderTextColor="#626A75"
            autoCapitalize="words"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#626A75"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Mínimo de 6 caracteres"
            placeholderTextColor="#626A75"
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Digite novamente"
            placeholderTextColor="#626A75"
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.botao,
              carregando && styles.botaoDesativado,
            ]}
            onPress={cadastrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#0B0D10" />
            ) : (
              <Text style={styles.textoBotao}>CADASTRAR</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onVoltar}>
            <Text style={styles.voltar}>VOLTAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D10',
  },

  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  logo: {
    color: '#F5F7FA',
    fontSize: 36,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  logoDestaque: {
    color: '#B6FF2E',
  },

  titulo: {
    color: '#F5F7FA',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 20,
  },

  perfil: {
    color: '#B6FF2E',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },

  formulario: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  label: {
    color: '#D7DCE2',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    backgroundColor: '#15191E',
    color: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#2A3038',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },

  botao: {
    backgroundColor: '#B6FF2E',
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginTop: 28,
  },

  botaoDesativado: {
    opacity: 0.6,
  },

  textoBotao: {
    color: '#0B0D10',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },

  voltar: {
    color: '#89919D',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 24,
  },
});