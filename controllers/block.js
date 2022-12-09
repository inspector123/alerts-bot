import AppError from '../utils/appError';
import conn from '../services/db';
// export const getAllTodos = (req, res, next) => {
//     conn.query("SELECT * FROM block where ", function (err, data, fields) {
//       if(err) return next(new AppError(err))
//       res.status(200).json({
//         status: "success",
//         length: data?.length,
//         data: data,
//       });
//     });
//    };

   export const createBlock = (req, res, next) => {
    if (!req.body) return next(new AppError("No form data found", 404));
    const values = [req.body.name, "pending"];
    conn.query(
      "INSERT INTO Blocks (blockNumber, symbol, decimals, contract, amount, type, timestamp) VALUES(?)",
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

   export const getBlock = (req, res, next) => {
    if (!req.params.id) {
      return next(new AppError("No todo id found", 404));
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

  //  export const updateTodo = (req, res, next) => {
  //   if (!req.params.id) {
  //     return next(new AppError("No block id found", 404));
  //   }
  //   conn.query(
  //     "UPDATE block SET status='completed' WHERE id=?",
  //     [req.params.id],
  //     function (err, data, fields) {
  //       if (err) return next(new AppError(err, 500));
  //       res.status(201).json({
  //         status: "success",
  //         message: "todo updated!",
  //       });
  //     }
  //   );
  //  };
   

   export const deleteBlock = (req, res, next) => {
    if (!req.params.id) {
      return next(new AppError("No block id found", 404));
    }
    conn.query(
      "DELETE FROM Blocks WHERE id=?",
      [req.params.id],
      function (err, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(201).json({
          status: "success",
          message: "todo deleted!",
        });
      }
    );
   }