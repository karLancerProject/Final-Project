import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
const inter = Inter({ subsets: ["latin"] });

import Web3Modal from "web3modal";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";

let web3Modal;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc: { 1: process.env.NEXT_PUBLIC_RPC_URL }, // required
    },
  },
};

web3Modal = new Web3Modal({
  cacheProvider: false,
  providerOptions, // required
});

export default function Home() {
  async function connect() {
    try {
      const web3ModalProvider = await web3Modal.connect();
      setIsConnected(true);
      const provider = new ethers.providers.Web3Provider(web3ModalProvider);
      setSigner(provider.getSigner());
    } catch (e) {
      console.log(e);
    }
  }

  return <button onClick={connect}>Connect</button>;
}

//jygvbjuh
