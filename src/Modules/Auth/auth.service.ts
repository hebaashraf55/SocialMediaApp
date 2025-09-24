import type { Request, Response } from 'express';
import { ISignUpDTO } from './auth.dto';
import { UserModel } from '../../DB/Models/model.user';
import {  BadRequestException, ConfilectException, NotFoundException } from '../../Utils/response/error.response';
import { UserRepository } from '../../DB/reposetories/user.repository';
import { compareHashing, generateHashing } from '../../Utils/security/hash';
import { emailEvent } from '../../Utils/events/email.event';
import { generateOTP } from '../../Utils/generateOTP';
import { createLoginCredentials } from '../../Utils/security/token';



class AuthenticationService {
    private _userModel = new UserRepository(UserModel);

    constructor() {}
    signUp = async (req : Request ,res : Response) : Promise <Response> => {
        const { userName, email, password } : ISignUpDTO = req.body;

        const checkUser = await this._userModel.findOne({
            filter : {email},
            options : {lean : true,}
        });

        if(checkUser) throw new ConfilectException('User Already Exists');

        const otp = generateOTP()

        const user = await this._userModel.createUser({
            data : [
                {
                userName,
                email,
                password : await generateHashing(password),
                confirmEmailOTP : await generateHashing(String(otp))
            }
        ],
            options : {
                validateBeforeSave : true
            }
        })

        emailEvent.emit('confirmeEmail', {to: email, userName : userName, otp})

        return res.status(201).json({message : ' User Created Successfully', user})
    }

    logIn = async (req : Request ,res : Response) : Promise <Response> => {
        const { email, password } = req.body;

        const user = await this._userModel.findOne({
            filter : {email},
        });

        if(!user) throw new NotFoundException('invalid Account')
        if(!compareHashing(password, user .password)) 
            throw new BadRequestException('invalid password')

        const criedentials = await createLoginCredentials(user)
        

        return res.status(200).json({
            message : ' User Loged in Successfully', 
            criedentials
        })
    }

    confirmeEmail = async (req : Request ,res : Response) : Promise <Response> => {
        try {
                    const { email, otp } = req.body;

        const user = await this._userModel.findOne({
            filter : {
                email ,
                confirmEmailOTP :{ $exists : true},
                confirmedAT : { $exists : false},
        }});
        if(!user) throw new NotFoundException('invalid Account')
        if(!compareHashing(otp, user?.confirmEmailOTP)) 
            throw new BadRequestException('invalid otp')
        // update user
        await this._userModel.updateOne({
            filter : {email},
            update : {
                confirmedAT : Date.now(),
                $unset : {confirmEmailOTP : true},
            }
        })

            
        } catch (error) {
            throw new BadRequestException('invalid otp')
            
        }

        return res.status(200).json({
            message : ' User Email Confirmed Successfully'
        })
    }
}

export default new AuthenticationService;


