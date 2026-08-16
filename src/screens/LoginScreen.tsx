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
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

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
  const [carregandoGoogle, setCarregandoGoogle] =
    useState(false);

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

  const criarSessaoDaUrl = async (url: string) => {
    const { params, errorCode } =
      QueryParams.getQueryParams(url);

    if (errorCode) {
      throw new Error(errorCode);
    }

    const accessToken = params.access_token;
    const refreshToken = params.refresh_token;

    if (!accessToken || !refreshToken) {
      throw new Error(
        'Os dados da sessão não foram retornados.'
      );
    }

    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }

    onLoginSucesso();
  };

  const entrarComGoogle = async () => {
    try {
      setCarregandoGoogle(true);

      const redirectTo =
        Platform.OS === 'web'
          ? window.location.origin
          : makeRedirectUri({
              scheme: 'nexfit',
              path: 'auth/callback',
            });

      const { data, error } =
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: Platform.OS !== 'web',
            queryParams: {
              prompt: 'select_account',
            },
          },
        });

      if (error) {
        throw error;
      }

      if (Platform.OS !== 'web' && data.url) {
        const resultado =
          await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectTo
          );

        if (resultado.type === 'success') {
          await criarSessaoDaUrl(resultado.url);
        }
      }
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível entrar com o Google.';

      Alert.alert('Erro no Google', mensagem);
    } finally {
      setCarregandoGoogle(false);
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
            disabled={carregando || carregandoGoogle}
          >
            {carregando ? (
              <ActivityIndicator color="#0B0D10" />
            ) : (
              <Text style={styles.textoBotao}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divisor}>
            <View style={styles.linha} />
            <Text style={styles.ou}>OU</Text>
            <View style={styles.linha} />
          </View>

          <TouchableOpacity
            style={[
              styles.botaoGoogle,
              carregandoGoogle && styles.botaoDesativado,
            ]}
            onPress={entrarComGoogle}
            disabled={carregandoGoogle || carregando}
          >
            {carregandoGoogle ? (
              <ActivityIndicator color="#202124" />
            ) : (
              <Text style={styles.textoGoogle}>
                G  CONTINUAR COM GOOGLE
              </Text>
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

  botaoGoogle: {
    backgroundColor: '#FFFFFF',
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
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

  textoGoogle: {
    color: '#202124',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },

  linha: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A3038',
  },

  ou: {
    color: '#89919D',
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: 12,
  },

  voltar: {
    color: '#89919D',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 24,
  },
});