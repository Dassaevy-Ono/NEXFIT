import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

type TipoUsuario = 'student' | 'trainer';

type EscolhaPerfilScreenProps = {
  userId: string;
  onConcluido: (tipo: TipoUsuario) => void;
  onSair: () => void;
};

export function EscolhaPerfilScreen({
  userId,
  onConcluido,
  onSair,
}: EscolhaPerfilScreenProps) {
  const [salvando, setSalvando] =
    useState<TipoUsuario | null>(null);

  const selecionarPerfil = async (
    tipo: TipoUsuario
  ) => {
    try {
      setSalvando(tipo);

      const { error } = await supabase
        .from('profiles')
        .update({
          role: tipo,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      onConcluido(tipo);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o perfil.';

      Alert.alert('Erro', mensagem);
    } finally {
      setSalvando(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        Nex<Text style={styles.logoDestaque}>FIT</Text>
      </Text>

      <Text style={styles.titulo}>
        COMO VOCÊ USARÁ O NEXFIT?
      </Text>

      <Text style={styles.descricao}>
        Escolha seu perfil para personalizarmos sua experiência.
      </Text>

      <TouchableOpacity
        style={styles.botao}
        onPress={() => selecionarPerfil('student')}
        disabled={salvando !== null}
      >
        {salvando === 'student' ? (
          <ActivityIndicator color="#0B0D10" />
        ) : (
          <>
            <Text style={styles.textoBotao}>SOU ALUNO</Text>
            <Text style={styles.detalheBotao}>
              Receber treinos e acompanhar minha evolução
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSecundario}
        onPress={() => selecionarPerfil('trainer')}
        disabled={salvando !== null}
      >
        {salvando === 'trainer' ? (
          <ActivityIndicator color="#B6FF2E" />
        ) : (
          <>
            <Text style={styles.textoSecundario}>
              SOU PERSONAL
            </Text>
            <Text style={styles.detalheSecundario}>
              Criar treinos e acompanhar meus alunos
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSair}
        disabled={salvando !== null}
      >
        <Text style={styles.sair}>SAIR DA CONTA</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D10',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  logo: {
    color: '#F5F7FA',
    fontSize: 40,
    fontWeight: '900',
    fontStyle: 'italic',
  },

  logoDestaque: {
    color: '#B6FF2E',
  },

  titulo: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 28,
  },

  descricao: {
    color: '#89919D',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 12,
  },

  botao: {
    width: '100%',
    maxWidth: 480,
    minHeight: 82,
    backgroundColor: '#B6FF2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
  },

  botaoSecundario: {
    width: '100%',
    maxWidth: 480,
    minHeight: 82,
    borderWidth: 1,
    borderColor: '#B6FF2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },

  textoBotao: {
    color: '#0B0D10',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },

  textoSecundario: {
    color: '#B6FF2E',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },

  detalheBotao: {
    color: '#303720',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },

  detalheSecundario: {
    color: '#89919D',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },

  sair: {
    color: '#89919D',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 28,
  },
});