# ClankerCatcher

ClankerCatcher provides transparency and trust in social media environments where AI-generated images are becoming increasingly common and indistinguishable. By building our app on the blockchain create an immutable, decentralized, secure and owner focused system for owning digital media and detecting + flagging fake content while promoting genuine, on-chain verified photos.

**How it’s made:** We built a React Native mobile app that mimics the iOS camera, letting users take photos and mint them on-chain as a hash. Before a photo hash is minted, the app performs security checks to ensure it’s coming from a native camera app, the device is not rooted/jailbroken, has authentic hardware ids, not on an emulator, comes from an unmodified app, and has a unique hash. Currently, the device performs 4/5 of the checks, and uses flask for the backend. The Solidity smart contract on the Flow testnet then executes the next step based on these checks only allowing genuine, verified photos to be minted. 

The actual fully fleshed out product aims to exist as a single addon to any new or existing camera software, in addition to a smart contract plugin for media platform implementation. Any device would be able to get their photos verified, and the smart contract would ensure that only real photos get minted.

**Use Example:** We created a mock social media web page where users can upload images and see verification in action. Nora AI helped us write files and set up environments, impressively speeding up our project development. 


# Future Features
Ability to use your own wallet from any provider, and the ability to abstract the wallet for users seeking a simpler option
Verification beyond photos, for things like audio, videos, and more 



# Tech stack:

Mobile: React Native + Expo, Expo Camera

Backend: Python3, Flask, Flask-CORS, python-dotenv

Blockchain: Solidity smart contract on Flow testnet

Demo: HTML/CSS/JS simulated social feed

BlockChain: Flow Testnet.

Smart Contract Address: 0x61eaDf415e30E55f912fc2250B3048EffA3a8bf4
