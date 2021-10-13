// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

/*********************************************************************************************************
 * @title Voting
 * @author
 * @dev
 ***********************************************************************************************************/
contract Voting is Ownable{
    
    using SafeMath for uint256;
    
    struct Voter {
        uint votedProposalId;
        bool isRegistered;
        bool hasVoted;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }
    
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    mapping (address => Voter) private electeur;
    address[] public addresses;
    Proposal [] public proposition;
    uint public winningProposalId;
    WorkflowStatus public Status = WorkflowStatus.RegisteringVoters;
    uint max=0;

    event VoterRegistered(address voterAddress);
    event ProposalsRegistrationStarted();
    event ProposalsRegistrationEnded();
    event ProposalRegistered(uint proposalId);
    event VotingSessionStarted();
    event VotingSessionEnded();
    event Voted (address voter, uint proposalId);
    event VotesTallied();
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    
    


     
/*********************************************************************************************************
 * @dev L'administrateur du vote enregistre une liste blanche d'électeurs identifiés par leur adresse Ethereum.
 * @param _address Adresse Ethereum qui doit etre enregistre
 ***********************************************************************************************************/
 
 
   function whitelist(address  _address) public onlyOwner{
       require(!electeur[_address].isRegistered, "Cette Adresse est deja enregistre!");
       require(Status==WorkflowStatus.RegisteringVoters,"La session d'enregistre pour la whitelist doit etre ouverte");
       electeur[_address].isRegistered=true;
       addresses.push(_address);
       emit VoterRegistered(_address);
       
   }
    function Nb_Electeur() public view returns(uint){
        return addresses.length;
    }
   
/*********************************************************************************************************
 * @dev L'administrateur du vote enregistre une liste blanche d'électeurs identifiés par leur adresse Ethereum.
 * @param _address Adresse Ethereum qui doit etre enregistre
 ***********************************************************************************************************/
   function getAddresses() public view returns(address[] memory){
       return addresses;
   }
   
/*********************************************************************************************************
 * @dev StartSessionEnrigrement'administrateur du vote commence la session d'enregistrement de la proposition
 * 
 ***********************************************************************************************************/
   
    function StartEnregristrement () public onlyOwner{
        require(Status==WorkflowStatus.RegisteringVoters,"La session d'enregistre pour la whitelist doit etre ouverte");
        emit ProposalsRegistrationStarted();
        Status = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded,WorkflowStatus.ProposalsRegistrationStarted);
    }
    
/*********************************************************************************************************
 * @dev Les électeurs inscrits sont autorisés à enregistrer leurs propositions pendant que la session d'enregistrement est active.
 * @param _information _information pour leurs propositions
 * 
 ***********************************************************************************************************/
    
    function Addproposal (string memory  _information) public{
        require(Status == WorkflowStatus.ProposalsRegistrationStarted,"La session de proposition n'est pas Ouvert");
        require(electeur[msg.sender].isRegistered==true,"Ne figure pas dans la whitelist");
        Proposal memory newPropo = Proposal(_information, 0); 
        proposition.push(newPropo);
        emit ProposalRegistered(proposition.length);
    }

     function Nb_Proposition() public view returns(uint){
        return proposition.length;
    }
    
    
/*********************************************************************************************************
 * @dev L'administrateur de vote met fin à la session d'enregistrement des propositions.
 * 
 ***********************************************************************************************************/ 
 
    function EndEnregristrement () public onlyOwner{
        require(Status==WorkflowStatus.ProposalsRegistrationStarted);
       emit ProposalsRegistrationEnded();
       Status = WorkflowStatus.ProposalsRegistrationEnded;
       emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted,WorkflowStatus.ProposalsRegistrationEnded);
    }
    
/*********************************************************************************************************
 * @dev L'administrateur du vote commence la session de vote.
 * 
 ***********************************************************************************************************/ 
 
    function StartVote () public onlyOwner{
        require(Status==WorkflowStatus.ProposalsRegistrationEnded,"La Session d'enregistrement doit etre ouvert");
       emit VotingSessionStarted();
       Status = WorkflowStatus.VotingSessionStarted;
       emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded,WorkflowStatus.VotingSessionStarted);
    }
    
/*********************************************************************************************************
 * @dev Les électeurs inscrits votent pour leurs propositions préférées.
 * @param idPropal l'identifiant de la propositions
 ***********************************************************************************************************/ 
 
    function Vote (uint idPropal) public {
        require(Status == WorkflowStatus.VotingSessionStarted,"La Session de vote doit etre ferme avant");
        require(electeur[msg.sender].isRegistered==true,"Ne figure pas dans la whitelist");
        require(!electeur[msg.sender].hasVoted,"Vous avez deja vote");
        proposition[idPropal].voteCount=proposition[idPropal].voteCount.add(1);
        electeur[msg.sender].hasVoted=true;
        electeur[msg.sender].votedProposalId=idPropal;
        if (proposition[idPropal].voteCount >max){
               max =proposition[idPropal].voteCount;
               winningProposalId=idPropal;
        }
        
        emit Voted(msg.sender,idPropal);
       
    }
    
/*********************************************************************************************************
 * @dev L'administrateur du vote met fin à la session de vote.
 * 
 ***********************************************************************************************************/    
   
    function EndVote () public onlyOwner{
       // require(Status==WorkflowStatus.VotingSessionStarted,"La Session de vote doit etre ouverte");
       emit VotingSessionEnded();
       emit VotesTallied();
       Status = WorkflowStatus.VotingSessionEnded;
       emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted,WorkflowStatus.VotingSessionEnded);
    }
   

    
/*********************************************************************************************************
 * @dev 
 * @return Proposal return l'objet Proposal qui a gagné les elections
 *******************************************************************************************************/    
    
    function CheckWinner () public view returns(Proposal memory){
      return proposition[winningProposalId];  
    }
    
    
/*********************************************************************************************************
 * @dev verifie que une Adresse est enregistrement
 * @param _address Adresse Ethereum qui doit verifie sont inscription dans la whitelist
 * @return bool retourne vrai si "Dans la whiteliste" sinon faux 
 *******************************************************************************************************/       
   function isWhitelisted(address  _address) public view returns (uint){
       if(electeur[_address].isRegistered==true){
           return 1;
       }
       return 0;
   }
    
}