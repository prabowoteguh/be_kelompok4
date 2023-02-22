const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().required(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.string().required(),
  price: Joi.number().precision(2).positive().required(),
  description: Joi.string().allow(null, '').max(255)
});

const PORT = process.env.PORT || 3000;
const DB_CONFIG = {
    host: "109.106.253.140",
    user: "u1579227_kelompok4",
    password: "boba_kelompok_4",
    database: "u1579227_kelompok4"
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const conn = mysql.createConnection(DB_CONFIG);

conn.connect(function(err) {
    if (err) throw err;
    console.log('Terhubung dengan database...');
});

app.listen(PORT, () => {
    console.log(`Server berjalan pada port ${PORT}`);
});

//view all items
app.get('/api/items', (req, res) => {
  const sql = 'SELECT * FROM items';
  conn.query(sql, (err, results) => {
    if (err) {
      console.error('Error saat menampilkan data:', err);
      return res.status(500).json({ error: 'Tidak dapat menampilkan data' });
    }

    const items = results.map(item => ({
      id: item.id,
      name: item.name,
      stock: item.stock,
      image: item.image,
      price: item.price,
      description: item.description
    }));

    res.status(200).json({ items });
  });
});

//view item
app.get('/api/showItem/:id', function(req, res) {
  const id = req.params.id;
  const sql = `SELECT * FROM items WHERE id = ?`;
  
  conn.query(sql, [id], (err, result) => {
    if (err) {
      res.status(500).json({
        status: 500,
        error: "Terjadi kesalahan pada server",
        response: null
      });
    } else if (result.length === 0) {
      res.status(404).json({
        status: 404,
        error: "Data tidak ditemukan",
        response: null
      });
    } else {
      res.status(200).json({
        status: 200,
        error: null,
        response: result
      });
    }
  });
});

// add item
app.post('/api/addItem', async function(req, res) {
  try {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).send({
        status: 400,
        error: error.details[0].message,
        response: null
      });
    }
    
    const { name, stock, image, price, description } = value;
    
    // Check if any of the values are empty
    if (!name || !stock || !image || !price || !description) {
      return res.status(400).send({
        status: 400,
        error: 'Semua data harus diisi',
        response: null
      });
    }
    
    const data = { name, stock, image, price, description };
    const sql = 'INSERT INTO items SET ?';
    const query = await conn.query(sql, data);
    
    const newId = query.insertId;
    const newData = { id: newId, ...data };
    
    return res.status(201).send({
      status: 201,
      error: null,
      message: `Item telah ditambahkan.`,
      response: newData
    });
  } catch (err) {
    return res.status(500).send({
      status: 500,
      error: "Terjadi kesalahan pada server",
      response: null
    });
  }
});

// update item
app.put('/api/editItem/:id', function(req, res) {
  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).send({
      status: 400,
      error: error.details[0].message,
      response: null
    });
  }

  const id = req.params.id;
  const { name, stock, image, price, description } = value;
  const data = {
    name: name,
    stock: stock,
    image: image,
    price: price,
    description: description,
  };

  const sql = `UPDATE items SET ? WHERE id = ?`;

  conn.query(`SELECT * FROM items WHERE id = ?`, [id], (err, result) => {
    if (err) {
      return res.status(500).send({
        status: 500,
        error: "Terjadi kesalahan pada server",
        response: null
      });
    } else if (result.length === 0) {
      return res.status(404).send({
        status: 404,
        error: "Data tidak ditemukan",
        response: null
      });
    } else {
      conn.query(sql, [data, id], (err, result) => {
        if (err) {
          return res.status(500).send({
            status: 500,
            error: "Terjadi kesalahan pada server",
            response: null
          });
        }
        return res.status(200).send({
          status: 200,
          error: null,
          message: `Item dengan id ${id} telah diubah.`,
          response: data
        });
      });
    }
  });
});

app.delete('/api/deleteItems', function(req, res) {
  const ids = req.body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      status: 400,
      error: "Parameter ids harus berupa array dengan setidaknya satu id.",
      response: null
    });
  }
  const placeholders = ids.map(() => '?').join(',');
  const sql = `DELETE FROM items WHERE id IN (${placeholders})`;
  conn.query(sql, ids, (err, result) => {
    if (err) {
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(404).json({
          status: 404,
          error: `Tidak dapat menemukan salah satu atau beberapa item dengan id yang diberikan.`,
          response: null
        });
      } else {
        return res.status(500).json({
          status: 500,
          error: "Gagal menghapus item.",
          response: null
        });
      }
    }
    res.status(200).json({
      status: 200,
      message: `Berhasil menghapus ${result.affectedRows} item.`,
      response: null
    });
  });
});

app.get("/api/dataHistories", (req, res) =>{
    connection.query('SELECT * FROM histories LEFT JOIN items ON items.item_id=histories.item_id',  (error, result)=>{
      if (error){
        res.status(500).json({
          succes: false,
          result: error
        });
      }else{
        res.status(200).json({
          succes: true,
          result: result
        });
      }
    });
});


//view detail history
app.get("/api/dataHistories/:id", (req, res) =>{
connection.query(`SELECT * FROM histories LEFT JOIN items ON items.item_id=histories.item_id WHERE id ="${req.params.id}"`,  (error, result)=>{
    if (error){
    res.status(500).json({
        succes: false,
        result: error
    });
    }else{
    res.status(200).json({
        succes: true,
        result: result
    });
    }
});
});

//add history
app.post("/api/dataHistories", (req, res) => {
let a = req.body;
    let dataInputan = {
    item_id : a.item_id,
    amount : a.amount,
    type : a.type,
    date : a.date,
    invoice_number : a.invoice_number
}



connection.query("INSERT INTO histories SET?", dataInputan, (error, result) =>{
    try{
    const{error, value} = scema.validate(req.body,{
        abortEarly: false,
    });
    if (error){
        res.status(500).json({
        succes: false,
        result: error
        });
    }else{
        res.status(200).json({
        succes: true,
        result: result
        });
    }
    }catch(err){
    console.log(error);
    return res.send(error.details);
    }
});
});

//edit history
app.put("/api/editHistories/:id", (req, res) => {
let a = req.body;
    let dataInputan ={
    item_id : a.item_id,
    amount : a.amount,
    type : a.type,
    date : a.date,
    invoice_number : a.invoice_number
    }
connection.query(`UPDATE histories SET? WHERE id="${req.params.id}"`, dataInputan, (error, result) =>{
    try{
    const{error, value} = scema.validate(req.body,{
        abortEarly: false,
    });
    if (error){
        res.status(500).json({
        succes: false,
        result: error
        });
    }else{
        res.status(200).json({
        succes: true,
        result: result
        });
    }
    }catch(err){
    console.log(error);
    return res.send(error.details);
    }
});
});

//delete history
app.delete("/api/deleteHistories/:id", (req, res)=>{
connection.query(`DELETE FROM histories WHERE id= ' ${req.params.id}'`, (error, result) =>{
    if (error){
    res.status(500).json({
        succes: false,
        result: error
    });
    }else{
    res.status(200).json({
        succes: true,
        result: result
    });
    }
})
})
