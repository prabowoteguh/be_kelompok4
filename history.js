const express = require('express')
let mysql      = require('mysql');
let bodyParser = require ("body-parser");
const app = express()
const Joi = require('joi');


let connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'project'
});

const scema=Joi.object({
  item_id: Joi.number().integer().min(1).required(),
  amount:Joi.number().integer().min(1).required(),
  type:Joi.number().integer().max(1).required(),
  date:Joi.date().required(),
  invoice_number:Joi.string().min(1).required()
})

app.use(bodyParser.json());
//view all history
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

app.listen(3000, () => {
  console.log("JALAN")
})
