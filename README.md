# ClankerCatcher

ClankerCatcher is built on Flow Testnet.
Contract Address: 0x61eaDf415e30E55f912fc2250B3048EffA3a8bf4

ClankerCatcher provides transparency and trust in social media environments where AI-generated images are becoming increasingly common and indistinguishable. By combining mobile usability, blockchain immutability, and smart contract automation, we create a robust system for detecting and flagging fake content while promoting genuine, on-chain verified photos.
How it’s made: We built a React Native + Expo mobile app that mimics the iOS camera, letting users take photos and mint them on-chain with a unique hash. Before a photo is minted, the app performs security checks to ensure it’s coming from a native camera app and the device is not rooted/jailbroken, tampered, or running in an emulator. The Solidity smart contract on the Flow testnet then executes the next step based on these checks only allowing genuine, verified photos to be minted. Photos failing verification are flagged as potentially AI-generated.

To demonstrate the workflow, we created a mock social media web page where users can upload images and see verification in action. Nora AI helped us write files and set up environments, impressively speeding up our project development. 

# Tech stack:

Mobile: React Native + Expo, Expo Camera

Backend: Python3, Flask, Flask-CORS, python-dotenv

Blockchain: Solidity smart contract on Flow testnet

Demo: HTML/CSS/JS simulated social feed
