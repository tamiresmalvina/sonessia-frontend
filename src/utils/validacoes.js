/**
 * Utilitários de validação para o Sonessia.
 */

/**
 * Retorna a data máxima permitida no formato YYYY-MM-DD para completar 16 anos na data atual.
 *
 * @param {Date} [dataReferencia=new Date()]
 * @returns {string} Data no formato AAAA-MM-DD
 */
export function calcularDataMaxima16Anos(dataReferencia = new Date()) {
  const ano = dataReferencia.getFullYear() - 16;
  const mes = String(dataReferencia.getMonth() + 1).padStart(2, '0');
  const dia = String(dataReferencia.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Valida a data de nascimento garantindo idade mínima de 16 anos completos,
 * que a data não seja futura nem anterior a 1900-01-01.
 *
 * @param {string} dataNascimentoStr Data informada no formato AAAA-MM-DD
 * @param {Date} [dataReferencia=new Date()] Data base de verificação (padrão: hoje)
 * @returns {{ valido: boolean, erro: string }}
 */
export function validarIdade(dataNascimentoStr, dataReferencia = new Date()) {
  if (!dataNascimentoStr || !dataNascimentoStr.trim()) {
    return { valido: false, erro: 'Informe sua data de nascimento.' };
  }

  const valor = dataNascimentoStr.trim();
  const correspondencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!correspondencia) {
    return {
      valido: false,
      erro: 'A data de nascimento deve ser uma data válida no formato AAAA-MM-DD.',
    };
  }

  const [, anoTexto, mesTexto, diaTexto] = correspondencia;
  const ano = Number(anoTexto);
  const mes = Number(mesTexto);
  const dia = Number(diaTexto);

  const dataUtc = new Date(Date.UTC(ano, mes - 1, dia));
  if (
    dataUtc.getUTCFullYear() !== ano ||
    dataUtc.getUTCMonth() + 1 !== mes ||
    dataUtc.getUTCDate() !== dia
  ) {
    return { valido: false, erro: 'Data de nascimento inválida.' };
  }

  if (valor < '1900-01-01') {
    return {
      valido: false,
      erro: 'A data de nascimento não pode ser anterior a 1900-01-01.',
    };
  }

  const hojeUtc = dataReferencia.toISOString().slice(0, 10);
  if (valor > hojeUtc) {
    return {
      valido: false,
      erro: 'A data de nascimento não pode ser futura.',
    };
  }

  let idadeCompleta = dataReferencia.getUTCFullYear() - ano;
  const mesAtual = dataReferencia.getUTCMonth() + 1;
  const diaAtual = dataReferencia.getUTCDate();

  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
    idadeCompleta -= 1;
  }

  if (idadeCompleta < 16) {
    return {
      valido: false,
      erro: 'É necessário ter pelo menos 16 anos para criar uma conta.',
    };
  }

  return { valido: true, erro: '' };
}
