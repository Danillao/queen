/* //////////////////////////////////////////////

        [ ❗ ] CREDITOS - NO MODIFICAR [ ❗ ]

           Codigo hecho por @BrunoSobrino
       Github: https://github.com/BrunoSobrino

       Nota: Solo hay disponibles efectos en
       ingles, por lo que el texto en otros
       idiomas puede sonar raro.

//////////////////////////////////////////////*/

import axios from 'axios';
import fetch from 'node-fetch';
const handler = async (m, {conn, usedPrefix, command, text, args}) => {
  const [efecto, ...textoArray] = text.split(' ');
  const texto = textoArray.join('');

  if (!efecto) {
    const voiceList = await getVoiceList();
    let responseText = `*[❗] Não inseriu nenhum efeito, por favor insira um efeito de voz.*\n\n*—◉ Use um dos seguintess efeitos:*\n`;

    for (let i = 0, count = 0; count < 100 && i < voiceList.resultado.length; i++) {
      const entry = voiceList.resultado[i];
      if (entry.ID.length <= 20) {
        responseText += `*◉ ${usedPrefix + command} ${entry.ID} tu_texto_aquí*\n`;
        count++;
      }
    }

    return conn.sendMessage(m.chat, {text: responseText.trim()}, {quoted: m});
  }

  let efectoValido = false;
  const voiceList = await getVoiceList();
  for (const entry of voiceList.resultado) {
    if (entry.ID === efecto) {
      efectoValido = true;
      break;
    }
  }

  if (!efectoValido) return conn.sendMessage(m.chat, {text: `*[❗] O efeito selecionado não existe na lista, Use ${usedPrefix + command} para ver a lista de efeitos.*`}, {quoted: m});

  if (!texto) return conn.sendMessage(m.chat, {text: `*[❗] Insira o texto que quer converter em audio.*\n\n*—◉ Exemplo:*\n*◉ ${usedPrefix + command} ${efecto} Oi, essa é uma mensagem de exemplo. do comando.*`}, {quoted: m});

  const masivo = await makeTTSRequest(texto, efecto);
  conn.sendMessage(m.chat, {audio: {url: masivo.resultado}, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});
};

handler.command = /^(g?tts2)$/i;
export default handler;

const secretKey = 'fe2ee40099494579af0ecf871b5af266';
const userId = 'SrgwcKcLzSY63IdsAxd1PzscFjL2';

async function getVoiceList() {
  const url = 'https://play.ht/api/v2/voices';
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'AUTHORIZATION': `Bearer ${secretKey}`,
      'X-USER-ID': userId,
    },
  };
  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    const uniqueData = responseData.reduce((acc, current) => {
      if (!acc.some((item) => item.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);
    const simplifiedList = uniqueData.map((entry) => ({
      ID: entry.id,
      name: entry.name,
      lenguaje: entry.language,
    }));
    return {resultado: simplifiedList ? simplifiedList : '[❗] Error, não se obteve resposta da API.'};
  } catch (error) {
    console.error('Error:', error);
    return {resultado: '[❗] Error, não se obteve resposta da API.'};
    throw error;
  }
}

async function makeTTSRequest(texto, efecto) {
  const requestData = {text: texto, voice: efecto};
  const headers = {
    'Authorization': `Bearer ${secretKey}`,
    'X-User-Id': userId,
    'accept': 'text/event-stream',
    'content-type': 'application/json',
  };
  try {
    const response = await axios.post('https://play.ht/api/v2/tts', requestData, {headers});
    const events = response.data.split('\r\n\r\n');
    const eventData = events.find((event) => event.includes('"stage":"complete"'));
    const urlMatch = eventData.match(/"url":"([^"]+)"/);
    const url = urlMatch ? urlMatch[1] : null;
    return {resultado: url ? url : '[❗] URL no encontrada en la respuesta.'};
  } catch (error) {
    console.error('Error:', error);
    return {resultado: '[❗] Error, no se obtuvo respuesta de la API.'};
  }
}
