import { connection } from "../config/db.config";
import { generateOtp } from "../config/otp.config";

const accountSid = 'AC8b1f019a96734d88b64b30316f65bf84';
const authToken = '57c224de27448914de4a05ff5a71a78c';
const client = require('twilio')(accountSid, authToken);


export class User{

    countryCode:string = '+91'

    constructor( public mobile:string  ,public otp:string ){

    }

    async isMembership():Promise<boolean>{
        let query = `select * from swagkari.user where mobile='${this.mobile}' and status='1'`;
        console.log( query );
        let promise = new Promise<boolean>( (resolve , reject)=>{
            connection.query( query , ( error:any , results:any ) => {

                if( error ) reject();

                if( results[0] != undefined ) resolve( true )
                else resolve( false );

            })
        })

  

        return promise
    }

    async createMembership( ):Promise<boolean>{
        let promise = new Promise<boolean>(( resolve , reject ) => {
            
            let otp = generateOtp(6);

            connection.query(
                `insert into swagkari.user(mobile, otp) values('${this.mobile}', '${otp}');`,
                (error: any, results: any) => {
                  if( error ) reject( error );
                  resolve( true );
                }
              );
        })

        return promise
    }

    async sendOtp( ):Promise<boolean>{


        const from = "Vonage APIs"
        let otp = generateOtp(6);
        const text = "Use verification code "+ otp +" for Swagkari authentication"

       

        
        let query = `update swagkari.user set otp = '${otp}' where mobile='${this.mobile}';`

        let promise = new Promise<boolean>(( resolve , reject ) => {
            connection.query( query ,
                async(error: any, results: any) => {
                   if( error ) reject( error )
                   client.messages
                   .create({body: text , from: '+14782495457', to: this.countryCode + this.mobile })
                   .then((message:any) => console.log(message.sid))
                   .catch((error:any) => console.log('Error', error ));

                   resolve( true );
                }
            );
        })

        return promise
       
    }

    generateToken( ){
        console.log('Generating Token');
    }

    sendToken( ){
        console.log('Sending Token');
    }

    async login( ):Promise<boolean>{

       let query = `select * from swagkari.user where mobile='${this.mobile}' and otp=${this.otp};`
       let promise = new Promise<boolean>( ( resolve , reject ) => { 
            if( ! this.otp ) resolve( false );
           
            connection.query( query ,  (error: any, results: any) => {
                if (error) reject( error );
    
                if (results[0] != undefined) resolve( true )
                else resolve( false)
            
            })
        })

       return promise;
    }
}

export class Users extends User{

    async getAllUsers( ):Promise<any>{
        let promise = new Promise<any>((resolve, reject) => {

            const query = `select * from swagkari.user where status='1';`;

            connection.query(query, (error: any, results: any) => {
                    // console.log(results);
                    if( error ) reject( error );

                    if( results != undefined ) resolve( results )
                    else resolve( false );
                    }
              );
        })
        return promise
    }

    async getUser(id:string):Promise<any>{
        let promise = new Promise<any>((resolve, reject) => {

            const query = `select * from swagkari.user where id='${id}' and status='1';`;

            connection.query(query, (error: any, results: any) => {
                    if( error ) reject( error );

                    //console.log(results[0]);
                    if( results[0] != undefined ) resolve( results )
                    else resolve( false );
                    }
              );
        })
        return promise
    }

    async deleteUser(id:string):Promise<boolean> {
        let promise = new Promise<boolean>((resolve, reject) => {

            const query = `delete from swagkari.user where id='${id}';`;

            console.log(query);
            connection.query(query, (error: any, results: any) => {
                    console.log(results);
                    if( error ) reject( error );

                    // console.log(results.changedRows)
                    if( results.changedRows != 0 ) resolve( true );
                    else resolve( false );
                    }
              );
        })
        return promise
    }

    async updateUser(body:any, user_id:string):Promise<boolean>{

        let promise = new Promise<boolean>((resolve, reject) => {

            const query = `update swagkari.user set 
                            fullname='${body.fullname}', 
                            email='${body.email}', 
                            role_id='${body.role_id}',
                            verified='${body.verified}',
                            status='${body.status}'
                            where id='${user_id}'`;
            
            const selectQuery = `select * from swagkari.user where id='${user_id}' and status='1';`;

            connection.query(query, (error: any, results: any) => {
                    if( error ) reject( error );

                    connection.query(selectQuery, (error:any, result:any) => {

                        if ( error ) reject( error );
                        
                        if(result[0] != undefined) resolve( result );
                        else resolve(false)
                    });
                    }
              );
        });
        return promise
    };

    async changeStatus(user_id:string, status:string):Promise<boolean>{

        let promise = new Promise<boolean>((resolve, reject) => {

            const query  = `update swagkari.user set status = '${status}' where id = '${user_id}'`;

            console.log(query);

            connection.query(query, (error:any, result:any) => {

                if( error ) reject( error );

                if( result.changedRows != 0 ) resolve( true );
                else resolve( false );
            });
        });
        return promise;
    };

    async changeRole(role:string, user_id:string):Promise<boolean>{

        let promise = new Promise<boolean>((resolve, reject) => {

            const query  = `update swagkari.user set role = '${role}' where id = '${user_id}'`;

            console.log(query);

            connection.query(query, (error:any, result:any) => {

                if( error ) reject( error );

                if( result.changedRows != 0 ) resolve( true );
                else resolve( false );
            });
        });
        return promise;
    };

}