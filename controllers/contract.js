import AppError from '../utils/appError';
import conn from '../services/db';
export const getAllContracts = (req, res, next) => {
    conn.query("SELECT * FROM Contracts", function (err, data, fields) {
      if(err) return next(new AppError(err))
      res.status(200).json({
        status: "success",
        length: data?.length,
        data: data,
      });
    });
   };

   export const createContract = (req, res, next) => {
    if (!req.body) return next(new AppError("No form data found", 404));
    const values = [req.body.name, "pending"];
    conn.query(
      "INSERT INTO Contracts (symbol, decimals, contract, amount, age,Volume5m,volume15m,volume1h,volume1d ) VALUES(?)",
      [values],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(201).json({
          status: "success",
          message: "block created!",
        });
      }
    );
   };

   export const getContractByAddress = (req, res, next) => {
    if (!req.params.id) {
      return next(new AppError("No contract address found", 404));
    }
    conn.query(
      "SELECT * FROM contract WHERE address = ?",
      [req.params.address],
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
   export const updateContract = (req, res, next) => {
    if (!req.params.id) {
      return next(new AppError("No block id found", 404));
    }
    conn.query(
      "UPDATE block SET Volume5m = ? , Volume15m = ? , Volume1H = ? , Volume1D = ? ,WHERE address=?",
      [req.params.Volume5m, req.params.Volume15m, req.params.Volume1H, req.params.Volume1D,
    ],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(201).json({
          status: "success",
          message: "todo updated!",
        });
      }
    );
   };

//    export const updateTodo = (req, res, next) => {
//     if (!req.params.id) {
//       return next(new AppError("No block id found", 404));
//     }
//     conn.query(
//       "UPDATE block SET status='completed' WHERE id=?",
//       [req.params.id],
//       function (err, data, fields) {
//         if (err) return next(new AppError(err, 500));
//         res.status(201).json({
//           status: "success",
//           message: "todo updated!",
//         });
//       }
//     );
//    };
   

   export const deleteContract = (req, res, next) => {
    if (!req.params.id) {
      return next(new AppError("No block id found", 404));
    }
    conn.query(
      "DELETE FROM Contract WHERE address=?",
      [req.params.address],
      function (err, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(201).json({
          status: "success",
          message: "todo deleted!",
        });
      }
    );
   }
/*
CREATE TABLE Contracts(id int NOT NULL AUTO_INCREMENT,
symbol varchar(50) NOT NULL,
decimals varchar(50) NOT NULL,
contractAddress varchar(50) NOT NULL,
amount varchar(50) NOT NULL,
age varchar(50) NOT NULL,
Volume5m varchar(50) NOT NULL,
volume15m varchar(50) NOT NULL,
volume1h varchar(50) NOT NULL,
volume1d varchar(50) NOT NULL,
PRIMARY KEY (id)
);*/