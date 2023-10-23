const menu = require('./menu.json');
const express = require("express");
const cors = require("cors");
app.use(cors());
app.use(express());


// Ruta GET /menu que devuelve el menú completo
app.get('/menu', (req, res) => {
    res.json(menu);
});

// Ruta GET para obtener el elemento con id 6 del menú
app.get('/menu.id', (req, res) => {
    const menuItem = menu.find(item => item.id === 6);
    if (menuItem) {
        res.json(menuItem);
    } else {
        res.status(404).json({ error: 'Elemento no encontrado' });
    }
});

app.get('/menu.combo', (req, res) => {
    const comboItems = menu.filter(item => item.tipo === "combo");
    if (comboItems.length > 0) {
        res.json(comboItems);
    } else {
        res.status(404).json({ error: 'Elementos de combo no encontrados' });
    }
});

app.get('/menu.principal', (req, res) => {
    const principalItems = menu.filter(item => item.tipo === "principal");
    if (principalItems.length > 0) {
        res.json(principalItems);
    } else {
        res.status(404).json({ error: 'Elementos de Principal no encontrados' });
    }
});

app.get('/menu.postre', (req, res) => {
    const postreItems = menu.filter(item => item.tipo === "postre");
    if (postreItems.length > 0) {
        res.json(postreItems);
    } else {
        res.status(404).json({ error: 'Elementos de postre no encontrados' });
    }
});

const pedidoPlatos = [1, 3, 5]; // Ejemplo de IDs de platos

let precioTotal = 0;

for (const id of pedidoPlatos) {
    const plato = menu.find((plato) => plato.id === id);
    if (plato) {
        precioTotal += plato.precio;
    }
}

app.post('/pedido', (req, res) => {
    res.json({
        msg: "Pedido recibido",
        precio: precioTotal
    });
});


const port = 3000; // Puerto en el que escuchará la aplicación
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});