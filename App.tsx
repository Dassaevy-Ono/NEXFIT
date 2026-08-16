import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import type { Session } from '@supabase/supabase-js';

import { supabase } from './src/lib/supabase';
import { CadastroScreen } from './src/screens/CadastroScreen';
import { LoginScreen } from './src/screens/LoginScreen';

type Tela =
  | 'inicio'
  | 'perfil'
  | 'cadastro'
  | 'login'
  | 'area';

type TipoUsuario = 'student' | 'trainer';

export default function App() {
  const [tela, setTela] = useState<Tela>('inicio');
  const [tipoUsuario, setTipoUsuario] =
    useState<TipoUsuario>('student');
  const [sessao, setSessao] = useState<Session | null>(null);
  const [verificandoSessao, setVerificandoSessao] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);

      if (data.session) {
        setTela('area');
      }

      setVerificandoSessao(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);

      if (novaSessao) {
        setTela('area');
      } else {
        setTela('inicio');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const abrirCadastro = (tipo: TipoUsuario) => {
    setTipoUsuario(tipo);
    setTela('cadastro');
  };

  const sair = async () => {
    await supabase.auth.signOut();
  };

  if (verificandoSessao) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.carregamento}>
          <StatusBar style="light" />
          <ActivityIndicator size="large" color="#B6FF2E" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        {tela === 'inicio' && (
          <View style={styles.logoArea}>
            <Text style={styles.logo}>
              Nex<Text style={styles.logoDestaque}>FIT</Text>
            </Text>

            <Text style={styles.slogan}>
              Treino conectado. Evolução comprovada.
            </Text>

            <TouchableOpacity
              style={styles.botao}
              onPress={() => setTela('perfil')}
            >
              <Text style={styles.textoBotao}>CRIAR CONTA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={() => setTela('login')}
            >
              <Text style={styles.textoSecundario}>ENTRAR</Text>
            </TouchableOpacity>
          </View>
        )}

        {tela === 'perfil' && (
          <View style={styles.logoArea}>
            <Text style={styles.titulo}>
              Como você usará o NEXFIT?
            </Text>

            <TouchableOpacity
              style={styles.botao}
              onPress={() => abrirCadastro('student')}
            >
              <Text style={styles.textoBotao}>SOU ALUNO</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={() => abrirCadastro('trainer')}
            >
              <Text style={styles.textoSecundario}>
                SOU PERSONAL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTela('inicio')}>
              <Text style={styles.voltar}>VOLTAR</Text>
            </TouchableOpacity>
          </View>
        )}

        {tela === 'cadastro' && (
          <CadastroScreen
            tipoUsuario={tipoUsuario}
            onVoltar={() => setTela('perfil')}
          />
        )}

        {tela === 'login' && (
          <LoginScreen
            onVoltar={() => setTela('inicio')}
            onLoginSucesso={() => setTela('area')}
          />
        )}

        {tela === 'area' && sessao && (
          <View style={styles.logoArea}>
            <Text style={styles.logo}>
              Nex<Text style={styles.logoDestaque}>FIT</Text>
            </Text>

            <Text style={styles.tituloArea}>LOGIN REALIZADO</Text>

            <Text style={styles.email}>
              {sessao.user.email}
            </Text>

            <Text style={styles.mensagem}>
              Sua conta está conectada ao Supabase.
            </Text>

            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={sair}
            >
              <Text style={styles.textoSecundario}>SAIR</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D10',
  },

  carregamento: {
    flex: 1,
    backgroundColor: '#0B0D10',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  logo: {
    color: '#F5F7FA',
    fontSize: 44,
    fontWeight: '900',
    fontStyle: 'italic',
  },

  logoDestaque: {
    color: '#B6FF2E',
  },

  slogan: {
    color: '#89919D',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },

  botao: {
    backgroundColor: '#B6FF2E',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 32,
  },

  textoBotao: {
    color: '#0B0D10',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },

  titulo: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
  },

  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#B6FF2E',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 12,
  },

  textoSecundario: {
    color: '#B6FF2E',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },

  voltar: {
    color: '#89919D',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 28,
  },

  tituloArea: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 28,
  },

  email: {
    color: '#B6FF2E',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
  },

  mensagem: {
    color: '#89919D',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
});