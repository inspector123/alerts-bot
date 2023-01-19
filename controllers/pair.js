import AppError from '../utils/AppError.js';
import conn from '../services/db.js';

// Pairs

// get by PairAddress /api/pairs/:pairAddress
export const getPairByPairAddress = async (req, res, next) => {
    if (!req.params) res.status(404).json({status: 404, data: "missing pair address"})
    conn.query("SELECT * FROM Pairs WHERE pairAddress = ?",[req.params.pairAddress], function (err, data, fields) {
      if(err) return next(new AppError(err))
      res.status(200).json({
        status: "success",
        length: data?.length,
        data: data,
      });
    });
  }
  //post pair /api/pairs
  export const createPair = async (req, res, next) => {
    if (!req.body) return next(new AppError("No form data found", 404));
    let { body } = req;
    
    const _body = Object.values(body)
    const result = conn.query(
      "INSERT INTO Pairs (pairAddress,token0,token1,token0Decimals,token1Decimals,token0Symbol,token1Symbol,token0TotalSupply,token1TotalSupply) VALUES(?);",[_body], (err,data)=>{
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