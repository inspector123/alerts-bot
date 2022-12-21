import AppError from '../utils/AppError.js';
import conn from '../services/db.js';

export const getAllBlocks = (req, res, next) => {
    conn.query("SELECT * FROM BlockEvents", function (err, data, fields) {
      if(err) return next(new AppError(err))
      res.status(200).json({
        status: "success",
        length: data?.length,
        data: data,
      });
    });
   };

   export const createBlock = async (req, res, next) => {
    if (!req.body) return next(new AppError("No form data found", 404));
    let { body } = req;
    
    const _body = Object.values(body)
    console.log(_body)
    const result = conn.query(
      "INSERT INTO BlockEvents (blockNumber,symbol,contract,usdVolume,usdPrice,isBuy,txHash,wallet,router,logIndex,v3Orv2,isEpiWallet,etherPrice) VALUES(?);",[_body], (err,data)=>{
        if (err) res.status(500).json({status: "error", err})
        else {
          res.status(200).json({
            status: "success",
            length: data?.length,
            data: data,
          });
        }
      }
    );
    //console.log(result)
    return;

  }
  //for contract, what do i want to do?



  //
 /*
  checkIfContractsExist

  find ones that do and ones that dont 

  post ones that dont and update ones that do

  perhaps for naive implementation, we simply getAllContracts and then...


  what if you feed it contracts, have it select * from contracts, and then return the ones that don't match?


  feed it an array of contracts, select * from contracts, filter by contracts in that list, then post the ones that didnt exist and put the ones that did?

  ...
 */

   export const getBlock = (req, res, next) => {
    if (!req.params.id) {
      return next(new AppError("No block found", 404));
    }
    conn.query(
      "SELECT * FROM BlockEvents WHERE blockNumber = ?",
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
      "DELETE FROM BlockEvents WHERE blockNumber=?",
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