const express = require('express');
const mysql = require('mysql2');
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "rootroot",
    database: "burger_tic",
});


connection.connect((err) => {
    if (err) {
        console.error("Error conectándose: " + err);
        return;
    }


    console.log("Base de datos conectada");
});


app.get("/menu", (req, res) => {
    connection.query("SELECT * FROM platos", (err, rows) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        }


        res.json(rows);
    });
});


app.get("/menu/:id", (req, res) => {
    const id = parseInt(req.params.id);
    connection.query("SELECT * FROM platos WHERE id=?", [id], (err, rows) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        }
        if (rows.length === 0) {
            res.status(404).json({ msg: 'Plato no encontrado' });
        }
        else {
            res.json(rows[0]);
        }
    });
});


app.get("/combos", (req, res) => {
    connection.query("SELECT * FROM platos WHERE tipo = 'combo'", (err, rows) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        }
        else {
            res.json(rows);
        }
    });
})


app.get("/principales", (req, res) => {
    connection.query("SELECT * FROM platos WHERE tipo = 'principal'", (err, rows) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        }
        else {
            res.json(rows);
        }
    });
});


app.get("/postres", (req, res) => {
    connection.query("SELECT * FROM platos WHERE tipo = 'postre'", (err, rows) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        }
        else {
            res.json(rows);
        }
    });
});


app.post("/pedido", async (req, res) => {
    const pedido = req.body;
    let precio = 0;
    if (!pedido.productos) return res.status(404).json({ msg: 'Su pedido está vacio' });
    if (pedido.productos.length == 0) return res.status(404).json({ msg: 'No agregó productos' });
    connection.query("INSERT INTO pedidos (id_usuario, fecha, estado) VALUES (1,'" + new Date().toISOString() + "','pendiente' )", (err, result) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        } else {
            const id_pedido = result.insertId;
            let insert = "INSERT INTO pedidos_platos (id_pedido, id_plato, cantidad) VALUES ";
            let argumentos = [];
            pedido.productos.forEach((plato, i) => {
                insert += "(?, ?, ?)";
                argumentos.push(id_pedido, plato.id, plato.cantidad)
                if (i !== pedido.productos.length - 1) {
                    insert += ", ";
                }


            })
            connection.query(insert, argumentos, (err, result) => {
                if (err) {
                    console.error("Error consultando: " + err);
                    return;
                }
                else {
                    res.status(200).json({ msg: 'todo bien' });
                }
            });
        }
    });






});


app.get("/pedidos/:id", (req, res) => {
    const id = req.params.id;
    connection.query("SELECT pedidos.*, platos.*, pedidos_platos.id_pedido, pedidos_platos.cantidad FROM pedidos INNER JOIN pedidos_platos ON pedidos.id = pedidos_platos.id_pedido INNER JOIN platos ON pedidos_platos.id_plato=platos.id WHERE pedidos.id_usuario=?", id, (err, rows) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        }
        else {
            let pedidos = []
            rows.forEach((row) => {
                if (!pedidos.find((p) => p.id === row.id_pedido)){
                    pedidos.push({
                        "id": row.id_pedido,
                        "fecha": row.fecha,
                        "estado": row.estado,
                        "id_usuario": row.id_usuario,
                        "platos": [
                            {
                                "id": row.id,
                                "nombre": row.nombre,
                                "precio": row.precio,
                                "cantidad": row.cantidad
                            }
                        ]
                    })
                } else {
                    const newPedido = pedidos.find((p) => p.id === row.id_pedido);
                    newPedido.platos.push({
                        "id": row.id,
                        "nombre": row.nombre,
                        "precio": row.precio,
                        "cantidad": row.cantidad});
                    pedidos = pedidos.filter((p) => p.id !== row.id_pedido);
                    pedidos.push(newPedido);
                }
            });
            res.json(pedidos);
        }
    });
});


app.listen(9000, () => console.log("API running on port 3000"));