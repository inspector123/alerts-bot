import AppError from '../utils/AppError.js';
import conn from '../services/db.js';
export const getAllBlocks = (req, res, next) => {
    conn.query("SELECT * FROM Blocks", function (err, data, fields) {
      if(err) return next(new AppError(err))
      res.status(200).json({
        status: "success",
        length: data?.length,
        data: data,
      });
    });
   };

   export const createBlock = (req, res, next) => {
    //if (!req.body) return next(new AppError("No form data found", 404));
    //console.log('body',req.body)
    //const values = [req.body];
    for (let i in req.body) {
      for (let j in req.body[i]) {
        const values = Object.values(req.body[i][j]);
        const valueString = values.reduce((i,j)=>`"${i}", "${j}"`)
        conn.query(
          `INSERT INTO Blocks (blockNumber, symbol, decimals, contractAddress, amount, usdVolume, timestamp,type, txHash) VALUES(${valueString})`, (err)=> {
            if (err) console.log(err);
          }
        );
      }
    }
   };

   export const getBlock = (req, res, next) => {
    if (!req.params.id) {
      return next(new AppError("No block found", 404));
    }
    conn.query(
      "SELECT * FROM Blocks WHERE blockNumber = ?",
      [req.params.id],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          status: "success",
          length: data?.length,
          data: data,
        });
      }
    );
   };

   

   export const deleteBlock = (req, res, next) => {
    if (!req.params.id) {
      return next(new AppError("No block id found", 404));
    }
    conn.query(
      "DELETE FROM Blocks WHERE blockNumber=?",
      [req.params.id],
      function (err, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(201).json({
          status: "success",
          message: "block deleted!",
        });
      }
    );
   }


         // function (err, data, fields) {
      //   if (err) return;
      //   res.status(201).json({
      //     status: "success",
      //     message: "block created!",
      //   });
      // }