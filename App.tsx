import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

export default function App() {
  const [tela, setTela] = useState<'inicio' | 'perfil'>('inicio');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        {tela === 'inicio' ? (
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
                        
            <Text style={styles.textoBotao}>COMEÇAR</Text>
          </TouchableOpacity>        
        </View>
      ) : (
        <View style={styles.logoArea}>
          <Text style={styles.titulo}>
            Como você usará o NEXFIT?
          </Text>

          <TouchableOpacity style={styles.botao}>
            <Text style={styles.textoBotao}>SOU ALUNO</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoSecundario}>
            <Text style={styles.textoSecundario}>SOU PERSONAL</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTela('inicio')}>
            <Text style={styles.voltar}>VOLTAR</Text>
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
  }
});