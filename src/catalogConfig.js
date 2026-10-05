const common=[['titulo','Título','text',true],['genero','Género'],['plataforma','Plataforma'],['anio_lanzamiento','Año de lanzamiento','number'],['calificacion','Calificación','number']];
export const adminConfig={
 usuarios:{title:'Usuarios',singular:'usuario',id:'id_usuario',columns:[['nombre','Nombre'],['correo','Correo'],['rol','Rol']],fields:[['nombre','Nombre','text',true],['correo','Correo electrónico','email',true],['password','Contraseña','password',true],['rol','Rol','select',true]],description:'Crea cuentas y administra el acceso a Cine & Play.'},
 peliculas:{title:'Películas',singular:'película',id:'id_pelicula',columns:[['titulo','Título'],['genero','Género'],['anio_lanzamiento','Año'],['calificacion','Calificación']],fields:[...common,['director','Director'],['actores','Actores','textarea'],['productora','Productora'],['duracion_minutos','Duración en minutos','number'],['clasificacion','Clasificación']],description:'Mantén al día las películas que conoce tu asistente.'},
 videojuegos:{title:'Videojuegos',singular:'videojuego',id:'id_videojuego',columns:[['titulo','Título'],['genero','Género'],['plataforma','Plataforma'],['calificacion','Calificación']],fields:[...common,['desarrollador','Desarrollador'],['jugadores','Jugadores']],description:'Administra las aventuras disponibles en tu catálogo.'}
};
export function recordPayload(config,values){
 const body={};
 for(const [key,,type,required] of config.fields){
  const raw=values[key] ?? '';
  if(type==='number'){body[key]=raw==='' ? null : Number(raw);if(body[key]!==null && !Number.isFinite(body[key]))throw new Error('Introduce un número válido.');}
  else if(key==='password') body[key]=raw;
  else body[key]=String(raw).trim() || (required ? '' : null);
 }
 return body;
}
