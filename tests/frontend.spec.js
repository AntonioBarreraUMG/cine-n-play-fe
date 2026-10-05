import { test,expect } from '@playwright/test';
const user={id_usuario:1,nombre:'Jean',correo:'jean@example.com',rol:'admin',fecha_registro:'2026-10-04T18:00:00Z'};
async function setup(page,{role='admin',chatError=false}={}){
 const calls=[];let movies=[{id_pelicula:1,titulo:'El Padrino',genero:'Drama',calificacion:'9.2',anio_lanzamiento:1972,director:'Francis Ford Coppola'}];
 await page.route('http://127.0.0.1:8000/**',async route=>{
  const request=route.request();const url=new URL(request.url());const method=request.method();const body=request.postDataJSON();calls.push({path:url.pathname,method,body});
  let data={};let status=200;
  if(method==='OPTIONS'){await route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*'}});return;}
  if(url.pathname==='/auth/login')data={access_token:'test-token',token_type:'bearer'};
  else if(url.pathname==='/auth/me')data={...user,rol:role};
  else if(url.pathname==='/auth/logout')status=204;
  else if(url.pathname==='/chat'){if(chatError){status=502;data={detail:'Servicio temporalmente no disponible'};}else data={id_conversacion:1,pregunta:body.pregunta,respuesta:'El Padrino es una película de drama del catálogo.',categoria:'peliculas',tokens:2507,fecha:'2026-10-04T18:00:00Z'};}
  else if(url.pathname==='/historial')data=[{id_conversacion:1,pregunta:'Dame películas',respuesta:'El Padrino',fecha:'2026-10-04T18:00:00Z'}];
  else if(url.pathname==='/consumo')data={peliculas:2507,videojuegos:1000,total:3507};
  else if(url.pathname==='/usuarios')data=[{...user,rol:role}];
  else if(url.pathname==='/peliculas' && method==='GET')data=movies;
  else if(url.pathname==='/peliculas' && method==='POST'){const item={...body,id_pelicula:2};movies.push(item);data=item;status=201;}
  else if(url.pathname==='/peliculas/1' && method==='PUT'){movies[0]={...body,id_pelicula:1};data=movies[0];}
  else if(url.pathname==='/peliculas/2' && method==='DELETE'){movies=movies.filter(m=>m.id_pelicula!==2);status=204;}
  else if(url.pathname==='/videojuegos')data=[];
  await route.fulfill({status,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:status===204 ? '' : JSON.stringify(data)});
 });
 return calls;
}
async function login(page){await page.goto('/login');await page.getByLabel('Correo electrónico').fill('jean@example.com');await page.getByLabel('Contraseña',{exact:true}).fill('password123');await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();await expect(page).toHaveURL(/\/chat$/);}
test('login, independent chat, navigation, consumption and logout',async({page})=>{
 const calls=await setup(page);await login(page);
 await page.getByLabel('Tu pregunta').fill('Dame tres películas de drama');await page.getByRole('button',{name:'Enviar pregunta',exact:true}).click();
 await expect(page.getByText('El Padrino es una película de drama del catálogo.')).toBeVisible();
 expect(calls.find(c=>c.path==='/chat').body).toEqual({pregunta:'Dame tres películas de drama'});
 await page.getByRole('link',{name:'Historial',exact:true}).click();await expect(page.getByRole('cell',{name:'El Padrino',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Mi consumo',exact:true}).click();await expect(page.getByText('Total utilizado',{exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Conversar',exact:true}).click();await expect(page.getByText('El Padrino es una película de drama del catálogo.')).toBeVisible();
 await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();await expect(page).toHaveURL(/\/login$/);expect(calls.some(c=>c.path==='/auth/logout')).toBeTruthy();
});
test('normal users cannot enter administrative routes',async({page})=>{
 await setup(page,{role:'usuario'});await login(page);await expect(page.getByRole('link',{name:'Usuarios',exact:true})).toHaveCount(0);await page.goto('/admin/usuarios');await expect(page).toHaveURL(/\/chat$/);
});
test('catalog creation editing and confirmed deletion',async({page})=>{
 const calls=await setup(page);await login(page);await page.getByRole('link',{name:'Películas',exact:true}).click();await expect(page.getByRole('cell',{name:'El Padrino',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Crear película',exact:true}).click();await page.getByLabel('Título',{exact:true}).fill('Nueva película');await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();await expect(page.getByRole('cell',{name:'Nueva película',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Editar El Padrino',exact:true}).click();await page.getByLabel('Título',{exact:true}).fill('El Padrino editado');await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();await expect(page.getByRole('cell',{name:'El Padrino editado',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Eliminar Nueva película',exact:true}).click();expect(calls.some(c=>c.method==='DELETE')).toBeFalsy();await page.getByRole('button',{name:'Eliminar registro',exact:true}).click();await expect(page.getByRole('cell',{name:'Nueva película',exact:true})).toHaveCount(0);
});
test('chat failure retains question and avoids fake response',async({page})=>{
 await setup(page,{chatError:true});await login(page);await page.getByLabel('Tu pregunta').fill('Dame juegos');await page.getByRole('button',{name:'Enviar pregunta',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Servicio temporalmente no disponible');await expect(page.getByLabel('Tu pregunta')).toHaveValue('Dame juegos');
});
test('expired session redirects to login',async({page})=>{
 await setup(page);await login(page);await page.route('**/historial?*',route=>route.fulfill({status:401,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({detail:'Sesión inválida o expirada'})}));await page.getByRole('link',{name:'Historial',exact:true}).click();await expect(page).toHaveURL(/\/login$/);await expect(page.getByRole('alert')).toContainText('Tu sesión terminó');
});
test('desktop and mobile layouts',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await setup(page);await page.setViewportSize({width:1440,height:1000});await page.goto('/login');await page.screenshot({path:'preview/login.png',fullPage:true});await login(page);await page.screenshot({path:'preview/chat.png',fullPage:true});
 await page.getByRole('link',{name:'Mi consumo',exact:true}).click();await expect(page.getByText('Total utilizado',{exact:true})).toBeVisible();await page.screenshot({path:'preview/consumo.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.goto('/chat');await expect(page.getByLabel('Tu pregunta')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();await page.getByRole('button',{name:'Abrir menú',exact:true}).click();await page.getByRole('link',{name:'Usuarios',exact:true}).click();await expect(page.getByRole('heading',{name:'Usuarios',exact:true})).toBeVisible();await page.screenshot({path:'preview/movil.png',fullPage:true});expect(errors).toEqual([]);
});
