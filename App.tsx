import { AlunoDashboard } from './src/screens/AlunoDashboard';
import { PersonalDashboard } from './src/screens/PersonalDashboard';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
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
import { EscolhaPerfilScreen } from './src/screens/EscolhaPerfilScreen';
import { LoginScreen } from './src/screens/LoginScreen';

type Tela = 'inicio' | 'perfil' | 'cadastro' | 'login';
type TipoUsuario = 'student' | 'trainer';

type Perfil = {
  full_name: string;
  role: TipoUsuario;
  onboarding_completed: boolean;
  personal_code: string | null;  
};

export default function App() {
  const [tela, setTela] = useState<Tela>('inicio');
  const [tipoUsuario, setTipoUsuario] =
    useState<TipoUsuario>('student');
  const [sessao, setSessao] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [verificandoSessao, setVerificandoSessao] =
    useState(true);
  const [carregandoPerfil, setCarregandoPerfil] =
    useState(false);
  const [erroPerfil, setErroPerfil] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setVerificandoSessao(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_evento, novaSessao) => {
        setSessao(novaSessao);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessao) {
      setPerfil(null);
      setErroPerfil(false);
      setCarregandoPerfil(false);
      return;
    }

    const carregarPerfil = async () => {
      try {
        setCarregandoPerfil(true);
        setErroPerfil(false);

        const { data, error } = await supabase
          .from('profiles')
          .select(
            'full_name, role, onboarding_completed, personal_code'
          )
          .eq('id', sessao.user.id)
          .single();

        if (error) {
          throw error;
        }

        setPerfil(data as Perfil);
      } catch (error) {
        setErroPerfil(true);

        const mensagem =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o perfil.';

        Alert.alert('Erro no perfil', mensagem);
      } finally {
        setCarregandoPerfil(false);
      }
    };

    carregarPerfil();
  }, [sessao]);

  const abrirCadastro = (tipo: TipoUsuario) => {
    setTipoUsuario(tipo);
    setTela('cadastro');
  };

  const sair = async () => {
    await supabase.auth.signOut();
    setTela('inicio');
  };

  const concluirOnboarding = (tipo: TipoUsuario) => {
    setPerfil((perfilAtual) => {
      if (!perfilAtual) {
        return perfilAtual;
      }

      return {
        ...perfilAtual,
        role: tipo,
        onboarding_completed: true,
      };
    });
  };

  if (
    verificandoSessao ||
    (sessao && carregandoPerfil)
  ) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.carregamento}>
          <StatusBar style="light" />
          <ActivityIndicator
            size="large"
            color="#B6FF2E"
          />
          <Text style={styles.textoCarregamento}>
            Carregando NEXFIT...
          </Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (sessao && erroPerfil) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />

          <View style={styles.logoArea}>
            <Text style={styles.tituloArea}>
              NÃO FOI POSSÍVEL CARREGAR O PERFIL
            </Text>

            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={sair}
            >
              <Text style={styles.textoSecundario}>SAIR</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (
    sessao &&
    perfil &&
    !perfil.onboarding_completed
  ) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />

          <EscolhaPerfilScreen
            userId={sessao.user.id}
            onConcluido={concluirOnboarding}
            onSair={sair}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (sessao && perfil) {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        {perfil.role === 'student' ? (
          <AlunoDashboard
            nome={perfil.full_name}
            onSair={sair}
          />
        ) : (
          <PersonalDashboard
            nome={perfil.full_name}
            codigo={perfil.personal_code}
            onSair={sair}
          />
        )}
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
              <Text style={styles.textoBotao}>
                CRIAR CONTA
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={() => setTela('login')}
            >
              <Text style={styles.textoSecundario}>
                ENTRAR
              </Text>
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
              <Text style={styles.textoBotao}>
                SOU ALUNO
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={() => abrirCadastro('trainer')}
            >
              <Text style={styles.textoSecundario}>
                SOU PERSONAL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTela('inicio')}
            >
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
            onLoginSucesso={() => undefined}
          />
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

  textoCarregamento: {
    color: '#89919D',
    fontSize: 13,
    marginTop: 14,
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
    marginTop: 14,
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

  saudacao: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 28,
  },

  tituloArea: {
    color: '#B6FF2E',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 10,
  },

  mensagem: {
    color: '#89919D',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
  },

  cartaoPerfil: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#15191E',
    borderWidth: 1,
    borderColor: '#2A3038',
    borderRadius: 14,
    alignItems: 'center',
    padding: 20,
    marginTop: 24,
  },

  labelPerfil: {
    color: '#89919D',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  valorPerfil: {
    color: '#B6FF2E',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
  },
});