const { response, request } = require("express")
const express = require("express")
const fs = require('fs')
const fsPromise = require("fs/promises")
const app = express()

// app.get("/", (request, response) => {
//     response.write("Bienvenido a nuestra api de express");
//     response.end()
// });
// app.get("/files-callbacks",(request, response) => {
//     fs.readFile("text1.txt", "utf8", (err, data) => {
//         if(err) {
//             response.write("Hubo un error");
//         }
//         response.write(data);
//         response.end();
//     });

// });

// app.get("/files-promises", (request, response) => {
//     fsPromise.readFile("text1.txt", "utf8")
//     .then((data) => {
//         response.write(data);
//         response.end();
//     })
//     .catch((error) => {
//         response.write(error);
//         response.end();
//     })
// });

// recurso/identificador
/**
 * 1- PATH PARAM -> identificadores -> modifican la ruta del lado de back
 * / recurso/identificador -> /koders/:id
 * 2- QUERY PARAM -> No cambian la ruta -> Sirven para filtrar
 * ? modulo=AWS&edad=25
 */
app.use(express.json())
app.use((request, response, next) => {
    console.log("Estoy en mi middleware 1")
    console.log("body", request.body)
    next()
})

const middleware2 = (request, response, next) => {
    console.log("Estoy en el middleware 2")
    next()
}

app.get("/koders", async (request, response) => {
    const { query } = request
    const db = await fsPromise.readFile("koders.json", "utf8")
    const parseDB = JSON.parse(db)
    if(Object.keys(query).length){
        const foundFields = parseDB.koders.filter((koder) => koder.modulo === query.modulo)
        response.json(foundFields)
    } else {
        response.json(parseDB.koders)
    }
})

// Recibir un koder en especifico con el id
app.get("/koders/:id", async (request, response) => {
    const { params } = request
    const koderId = await fsPromise.readFile("koders.json", "utf8")
    const parsedDB = JSON.parse(koderId)
    const foundKoder = parsedDB.koders.filter((koder) => koder.id === Number(params.id))[0]
    response.json(foundKoder)

})

app.put("/koders/:id", async (request, response) => {
    const { body, params } = request
    const bdRead = await fsPromise.readFile("koders.json", "utf8")
    const parseDB = JSON.parse(bdRead)
    const index = parseDB.koders.findIndex((koder) => koder.id === Number(params.id))
    const koderToChange = {
        "id": Number(params.id),
        ...body
    }
    parseDB.koders[index] = koderToChange
    await fsPromise.writeFile("koders.json", JSON.stringify(parseDB, "\n", 2), "utf-8")
    response.json({success: true})

})

app.delete("/koders/:id", async (request, response) => {
    const { params } = request
    const bd = await fsPromise.readFile("koders.json", "utf8")
    const parsedDB = JSON.parse(bd)
    const kodersQueSeQuedan = parsedDB.koders.filter((koder) => koder.id !== Number(params.id))
    parsedDB.koders = kodersQueSeQuedan
    await fsPromise.writeFile("koders.json", JSON.stringify(parsedDB, "\n", 2), "utf-8")
    response.json({ success: true})
})

app.post("/koders", middleware2, async (request, response) => {
    const { body } = request
    const bd = await fsPromise.readFile("koders.json", "utf8")
    const parsedBD = JSON.parse(bd)
    const newKoder = {
        id: parsedBD.koders.length + 1,
        ...body
      }
      parsedBD.koders.push(newKoder)
      await fsPromise.writeFile("koders.json", JSON.stringify(parsedBD, "\n", 2), "utf8")
      response.status(201)
      response.json({ success: true })
})

app.listen(8080, () => {
    console.log("Server is listening...")
})
