import fetch from 'node-fetch';
import {sizeFormatter} from 'human-readable';
const formatSize = sizeFormatter({
  std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B`});
const handler = async (m, {conn, args}) => {
  if (!args[0]) throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚁𝚁𝙾𝚁,POR FAVOR TENTE NOVAMENTE*\n\n*- ESCREVA UM LINK QUE 𝚂𝙴J𝙰 𝚂𝙸𝙼𝙸𝙻𝙰𝚁 𝙰:*\n*◉ https://drive.google.com/file/d/1dmHlx1WTbH5yZoNa_ln325q5dxLn1QHU/view*';
  try {
    GDriveDl(args[0]).then(async (res) => {
      conn.reply(m.chat, 'baixando seu arquivo, espere um momento...\n\n O tempo de espera pode variar dependendo do peso do arquivo, se o peso supera 100 𝑀𝐵 talvez o arquivo nao sera enviado', m);
      if (!res) throw res;
      conn.sendFile(m.chat, res.downloadUrl, res.fileName, '', m, null, {mimetype: res.mimetype, asDocument: true});
    });
  } catch (e) {
    m.reply('*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚁𝚁𝙾𝚁,POR FAVOR TENTE NOVAMENTE*\n\n*- ESCREVA UM LINK QUE 𝚂𝙴J𝙰 𝚂𝙸𝙼𝙸𝙻𝙰𝚁 𝙰:*\n*◉ https://drive.google.com/file/d/1dmHlx1WTbH5yZoNa_ln325q5dxLn1QHU/view*');
    console.log(e);
  }
};
handler.command = /^(gdrive)$/i;
export default handler;
async function GDriveDl(url) {
  let id;
  if (!(url && url.match(/drive\.google/i))) throw 'Invalid URL';
  id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1];
  if (!id) throw 'ID Not Found';
  const res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
    method: 'post',
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      'content-length': 0,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'origin': 'https://drive.google.com',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
      'x-client-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=',
      'x-drive-first-party': 'DriveWebUi',
      'x-json-requested': 'true'}});
  const {fileName, sizeBytes, downloadUrl} = JSON.parse((await res.text()).slice(4));
  if (!downloadUrl) throw 'Link Download Limit!';
  const data = await fetch(downloadUrl);
  if (data.status !== 200) throw data.statusText;
  return {downloadUrl, fileName, fileSize: formatSize(sizeBytes), mimetype: data.headers.get('content-type')};
}
