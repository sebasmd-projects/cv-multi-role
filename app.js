/**
 * Arranque para Passenger (cPanel → Setup Node.js App → Application startup file).
 * Passenger asigna el puerto por variable de entorno; no se fija a mano.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
process.env.PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

require('./.next/standalone/server.js');
