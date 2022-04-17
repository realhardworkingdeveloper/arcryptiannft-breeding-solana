# arcryptiannft-breeding-solana
## If this repo is helpful, don't forget to follow.
### This is a real project for arcryptiannfts.com. You are responsible for all problems caused by abuse of this code.

***Solana Cli Version 1.9.13, Candymachine v2***
---
> If you are new to solana, please read <a href="https://dev.to/edge-and-node/the-complete-guide-to-full-stack-solana-development-with-react-anchor-rust-and-phantom-3291">this</a>. This will guide you general idea and how to install solana.
---
### Project Structure
- app: ignore it, it is test frontend, not complete
- client: candymachine-ui customization for nft breeding, complete frontend
- programs: main business logic written by rust
- scripts: it is for test
- tests: sample test but not used here
---
### How to use
`anchor build`<br>
If you build program first time, you will get keypair  json.<br> You could get program_id from `solana address <keypair-json>`.<br>
`anchor test`<br>
If you've done `anchor test`, you could get idl file with program_id from target/idl.<br>
Copy idl to client/src/idl.<br>
`anchor deploy`<br>

Then change location to client, `npm start`.<br>

Done.

If you have some problem, email me.
