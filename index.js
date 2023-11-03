
const menu = require('./menu.json')
const express = require("express")
const cors = require("cors");
const mysql = require('mysql2');
const app = express()
app.use(cors());
app.use(express.json());


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "burguertic",
});


connection.connect((err) => {
    if (err) {
        console.error("Error conectándose: " + err);
        return;
    }


    console.log("Base de datos conectada");
});


app.get('/menu', (req, res) => {


    connection.query("SELECT * FROM platos", (err, rows) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        }


        res.json(rows);
    });


})
app.get('/menu/:id', (req, res) => {
    const id = req.params.id;


    /*  res.json(menu);*/
    connection.query("SELECT * FROM platos WHERE id = ?", [id], (err, rows) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        }


        res.json(rows);
    });
})
app.get('/combos', (req, res) => {


    connection.query("SELECT * FROM platos WHERE tipo = 'combo'", (err, rows) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        }


        res.json(rows);
    });
})
app.get('/principales', (req, res) => {
    connection.query("SELECT * FROM platos WHERE tipo = 'principal'", (err, rows) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        }


        res.json(rows);
    });
})
app.get('/postres', (req, res) => {
    connection.query("SELECT * FROM platos WHERE tipo = 'postre'", (err, rows) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        }


        res.json(rows);
    });
})
app.post('/pedido', (req, res) => {
    const pedido = req.body.productos; // Obtiene los productos del cuerpo de la solicitud


    // Realiza tu consulta SQL para crear el pedido
    const pedidoQuery = "INSERT INTO pedidos (fecha, estado, id_usuario) VALUES (?, 'pendiente', ?)";


    connection.query(pedidoQuery, [new Date(), 1], (err, result) => {
        if (err) {
            console.error("Error al insertar el pedido: " + err);


        } else {




            const id_pedido = result.insertId;


            pedido.forEach(producto => {
                const productoQuery = "INSERT INTO pedidos_platos (id_pedido, id_plato, cantidad) VALUES (?, ?, ?)";
                connection.query(productoQuery, [id_pedido, producto.id, producto.cantidad], (err, result) => {
                    if (err) {
                        console.error("Error al insertar el producto en el pedido: " + err);
                        res.status(500).send("Error al insertar el producto en el pedido");
                    }
                });
            });


            console.log("Pedido y productos creados con éxito.");
        }
    });
});


app.get('/pedidos/:id', (req, res) => {
    const usuarioID = req.params.id;
    connection.query(
        "SELECT p.id AS pedido_id, p.fecha, p.estado, p.id_usuario, pp.id AS pedido_plato_id, pp.cantidad, plato.id AS plato_id, plato.nombre AS plato_nombre, plato.precio " +
        "FROM pedidos p " +
        "INNER JOIN pedidos_platos pp ON p.id = pp.id_pedido " +
        "INNER JOIN platos plato ON pp.id_plato = plato.id " +
        "WHERE p.id_usuario = ?",
        [usuarioID],
        (err, results) => {
            if (err) {
                console.error("Error consultando: " + err);
                return res.status(500).send("Error interno del servidor");
            }
            if (results.length === 0) {
                return res.status(404).send("El usuario no tiene platos ni pedidos");
            }


            const pedidosDetalles = {};


            results.forEach(row => {
                const pedidoId = row.pedido_id;
                if (!pedidosDetalles[pedidoId]) {
                    pedidosDetalles[pedidoId] = {
                        id: pedidoId,
                        fecha: row.fecha,
                        estado: row.estado,
                        id_usuario: row.id_usuario,
                        platos: []
                    };
                }
                pedidosDetalles[pedidoId].platos.push({
                    id: row.plato_id,
                    nombre: row.plato_nombre,
                    precio: row.precio,
                    cantidad: row.cantidad,
                    pedido_plato_id: row.pedido_plato_id
                });
            });


            const pedidosArray = Object.values(pedidosDetalles);


            res.json(pedidosArray);
        }
    );
});

app.listen(3000, () => {
    console.log("Example app is running on port 3000");
})









