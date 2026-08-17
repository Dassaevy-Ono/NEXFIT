import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

type AlunoVinculado = {
  student_id: string;
  student_name: string;
  linked_at: string;
};

type PersonalDashboardProps = {
  nome: string;
  codigo: string | null;
  onSair: () => void;
};

export function PersonalDashboard({
  nome,
  codigo,
  onSair,
}: PersonalDashboardProps) {
  const [alunos, setAlunos] = useState<AlunoVinculado[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    try {
      setCarregando(true);

      const { data, error } = await supabase.rpc(
        'get_my_students'
      );

      if (error) {
        throw error;
      }

      setAlunos(
        Array.isArray(data)
          ? (data as AlunoVinculado[])
          : []
      );
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os alunos.';

      Alert.alert('Erro', mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
    >
      <Text style={styles.logo}>
        Nex<Text style={styles.logoDestaque}>FIT</Text>
      </Text>

      <Text style={styles.saudacao}>
        Olá, {nome || 'personal'}!
      </Text>

      <Text style={styles.titulo}>ÁREA DO PERSONAL</Text>

      <View style={styles.cartaoCodigo}>
        <Text style={styles.labelCartao}>
          SEU CÓDIGO DE CONVITE
        </Text>

        <Text style={styles.codigo} selectable>
          {codigo || 'INDISPONÍVEL'}
        </Text>

        <Text style={styles.descricaoCentralizada}>
          Compartilhe este código com seus alunos.
        </Text>
      </View>

      <View style={styles.cabecalhoAlunos}>
        <View>
          <Text style={styles.labelCartao}>
            MEUS ALUNOS
          </Text>

          <Text style={styles.quantidade}>
            {alunos.length}{' '}
            {alunos.length === 1 ? 'aluno' : 'alunos'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botaoAtualizar}
          onPress={carregarAlunos}
          disabled={carregando}
        >
          <Text style={styles.textoAtualizar}>
            ATUALIZAR
          </Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#B6FF2E"
          style={styles.carregamento}
        />
      ) : alunos.length === 0 ? (
        <View style={styles.cartaoVazio}>
          <Text style={styles.tituloVazio}>
            Nenhum aluno vinculado
          </Text>

          <Text style={styles.descricao}>
            Compartilhe seu código para começar a montar sua
            equipe.
          </Text>
        </View>
      ) : (
        alunos.map((aluno) => (
          <View
            key={aluno.student_id}
            style={styles.cartaoAluno}
          >
            <View style={styles.avatar}>
              <Text style={styles.letraAvatar}>
                {(aluno.student_name || 'A')
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.dadosAluno}>
              <Text style={styles.nomeAluno}>
                {aluno.student_name || 'Aluno'}
              </Text>

              <Text style={styles.status}>
                ● VINCULADO
              </Text>
            </View>
          </View>
        ))
      )}

      <View style={styles.cartaoTreinos}>
        <Text style={styles.labelCartao}>
          TREINOS
        </Text>

        <Text style={styles.descricao}>
          A criação e atribuição de treinos será o próximo
          módulo.
        </Text>
      </View>

      <TouchableOpacity onPress={onSair}>
        <Text style={styles.sair}>SAIR DA CONTA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D10',
  },

  conteudo: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 42,
    paddingBottom: 48,
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
    marginTop: 22,
  },

  titulo: {
    color: '#B6FF2E',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 7,
    marginBottom: 18,
  },

  cartaoCodigo: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#B6FF2E',
    alignItems: 'center',
    borderRadius: 14,
    padding: 20,
  },

  labelCartao: {
    color: '#89919D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  codigo: {
    color: '#0B0D10',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 8,
  },

  descricaoCentralizada: {
    color: '#303720',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 7,
  },

  cabecalhoAlunos: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },

  quantidade: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 5,
  },

  botaoAtualizar: {
    borderWidth: 1,
    borderColor: '#3A424D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  textoAtualizar: {
    color: '#B6FF2E',
    fontSize: 10,
    fontWeight: '900',
  },

  cartaoVazio: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#15191E',
    borderWidth: 1,
    borderColor: '#2A3038',
    borderRadius: 14,
    padding: 20,
  },

  tituloVazio: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '800',
  },

  descricao: {
    color: '#89919D',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },

  cartaoAluno: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#15191E',
    borderWidth: 1,
    borderColor: '#2A3038',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#B6FF2E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  letraAvatar: {
    color: '#0B0D10',
    fontSize: 18,
    fontWeight: '900',
  },

  dadosAluno: {
    marginLeft: 14,
  },

  nomeAluno: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '800',
  },

  status: {
    color: '#B6FF2E',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },

  cartaoTreinos: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#15191E',
    borderWidth: 1,
    borderColor: '#2A3038',
    borderRadius: 14,
    padding: 20,
    marginTop: 14,
  },

  carregamento: {
    marginVertical: 32,
  },

  sair: {
    color: '#89919D',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 28,
  },
});