import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { API } from "./../config";
import { data } from "autoprefixer";

const UserContext = createContext();


const UserContextProvider = ({ children }) => {
    // the value that will be given to the context
    const [user, setUser] = useState(0);
    const [status, setStatus] = useState(0);
    const [myWallet, setMyWallet] = useState(0);
    const [myNFTs, setMyNFTs] = useState([]);
    const [notification, setNotification] = useState("");
    const [notificationType, setNotificationType] = useState("");
    const [newItemStatus, setNewItemStatus] = useState(0);

    const [rewardNFT, setRewardNFT] = useState(0);

    const messageAction = async (message, type) => {
      setNotification(message)
      setNotificationType(type);
    }

    const rewardNFTAction = async (val) => {
      setRewardNFT(val)
    }
    
    const newItemStatusAction = async (val) => {
      setNewItemStatus(val)
    }

    const myNFTsAction = async (val) => {
      setMyNFTs(val)
    }

    const notificationTypeAction = async (val) => {
      setNotificationType(val)
    }

    const notificationAction = async (val) => {
      setNotification(val)
    }
    
    const myWalletAction = async (val) => {
      setMyWallet(val);
      setNotification("Wallet Connected")
      setNotificationType("success");
    }

    const BurnNFTAction = async (val) => {
      try
      {
          await axios.post(`${API}/api/user/buy-ticket`, val);
          setNotification("Bought The Ticket!")
          setNotificationType("success");
      }
      catch(err){
        console.log(err);
        setNotification("Error: Buy Ticket")
        setNotificationType("error");
      }
    }

    const connectWalletAction = async (val) => {
        if(status==1) return;
        setStatus(1)
        const data = {
          wallet : val
        }

        try{
           const result = await axios.post(`${API}/api/user/connect-wallet`, data);
           setUser(result.data.role)
        }
        catch(err){
          console.log(err);
        }
        setStatus(0)
    } 
    
    const contextValue = useMemo(() => ({
        connectWalletAction,
        user,
        myWalletAction,
        myWallet,
        notificationTypeAction,
        notificationAction,
        notification,
        notificationType,
        BurnNFTAction,
        newItemStatusAction,
        newItemStatus,
        myNFTsAction,
        myNFTs,
        rewardNFTAction,
        rewardNFT,
        messageAction,

    }), [
        connectWalletAction, 
        user,
        myWalletAction,
        myWallet,
        notificationTypeAction,
        notificationAction,
        notification,
        notificationType,
        BurnNFTAction,
        newItemStatusAction,
        newItemStatus,
        myNFTsAction,
        myNFTs,
        rewardNFTAction,
        rewardNFT,
        messageAction,

      ])    

    return (
      // the Provider gives access to the context to its children
      <UserContext.Provider value={contextValue}>
        {children}
      </UserContext.Provider>
    );
};

export { UserContext, UserContextProvider };
