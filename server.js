const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const ExcelJS = require('exceljs')
const moment = require('moment');
const { Client, MessageMedia } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal');

const SESSION_FILE_PATH = './session.json';
  let client
  let sessionData;

//guarda session
const withSession = () => {
  const spinner =  ora(`Carregando ${chalk.yellow('Validando sessão do WhatsApp...')}`)
  sessionData = require(SESSION_FILE_PATH)

  spinner.start()

  client = new Client({
    session:sessionData
  })

  client.on('ready', ()=>{
    console.log('Cliente is Ready');
    spinner.stop();
    listenMenssage();
  })

  client.on('auth_failure', () => {
    spinner.stop();
    console.log('** Error de atenticação, erro ao gerar QRCode')
  })

  client.initialize();

}


const withOutSession = () => {
  
  console.log('Não tem Sessões iniciada');
  client = new Client();
  //conectando QR code WhatssApp
  client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
  });

  client.on('authenticated', (session) => {
    //guardando a sesssao iniciada 
    console.log('AUTHENTICATED', session);
    sessionData=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
}); 


  client.initialize();


}


//escutar cada mensegame WhatssApp
const listenMenssage = () => {
  client.on('message', (msg) => {
    const { from, to, body } = msg;

    //definindo mensagem automaticas em cses:
    switch (body) {
        case 'quero_infor':
          sendMessage(from, 'qual informação voce quer ? ')
        break;
        case 'adeus':
          sendMessage(from, 'testenado aplicação')
        break;
        case 'image':
          sendMessage(from, 'imagem_perfil')
          sendMedia(from, 'lin.jpg');  
        break;
        }
        saveHistorial(from, body,);

      console.log(`${chalk.yellow(body)}`)

  })
}


const sendMedia=(to, file) => {
  //
  const mediaFile = MessageMedia.fromFilePath(`./mediaSend/${file}`)
  client.sendMessage(to, mediaFile)
}



//enviar mensagem
const sendMessage = (to, message) => {
  client.sendMessage(to, message)
}



/**
 * Criando historico de chats das conections
 * **/


(fs.existsSync(SESSION_FILE_PATH))? withSession() : withOutSession();