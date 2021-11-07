pragma solidity 0.8.7;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Voting.sol";

contract TestVoting {

  function testWhitelist() public {
    Voting voting =new Voting();
    voting.whitelist(0x2E5cBdF48a981aB543d8E997a3260E0368e58d4F);

    Assert.ok(msg.sender==0x2E5cBdF48a981aB543d8E997a3260E0368e58d4F, "Ce n'est pas l'admin");
    Assert.equal(voting.isWhitelisted(0x2E5cBdF48a981aB543d8E997a3260E0368e58d4F), 1, "It should store the value 89.");
  }
}
