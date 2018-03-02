/**
 * Created by ivan.martinez.ariza on 28/02/18.
 */

//Todos los comandos sacan el objetos al hacer una funcion porque haces rl.prompt, pero sin embargo rl se define en main, como en todos las funciones hemos puesto rl como que se le pasa, y dentro de main tambien lo hemos puesto nos aseguramos de que no haya problemas.

//COMO USO EL MODELO Y VOY A USAR COLORES IMPLEMENTO DICHAS FUNCIONES TAMBIÉN EN ESTA CLASE
const { log, biglog, errorlog, colorize} =require("./out");
const model = require('./model');

/**
 * Muestra la ayuda
 * @param rl Obejto readline usado para implementar el CLI.
 */
exports.helpCmd = rl => {
    log('Comandos :');
    log("h|help - Muestra esta ayuda");
    log("list - Listar los quizzes existentes");
    log("show <id> - Muestra la pregunta y la respuesta el quiz indicado");
    log("add - Añadir un nuevo quiz interactivamente.");
    log("delete <id> - Borrar el quiz indicado");
    log("edit <id> - Editar el quiz indicado");
    log("test <id> - Probar el quiz indicado");
    log("p|play - Jugar a preguntar aleatoriamente todos los quizzes");
    log("credits - Créditos");
    log("q|quit - Salir del programa.");
    rl.prompt();
};
/**
 * Lista de todos los quizzes existentes en el modelo
 */

//Ahora vamos a implementarlo.
exports.listCmd = rl => {
    model.getAll().forEach((quiz,id) => {
        log(` [${colorize(id,'magenta')}]: ${quiz.question}`);//para sacar una cosa por pantalla
    });//Esta funcion recorre el array y va a imprimir por pantalla cada uno de los quizzes. Le tenemos que pasar varios argumentos
    //log("Listar los quizzes existentes",'red');
    rl.prompt();
};
/**
 * Muestra la ayuda
 * @param id Clave del quiz a mostrar
 * @param rl Objeto readline usado para implemetnar el CLI
 */
exports.showCmd = (rl,id) => {
    //primero comprobamos si esta el parametro id, si no saco mensaje de error. SI si esta hacemos lo siguiente:

    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else {
        //si si ha llegado el id intento acceder a esa pregunta y me lo guardo en quiz.Pongo el numerito id entre corchetes y acontinuacion el quiz question una flecha morada y el quiz la respuesta
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id,'magenta')}]: ${quiz.question} ${colorize("=>",'magenta')} ${quiz.answer}`);
        }catch(error){
            errorlog(error.message);
        }
    }
        //log("Mostrar el quiz indicado");
    rl.prompt();
};
/**
 * Añade un nuevo quizz al modelo
 * Pregunta interactivamente por la pregunta y la respuesta
 *  @param rl Objeto readline usado para implemetnar el CLI
 */
//La llamada a prompt la hago dentro cuando ya he terminado todas las preguntaS. me sca a 3
exports.addCmd = rl => {
    //log("Añadir un nuevo quiz",'red');
    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
        rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
            model.add(question, answer);
            log(`${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`)
    rl.prompt();
    });
    });
    };
/**
 * Borra un quiz del modelo
 * @param id Clave del quiz a borrar en el modelo
 */
exports.deleteCmd = (rl,id) => {
    //log("Borrar el quiz indicado",'red');
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else {
        //si si ha llegado el id intento acceder a esa pregunta y me lo guardo en quiz.Pongo el numerito id entre corchetes y acontinuacion el quiz question una flecha morada y el quiz la respuesta
        try{
            model.deleteByIndex(id);
        }catch(error){
            errorlog(error.message);
        }
    }
    //log("Mostrar el quiz indicado");
    rl.prompt();

};
/**
 * Edita un quiz del modelo
 * @param id Clave del quiz a borrar en el modelo
 *  @param rl Objeto readline usado para implemetnar el CLI
 */

exports.editCmd = (rl,id) => {
    //log("Editar el quiz indicado",'red');
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else {
        //como tenemos una parte asincrona que tarda en contestarse metemos el rl.prompt dentro, ya que sino se programa directamente y salta el prompt. ES una forma de retrasarlo hasta el momento adecuado.

        //Si me han pasado el parametro entro en el try, sin errores ni nada, lo que hace es primero sacar una pregunta para que la responda el usuario (lladma a question)(como en add cuando añadiamos una pregunta). La funcion ademas me pregunta cual es la respuesta exactamente como el add. Actualizo el array para que en el posicion id me ponga esa pregunta y esa respuesta, y es entonces cuando saco el prompt.
        try{
            //antes de hacer la pregunta hago la llamada a write para meterle una serie de letras, para ello le mete un tiemout para que no haya problema. Es como si yo hubiera escrito la pregunta, pero como no quiero ejecutarlo ya le paso el timeout.Si la salida estandar es un tty hace eso, antes de preguntar cual es la respuesta yo escribo el texto.

            //nos da error porque no hemos definido la constante quiz previamente, asi que la creamos.
// ESto lo hacemos para poder movernos con las fichas del cursor sobre el texto ya existente y no tener que escribir todo
            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
                model.update(id, question, answer);
                log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt();
            });
        });
        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }

};

//rl.write simula que escribes por el teclado pero solo es valido con un tty
/**
 * Prueba un quiz, es decir, hace una pregunta al modelo a la que debemos de preguntar
 * @param id Clave del quiz a editar en el modelo
 *  @param rl Objeto readline usado para implemetnar el CLI
 */
exports.testCmd = (rl,id) => {
    // tenemos que ver si es igual la respuesta de la pregunta que nos pasan a la que tenemos como definición entoncés sera correcto, en otro caso será incorrecto.
    if(typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
            try{
                const quiz = model.getByIndex(id);
                rl.question(colorize(`Pregunta:  ${quiz.question}`, 'red'), respuesta => {
                           if(respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
                                log(`CORRECTA `,'green');
                            }else{
                                log(`INCORRECTA `,'red');
                            }
                            rl.prompt();

                });
            } catch(error){
                errorlog(error.message);
                rl.prompt();
            }

    }
};
//Llamo  a rl con la question y vemos el callback de los cuyons

    //log("Probar el quiz indicado", 'red');
    //rl.prompt();
    // lo quito porque es comportamienteo asincrono


/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio
 * Se gana si se contesta a todos satisfactoriamente
 *  @param rl Objeto readline usado para implemetnar el CLI
 */
exports.playCmd = rl => {
    let puntos = 0;
    let por_contestar = [];

    //const quiz = model.getByIndex(i);
    var i=0;
    model.getAll().foreach(quiz,id){
         por_contestar[id] = model.getByIndex(id); //me devuele pregunta y respuesta
     }
     if(por_contestar.lenght == 0){
        errorlog("No hay más preguntas. Fin del juego");
        rl.prompt();
     }
     var identi = Math.floor(Math.random() * por_contestar.length);
     const quiz = por_contestar[identi];
         try {
                  rl.question(colorize(`Pregunta:  ${quiz.question}`, 'red'), respuesta => {
                 if(respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
                 log(`CORRECTO `, 'green');
                 por_contestar.deleteByIndex(identi);
                 model.update();
                 puntos++;
                 log(puntos);

             }
         else
             {
                 log(`INCORRECTA `, 'red');
                 log(`FIN`);
             }
             rl.prompt();

         })
             ;
         } catch (error) {
             errorlog(error.message);
             rl.prompt();
         }

    };
    //quiero una variable que se llame puntos para almacenar cuantas preguntas he ido acertando
            //let score = 0;
            //para no repetir las preguntas creo un array que  diga las preguntas que me queden por contestar
            //let toBeResolved =[];
            //for meter_id

                //if(){} else{
                  //  let id = azar;
                    //cojo una pregunta al azar de las que hay en el array de que deben ser contestar
                //esta vacuio el array to be resolved como no hay nada que responder saco un mensaje que no hay nada que contestar)

/**
 * Muestra los nombres de los autores de la práctica.
 *  @param rl Objeto readline usado para implemetnar el CLI
 */

exports.creditsCmd = rl => {
    log("Autores de la práctica:");
    log("IVAN", 'green');
    log("CRISTINA", 'green');
    rl.prompt();
};
/**
 * Termina el programa
 * @param rl Objeto readline usado para implemetnar el CLI
 */
exports.quitCmd = rl => {
    rl.close();
};


