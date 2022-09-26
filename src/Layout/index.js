import React, {useContext, useState, useEffect} from "react";

import { Box } from "@mui/system";
import { AppBar, Toolbar, Typography, Grid, Hidden, Button, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from "react-router-dom"

import RoutPath from "../constant";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { UserContext } from './../context/userContext'
import { Connection } from "@solana/web3.js";
import {NotificationContainer, NotificationManager} from 'react-notifications';

const SOLANA_MAINNET = "https://lingering-wild-river.solana-mainnet.quiknode.pro/8462bba58569d9a04e0f93ac6f23ae81b92409a1/";
const SOLANA_DEVNET = "https://api.devnet.solana.com";


export default function Layout(props) {

    const { nftCountAction, myWalletAction, notification, notificationType, notificationTypeAction,
        myNFTsAction } = useContext(UserContext);

    const { publicKey } = useWallet();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (NavigatePath) => {
        if (NavigatePath !== "") navigate(NavigatePath);
        setAnchorEl(null);
    };

    const fetchWalletForNFTs = async (address) => {
        const connection = new Connection(SOLANA_MAINNET, "confirmed");
        const nftAccounts = await getParsedNftAccountsByOwner({publicAddress: address , connection: connection});
        let nftCount = 0;
        let temp = [];
        for(let i = 0; i < nftAccounts.length; i++){
            if( nftAccounts[i].updateAuthority == 'npadaF6bF1avtyZ2QRzEPWQtfY9wYkgdBGYHwvsM5CE' || nftAccounts[i].updateAuthority == "4mXvmPkSAHmpKcYeg5gosLbGxYJ3yMacavRtxZT1Gqdr"){
                nftCount++;
                temp.push(nftAccounts[i])
                continue;
            }
        }
        myNFTsAction(temp)
        nftCountAction(nftCount)
    }

    useEffect(() => {
        if(publicKey){
            myWalletAction(publicKey)
            fetchWalletForNFTs(publicKey);
        }
        // if(!publicKey) navigate("/", { replace: true });
    }, [publicKey]);

    useEffect(() => {
        if(notificationType == 'info'){
            NotificationManager.info(notification);
        }else if (notificationType == 'success'){
            NotificationManager.success(notification, 'Success');
        }else if (notificationType == 'warning'){
            NotificationManager.warning(notification, 'Warning');
        }else if (notificationType == 'error'){
            NotificationManager.error(notification, 'Error')
        }
        notificationTypeAction("none")
    }, [notificationType]);

    return (
        <Box className="w-full h-screen bg-main-bg relative flex flex-col" sx={{ flexGrow: 1 }}>
            <AppBar position="fixed" className="bg-main-bg" elevation={0} >
                <Toolbar className="bg-main-bg pt-2 pb-2">
                    <div className="flex flex-row items-end w-full justify-center">
                        <div className="flex flex-row items-center  justify-center">
                            <Hidden smDown={true}>
                                <WalletMultiButton id="walletConnect" startIcon=""  endIcon="" className="header__connect-button bg-glow-blue ">
                                { 
                                    !publicKey ? <>Connect Wallet</> : <>{publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4)}</>
                                }
                                </WalletMultiButton>
                                {/* <div className="flex flex-row w-44 mr-4 items-center justify-between bg-glow-blue px-4 py-2 rounded-full cursor-pointer">
                                    <img src={UserIDLogo} alt="" className="mr-2" />
                                    <span className="text-base">7HTB...yi5m</span>
                                </div> */}
                            </Hidden>
                        </div>
                    </div>
                </Toolbar>
            </AppBar>
            <Toolbar></Toolbar>
            <div className="flex-1 flex flex-row items-center mt-2">
                {/* Page Content  */}
                <div className="flex-1 h-full">
                    {props.children}
                </div>
            </div>
            {/* Footer */}
            <Grid container alignItems='center' justifyContent='center' className="bg-light-gray py-2">
                <Grid item onClick={() => {navigate(RoutPath.DashbordPage)}}>
                    <span className="text-dark-gray mx-4">© The Unveiled 2022</span>
                </Grid>
            </Grid>
            <NotificationContainer/>
        </Box>
    )
}