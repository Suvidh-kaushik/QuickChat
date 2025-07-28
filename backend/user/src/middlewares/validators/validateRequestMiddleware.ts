import { Request,Response, NextFunction } from "express";
import { treeifyError } from "zod";


export const validateRequestBodyMiddleware = (schema:any)=>{

   return (req:Request,res:Response,next:NextFunction)=>{
       const result = schema.safeParse(req.body);
       if(!result.success){
          const formattedErrors = treeifyError(result.error);
              return res.status(400).json({
                message: "Invalid request body",
                errors: formattedErrors
              });
       }
       req.body = result.data;
       next();
   }
}


export const validateRequestQueryMiddleware = (schema:any)=>{
   return (req:Request,res:Response,next:NextFunction)=>{
       const result = schema.safeParse(req.params);
       if(!result.success){
          const formattedErrors = treeifyError(result.error);
              return res.status(400).json({
                message: "Invalid query parameters",
                errors: formattedErrors
              });
       }
       req.params = result.data;
       next();
   }
};

