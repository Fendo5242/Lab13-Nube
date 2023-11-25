const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const secretKey = 'tuClaveSecreta';
const verificationCodes = {};

const client = twilio('AC9f72a1799617d93012812b5fb0d26564', 'fd1299e8e5994ebd43d3c768c17c51cd');

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'usuario' && password === 'contrasena') {
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    verificationCodes[username] = verificationCode;

    // Cambia 'tuNumeroTwilio' con el número de teléfono real del usuario
    enviarCodigoPorSMS(username, '+51946095843', verificationCode);

    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ mensaje: 'Credenciales inválidas' });
  }
});

app.post('/verify', (req, res) => {
  const { username, code } = req.body;

  if (verificationCodes[username] && parseInt(code) === verificationCodes[username]) {
    res.json({ mensaje: 'Código verificado correctamente' });
  } else {
    res.status(401).json({ mensaje: 'Código inválido' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

function enviarCodigoPorSMS(username, userPhoneNumber, code) {
  client.messages
    .create({
      body: `Tu código de verificación es: ${code}`,
      from: '+51946095843', // Reemplaza con tu número Twilio
      to: userPhoneNumber
    })
    .then(message => console.log('SMS enviado:', message.sid))
    .catch(error => console.error('Error al enviar SMS:', error));
}
