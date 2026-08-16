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

type LoginScreenProps = {
  onVoltar: () => void;
  onLoginSucesso: () => void;
};

export function LoginScreen({
  onVoltar,
  onLoginSucesso,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Informe o e-mail e a senha.');
      return;
    }

    try {
      setCarregando(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (error) {
        throw error;
      }

      onLoginSucesso();
    } catch (error) {
      const mensagem =
        error instanceof Error &&
        error.message.toLowerCase().includes('invalid login')
          ? 'E-mail ou senha incorretos.'
          : error instanceof Error
            ? error.message
            : 'Não foi possível entrar.';

      Alert.alert('Erro no login', mensagem);
    } finally {
      setCarregando(false);
    }
  };

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

        <Text style={styles.titulo}>ENTRAR</Text>
        <Text style={styles.subtitulo}>
          Acesse sua conta para continuar
        </Text>

        <View style={styles.formulario}>
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
            placeholder="Digite sua senha"
            placeholderTextColor="#626A75"
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.botao,
              carregando && styles.botaoDesativado,
            ]}
            onPress={entrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#0B0D10" />
            ) : (
              <Text style={styles.textoBotao}>ENTRAR</Text>
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
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 20,
  },

  subtitulo: {
    color: '#89919D',
    fontSize: 14,
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