var express = require('express');
var router = express.Router();
const { getAllPict } = require('../repository');


router.get('/',  async function(req, res) {
  try {
const data  = await getAllPict()
res.send(data);
  } catch(err) {
console.log(err)
  }  
});

module.exports = router;