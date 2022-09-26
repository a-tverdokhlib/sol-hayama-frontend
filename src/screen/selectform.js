import React, {useContext, useState, useEffect} from "react";
import {
    Grid, Hidden
} from "@mui/material";

import { UserContext } from './../context/userContext'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import {config} from './../config'

import {
    PublicKey,
} from "@solana/web3.js";

const opts = {
    preflightCommitment: "processed"
}

export default function SelectRaffleForm(props) {
    const navigate = useNavigate();
    const { myNFTs, BurnNFTAction, rewardNFTAction, notificationAction, notificationTypeAction,  messageAction } = useContext(UserContext);
    const [nfts, setNFTs] = useState([]);
    const [selection, setSelection] = useState(-1);

    const { publicKey } = useWallet();
    const wallet = useWallet();

    const { connection } = useConnection();

    async function getProvider() {
        const provider = new AnchorProvider(
            connection, wallet, opts.preflightCommitment,
        );
        return provider;
    }

    const getNFTImage = async(data)=>{
        let temp = data;
        for(let i = 0; i < data.length; i++){
            try{
                // if(i>=3) continue;
                const res = await axios.post(data[i].data.uri);
                temp[i].image = res.data.image;
            }catch(err){}
        }
        setNFTs(temp)
    }

    useEffect(() => {
        if(myNFTs){
            getNFTImage(myNFTs)
        }
    }, [myNFTs]);

    const handleNFTSelection = (index, item) =>{
        if(selection == index) {
            setSelection(-1);
        } else {
            rewardNFTAction(item);
            setSelection(index);
        }
    }

    const sendTransactions = async(provider, connection, instructions, transactionName)=>{
        console.log("sending the Transaction: ", transactionName)
        // var transaction = new web3.Transaction().add(instructions);
        var transaction = new web3.Transaction();
    
        for(let i = 0; i<instructions.length; i++){
          transaction.add(instructions[i])
        }
        
        if(transaction) {
          console.log("Txn created successfully");
        }
        // Setting the variables for the transaction
        transaction.feePayer =  provider.wallet.publicKey;
        let blockhashObj = await provider.connection.getRecentBlockhash();
        transaction.recentBlockhash = await blockhashObj.blockhash;
        // Request creator to sign the transaction (allow the transaction)
        let signed = await provider.wallet.signTransaction(transaction);
        // The signature is generated
        let signature = await connection.sendRawTransaction(signed.serialize());
        // Confirm whether the transaction went through or not
        await connection.confirmTransaction(signature);
    }

    const handleNFTBurn = async() =>{
        if(!publicKey) {
            notificationAction("Please Connect Wallet");
            notificationTypeAction("info")
            return;
        }

        const provider = await getProvider();

        // const maxAmount = await getTokenBalance(new PublicKey(config.tokenMintPubkey));
        // console.log(maxAmount)
        // if(maxAmount<10){
        //     notificationAction("Insufficient Balance");
        //     notificationTypeAction("info");
        //     return;
        // }
        const burnNFT = nfts[selection];
        console.log(burnNFT)
        console.log(burnNFT.mint)

        const MintObject = new Token( provider.connection, new PublicKey(burnNFT.mint), TOKEN_PROGRAM_ID, provider.wallet.payer);
            
        let toTokenAddr = await Token.getAssociatedTokenAddress(
            MintObject.associatedProgramId,
            MintObject.programId,
            new PublicKey(burnNFT.mint),
            new PublicKey(config.ownerWallet)
        );

        const receiverAccount = await provider.connection.getAccountInfo(toTokenAddr);
        console.log(receiverAccount)
        console.log(toTokenAddr.toBase58())
        console.log("receiverAccount")
        var instructions = []
        if(!receiverAccount){
            console.log("created")
            instructions.push(
                Token.createAssociatedTokenAccountInstruction(
                MintObject.associatedProgramId,
                MintObject.programId,
                new PublicKey(burnNFT.mint),
                toTokenAddr,
                new PublicKey(config.ownerWallet),
                provider.wallet.publicKey
                )    
            );
        };

        if (instructions.length>0){
            await sendTransactions(provider, connection, instructions, "creating the AssociatedTokenAccount");
        }

        const userAccount = new Token(
            provider.connection,
            new PublicKey(burnNFT.mint),
            TOKEN_PROGRAM_ID,
            publicKey);
        const userAccountInfo = await userAccount.getOrCreateAssociatedAccountInfo(publicKey);
        const userAccountAddr = userAccountInfo.address;
        var transferTransaction;
        transferTransaction = new web3.Transaction().add(
            Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                userAccountAddr,
                toTokenAddr,
                provider.wallet.publicKey,
                [],
                1
            )
        )
        transferTransaction.recentBlockhash = (await provider.connection.getRecentBlockhash()).blockhash;
        transferTransaction.feePayer = provider.wallet.publicKey;
        // Request creator to sign the transaction (allow the transaction)
        let signed = await provider.wallet.signTransaction(transferTransaction);
        // The signature is generated
        let signature = await connection.sendRawTransaction(signed.serialize());
        // Confirm whether the transaction went through or not
        await connection.confirmTransaction(signature);

        const data = { 
            wallet: publicKey.toBase58(),
            transaction: signature,
        }
        console.log(data)
        BurnNFTAction(data)
    }

    return (
        <div
            className="w-full px-2 md:px-10 lg:px-36 py-10 overflow-auto"
            style={{ height: "90vh" }}
        >
           
            <div className="mx-auto px-2 md:px-4 lg:px-4 xl:px-20 py-8 pb-4 bg-dark-black-blue rounded-2xl w-full md:w-4/5 min-h-[80%] mb-6 flex flex-col items-end" style={{ boxShadow: '0px 4px 50px rgba(0, 0, 0, 0.25), inset 0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
                <p className="heading-loot">Your Lootboxes</p>
                <Grid container justifyContent='center' spacing={2} className="flex-1">
                    {nfts.map((item, index) => {
                        return (
                            <Grid item xs={6} sm={6} md={2} lg={2} xl={2} key={index} onClick={()=>handleNFTSelection(index, item)}>
                                <img src={item.image} alt=""  className={`${selection == index? 'border-double border-4 border-indigo-600': 'border-none'} w-full h-20 object-fill`} />
                            </Grid>
                        )
                    })}
                </Grid>
                <button className="burn-button" onClick={(_) => {
                    if(selection === -1){
                        messageAction("Please Select The Lootbox!", "info")
                        return;
                    }
                    handleNFTBurn();
                    }}>
                    Open
                </button>
            </div>
        </div>
    );
}
