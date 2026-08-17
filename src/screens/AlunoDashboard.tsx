import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

type PersonalVinculado = {
  trainer_id: string;
  trainer_name: string;
};

type AlunoDashboardProps = {
  nome: string;
  onSair: () => void;
};

function obterMensagemErro(
  error: unknown,
  mensagemPadrao: string
) {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return mensagemPadrao;
}

export function AlunoDashboard({
  nome,
  onSair,
}: AlunoDashboardProps) {
  const [codigo, setCodigo] = useState('');
  const [personal, setPersonal] =
    useState<PersonalVinculado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [vinculando, setVinculando] = useState(false);

  useEffect(() => {
    carregarPersonal();
  }, []);

  const carregarPersonal = async () => {
    try {
      setCarregando(true);

      const { data, error } = await supabase.rpc(
        'get_my_trainer'
      );

      if (error) {
        console.error(
          'Erro ao consultar o personal:',
          error
        );

        Alert.alert(
          'Erro',
          error.message ||
            'Não foi possível consultar o personal.'
        );

        return;
      }

      const resultado =
        Array.isArray(data) && data.length > 0
          ? (data[0] as PersonalVinculado)
          : null;

      setPersonal(resultado);
    } catch (error: unknown) {
      console.error(
        'Erro inesperado ao consultar o personal:',
        error
      );

      Alert.alert(
        'Erro',
        obterMensagemErro(
          error,
          'Não foi possível consultar o personal.'
        )
      );
    } finally {
      setCarregando(false);
    }
  };

  const vincularPersonal = async () => {
    const codigoFormatado = codigo
      .trim()
      .toUpperCase();

    if (!codigoFormatado) {
      Alert.alert(
        'Atenção',
        'Digite o código fornecido pelo personal.'
      );
      return;
    }

    if (codigoFormatado.length !== 8) {
      Alert.alert(
        'Código inválido',
        'O código do personal deve possuir 8 caracteres.'
      );
      return;
    }

    try {
      setVinculando(true);
      const { data, error } = await supabase.rpc(
        'connect_to_trainer',
        {
          code: codigoFormatado,
        }
      );

      if (error) {
        console.log(
        'Erro do Supabase ao vincular:',
        error
        );

        Alert.alert(
          'Erro no vínculo',
          error.message ||
            'Não foi possível vincular o personal.'
        );

        return;
      }

      const resultado =
        Array.isArray(data) && data.length > 0
          ? (data[0] as PersonalVinculado)
          : null;

      if (!resultado) {
        Alert.alert(
          'Erro no vínculo',
          'O servidor não retornou os dados do personal.'
        );

        return;
      }

      setPersonal(resultado);
      setCodigo('');

      Alert.alert(
        'Personal vinculado',
        `Você agora está conectado a ${resultado.trainer_name}.`
      );
    } catch (error: unknown) {
      console.error(
        'Erro inesperado ao vincular:',
        error
      );

      Alert.alert(
        'Erro no vínculo',
        obterMensagemErro(
          error,
          'Ocorreu um erro inesperado ao vincular o personal.'
        )
      );
    } finally {
      setVinculando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        Nex<Text style={styles.logoDestaque}>FIT</Text>
      </Text>

      <Text style={styles.saudacao}>
        Olá, {nome || 'aluno'}!
      </Text>

      <Text style={styles.titulo}>
        ÁREA DO ALUNO
      </Text>

      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#B6FF2E"
          style={styles.carregamento}
        />
      ) : personal ? (
        <View style={styles.cartao}>
          <Text style={styles.labelCartao}>
            SEU PERSONAL
          </Text>

          <Text style={styles.nomePersonal}>
            {personal.trainer_name}
          </Text>

          <Text style={styles.status}>
            ● CONECTADO
          </Text>
        </View>
      ) : (
        <View style={styles.cartao}>
          <Text style={styles.labelCartao}>
            VINCULAR PERSONAL
          </Text>

          <Text style={styles.descricao}>
            Digite o código compartilhado pelo seu
            personal.
          </Text>

          <TextInput
            style={styles.input}
            value={codigo}
            onChangeText={setCodigo}
            placeholder="Exemplo: A1B2C3D4"
            placeholderTextColor="#626A75"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={8}
          />

          <TouchableOpacity
            style={[
              styles.botao,
              vinculando && styles.botaoDesativado,
            ]}
            onPress={vincularPersonal}
            disabled={vinculando}
          >
            {vinculando ? (
              <ActivityIndicator color="#0B0D10" />
            ) : (
              <Text style={styles.textoBotao}>
                VINCULAR PERSONAL
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.cartaoTreino}>
        <Text style={styles.labelCartao}>
          TREINO DE HOJE
        </Text>

        <Text style={styles.descricao}>
          Nenhum treino atribuído até o momento.
        </Text>
      </View>

      <TouchableOpacity onPress={onSair}>
        <Text style={styles.sair}>
          SAIR DA CONTA
        </Text>
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
    fontSize: 38,
    fontWeight: '900',
    fontStyle: 'italic',
  },

  logoDestaque: {
    color: '#B6FF2E',
  },

  saudacao: {
    color: '#F5F7FA',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 24,
  },

  titulo: {
    color: '#B6FF2E',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 7,
    marginBottom: 18,
  },

  cartao: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#15191E',
    borderWidth: 1,
    borderColor: '#2A3038',
    borderRadius: 14,
    padding: 20,
  },

  cartaoTreino: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#15191E',
    borderWidth: 1,
    borderColor: '#2A3038',
    borderRadius: 14,
    padding: 20,
    marginTop: 14,
  },

  labelCartao: {
    color: '#89919D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  descricao: {
    color: '#89919D',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },

  input: {
    backgroundColor: '#0B0D10',
    color: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#3A424D',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 16,
  },

  botao: {
    backgroundColor: '#B6FF2E',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 14,
  },

  botaoDesativado: {
    opacity: 0.6,
  },

  textoBotao: {
    color: '#0B0D10',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  nomePersonal: {
    color: '#F5F7FA',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 10,
  },

  status: {
    color: '#B6FF2E',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 8,
  },

  carregamento: {
    marginVertical: 32,
  },

  sair: {
    color: '#89919D',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 26,
  },
});