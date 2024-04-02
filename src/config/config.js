import * as dotenv from 'dotenv';
import * as commander from 'commander';

const { Command } = commander;

const program = new Command();

program
    .option('-d', 'Variable para debug', { noArgs: true })
    .option('-p <port>', 'Puerto del servidor', 9090)
    .option('--mode <mode>', 'Modo de trabajo', 'development')

program.parse();

console.log("Mode Option: ", program.opts().mode);

const environment = program.opts().mode;

let envFilePath = "./src/config/.env.development"; // Establecer el archivo .env predeterminado

if (environment === "testing") {
    envFilePath = "./src/config/.env.testing";
} else if (environment === "production") {
    envFilePath = "./src/config/.env.production";
}

dotenv.config({ path: envFilePath });

export default {
    port: process.env.PORT,
    mongoUrl: process.env.MONGO_URL,
    gmailAcount: process.env.GMAIL_ACCOUNT,
    gmailAppPassword: process.env.GMAIL_APP_PASSWD,
    environment: environment
};
