const { BN,expectRevert , expectEvent} = require('@openzeppelin/test-helpers');
const { expect,} = require('chai');
const Voting = artifacts.require('Voting');

contract("Voting", function (accounts){
  const owner = accounts[0];
  const whitelisted = accounts[1];
  const noOwner = accounts[2];
  const noWhitelisted = accounts[3];
  
  beforeEach(async function () {
    this.VotingInstance = await Voting.new({from: owner});
  });

  


  it("verification owner", async function ()  {
    expect(await this.VotingInstance.owner()).to.equal(owner);
  });

  it("verification Ajout whitelist", async function ()  {
    await this.VotingInstance.whitelist(whitelisted);
    const verifOwner = new BN(1);
    expect(await this.VotingInstance.isWhitelisted(whitelisted,{from: owner})).to.be.bignumber.equal(verifOwner);
  });

  it("status ProposalsRegistrationStarted", async function ()  {
    await this.VotingInstance.StartEnregristrement();
    const verifStatus = new BN(1);
    expect(await this.VotingInstance.Status({from: owner})).to.be.bignumber.equal(verifStatus);
  });

  it("status ProposalsRegistrationEnded", async function ()  {
    await this.VotingInstance.StartEnregristrement();
    await this.VotingInstance.EndEnregristrement();
    const verifStatus = new BN(2);
    expect(await this.VotingInstance.Status({from: owner})).to.be.bignumber.equal(verifStatus);
  });

  it("status VotingSessionStarted", async function ()  {
    await this.VotingInstance.StartEnregristrement();
    await this.VotingInstance.EndEnregristrement();
    await this.VotingInstance.StartVote();
    const verifStatus = new BN(3);
    expect(await this.VotingInstance.Status({from: owner})).to.be.bignumber.equal(verifStatus);
  });

  it("status VotingSessionEnded", async function ()  {
    await this.VotingInstance.StartEnregristrement();
    await this.VotingInstance.EndEnregristrement();
    await this.VotingInstance.StartVote();
    await this.VotingInstance.EndVote();
    const verifStatus = new BN(4);
    expect(await this.VotingInstance.Status({from: owner})).to.be.bignumber.equal(verifStatus);
  });

  it("Add proposal", async function ()  {
    await this.VotingInstance.whitelist(whitelisted);
    await this.VotingInstance.StartEnregristrement();
    await this.VotingInstance.Addproposal("Proposition242",{from: whitelisted});
    let newProposal = await this.VotingInstance.proposition(0); 
    expect(newProposal.description).to.equal("Proposition242");
    expect(newProposal.voteCount).to.be.bignumber.equal('0');
  });

  it("Ne pas rajouter de proposition si l'adresse n'est pas dans la whitelist", async function ()  {
    await this.VotingInstance.StartEnregristrement();
    expectRevert(this.VotingInstance.Addproposal('Proposal 1',{from: noWhitelisted}),"Ne figure pas dans la whitelist -- Reason given: Ne figure pas dans la whitelist.");
  });

  it("Ne pas rajouter de proposition si le status ne le permet pas ", async function ()  {
    await this.VotingInstance.whitelist(whitelisted);
    expectRevert(this.VotingInstance.Addproposal('Proposal 1',{from: noWhitelisted}),"La session de proposition n'est pas Ouvert -- Reason given: La session de proposition n'est pas Ouvert.");
  });
  

  it("Add Vote", async function ()  {
    await this.VotingInstance.whitelist(whitelisted);
    await this.VotingInstance.whitelist(owner);
    await this.VotingInstance.StartEnregristrement();
    await this.VotingInstance.Addproposal("Proposition0",{from: whitelisted});
    await this.VotingInstance.Addproposal("Proposition1",{from: owner});
    await this.VotingInstance.EndEnregristrement();
    await this.VotingInstance.StartVote();
    await this.VotingInstance.Vote(1,{from: whitelisted});
    await this.VotingInstance.Vote(1,{from: owner});
    let newProposal = await this.VotingInstance.proposition(1); 
    expect(newProposal.description).to.equal("Proposition1");
    expect(newProposal.voteCount).to.be.bignumber.equal('2');
  });

  it("Ne pas rajouter le vote si l'adresse n'est pas dans la whitelist", async function ()  {
    await this.VotingInstance.whitelist(whitelisted);
    await this.VotingInstance.StartEnregristrement();
    await this.VotingInstance.Addproposal("Proposition0",{from: whitelisted});
    await this.VotingInstance.EndEnregristrement();
    await this.VotingInstance.StartVote();
    await this.VotingInstance.Vote(0,{from: whitelisted});
    expectRevert(this.VotingInstance.Vote(0,{from: noWhitelisted}),"Ne figure pas dans la whitelist -- Reason given: Ne figure pas dans la whitelist.");
  }); 

  it("Ne pas rajouter le vote si le status de vote n'est pas en cours", async function ()  {
    await this.VotingInstance.whitelist(whitelisted);
    await this.VotingInstance.StartEnregristrement();
    await this.VotingInstance.Addproposal("Proposition0",{from: whitelisted});
    await this.VotingInstance.EndEnregristrement();
    expectRevert(this.VotingInstance.Vote(0,{from: whitelisted}),"La Session de vote doit etre ferme avant -- Reason given: La Session de vote doit etre ferme avant.");
  }); 
  
  

  



});
