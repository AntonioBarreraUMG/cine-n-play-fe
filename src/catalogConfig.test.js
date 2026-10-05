import test from 'node:test';
import assert from 'node:assert/strict';
import {adminConfig,recordPayload} from './catalogConfig.js';
import {errorMessage} from './api.js';
test('keeps players as text and empty optional fields null',()=>{const body=recordPayload(adminConfig.videojuegos,{titulo:' Juego ',jugadores:'1-4 jugadores',calificacion:'9.2'});assert.equal(body.titulo,'Juego');assert.equal(body.jugadores,'1-4 jugadores');assert.equal(body.calificacion,9.2);assert.equal(body.genero,null);assert.equal(body.fecha_registro,undefined);});
test('does not trim passwords or send IDs',()=>{const body=recordPayload(adminConfig.usuarios,{nombre:' Jean ',correo:'jean@example.com',password:' a password ',rol:'admin',id_usuario:1});assert.equal(body.password,' a password ');assert.equal(body.id_usuario,undefined);});
test('explains validation error arrays',()=>{assert.equal(errorMessage([{loc:['body','correo'],msg:'Invalid email'}]),'correo: Invalid email');});
