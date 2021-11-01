import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import Voting from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";
import "./App.css";


class App extends Component {

  state = { 
    web3: null, 
    accounts: null,   
    contract: null, 
    isWhitelist: null,
    winner: null, 
    owner: null,
    Status: null,
    isElecteur: null,
    proposals: [],
    Electeurs:[]
  };

  componentDidMount = async () => {
    try {
      // Récupérer le provider web3
      const web3 = await getWeb3();
  
      // Utiliser web3 pour récupérer les comptes de l’utilisateur (MetaMask dans notre cas) 
      const accounts = await web3.eth.getAccounts();

      // Récupérer l’instance du smart contract “Whitelist” avec web3 et les informations du déploiement du fichier (client/src/contracts/Whitelist.json)
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Voting.networks[networkId];
      const instance = new web3.eth.Contract(
        Voting.abi,
        deployedNetwork && deployedNetwork.address,
      );
     
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance}, this.runInit);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`,
      );
      console.error(error);
    }
  };


  runInit = async () => {
    const {accounts, contract } = this.state;
    const Etat = [
      "Enregistrement des electeurs", 
      "Debut de L'enregistrement des propositions a commencé", 
      "Fin de L'enregistrement des propositions a commencé",
      "Debut de l'enregistrement des votes",
      "Fin de l'enregistrement des votes"
    ];

    // Interaction avec le smart contract pour verifier le status 
    const status = Etat[await contract.methods.Status().call()];
    
   
    // Interaction pour recupere l'adresse de l'admin
    const admin = await contract.methods.owner().call();  

    // Interaction avec le smart contract pour verifier si l'utilisateur est bien un electeur
    const electeur = await contract.methods.isWhitelisted(accounts[0]).call();
    
    // Update state with the result.
    this.setState({ Status: status, isElecteur: electeur , owner : admin});
    this.InitElecteur();
    this.InitProposal();
    

    //Enregistrement des evenements
    
    contract.events.VoterRegistered({},(err,event)=>{
      console.log(err, event);
      console.log("C'est l'evenemenet celui ci ok", event);
      this.setState({ Status: "Enregistrement des electeurs"});
      this.InitElecteur();
    });

    contract.events.ProposalsRegistrationStarted({},(err,event)=>{
      console.log(err, event);
      this.setState({ Status: "Debut de L'enregistrement des propositions a commencé"});
    });

    contract.events.ProposalsRegistrationEnded({},(err,event)=>{
      console.log(err,event);
      this.setState({ Status: "Fin de L'enregistrement des propositions a commencé"});
    });
    
    contract.events.ProposalRegistered({},(err,event)=>{
      console.log(err,event);
      this.InitProposal();
    });

    contract.events.VotingSessionStarted({},(err,event)=>{
      console.log(err, event);
      this.setState({ Status: "Debut de l'enregistrement des votes"});
    });

    contract.events.VotingSessionEnded({},(err,event)=>{
      console.log(err, event);
      this.setState({ Status: "Fin de l'enregistrement des votes"});
    });

    contract.events.Voted({},(err,event)=>{
      console.log(err, event);
      //this.InitElecteur();
      this.InitProposal();
    });
    
    contract.events.VotesTallied({},(err,event)=>{
      console.log(err, event);
      this.setState({ Status: "Fin des elections"});
    });
    window.ethereum.on('accountsChanged', () => this.CompteMetamaskModifier());
    
  };
  
  CompteMetamaskModifier = async() => {
    const { web3,contract } = this.state;
    const reloadedAccounts = await web3.eth.getAccounts();
     // Interaction pour recupere l'adresse de l'admin
     const admin = await contract.methods.owner().call();  

     // Interaction avec le smart contract pour verifier si l'utilisateur est bien un electeur
     const electeur = await contract.methods.isWhitelisted(reloadedAccounts[0]).call();
     
    this.setState({ accounts: reloadedAccounts, isElecteur: electeur , owner : admin });
  }


  InitElecteur = async () => {
    const {contract} = this.state;
    const ElecteurCount = await contract.methods.Nb_Electeur().call();
    const Electeur = [];

    for(let i=0; i<ElecteurCount;i++){
      const electeur = await contract.methods.addresses(i).call();
      Electeur.push(electeur);
    } 
    this.setState({Electeurs: Electeur})
  }

 
  InitProposal = async () => {
    const {contract} = this.state;
    const proposalCount = await contract.methods.Nb_Proposition().call();
    const proposals = [];

    for(let i=0; i<proposalCount;i++){
      const proposal = await contract.methods.proposition(i).call();
      proposals.push(proposal);
    }    
    this.setState({proposals: proposals})
  }

  whitelist = async() => {
    const { accounts, contract } = this.state;
    const address = this.address.value;
  
    // Interaction avec le smart contract pour ajouter un compte 
    await contract.methods.whitelist(address).send({from: accounts[0]});       

  }
  

  StartEnregistrement = async() => {
    const { accounts, contract } = this.state;
    
    // Interaction avec le smart contract pour changer le status
    await contract.methods.StartEnregristrement().send({from: accounts[0]});
    
  }

  Proposal = async() => {
    const { accounts, contract } = this.state;
    const information = this.addProposal.value;
    
    // Interaction avec le smart contract pour ajouter une proposition
    await contract.methods.Addproposal(information).send({from: accounts[0]});
    
    
  }
  endEnregistrement = async() => {
    const { accounts, contract } = this.state;
    
    // Interaction avec le smart contract pour changer le status
    await contract.methods.EndEnregristrement().send({from: accounts[0]});
  }

  StartVote = async() => {
    const { accounts, contract } = this.state;
    // Interaction avec le smart contract pour changer le status
    await contract.methods.StartVote().send({from: accounts[0]});
  }

  Vote = async() => {
    const { accounts, contract } = this.state;
    const id = this.vote.value;  
    // Interaction avec le smart contract pour ajouter un vote
    await contract.methods.Vote(id).send({from: accounts[0]});
  }

  EndVote = async() => {
    const { accounts, contract } = this.state;   
    // Interaction avec le smart contract pour changer le status
    await contract.methods.EndVote().send({from: accounts[0]});
  }

  
  winner = async() => {
    const { contract } = this.state;   
    // Interaction avec le smart contract pour verifier le gagnant
    const gagnant = await contract.methods.CheckWinner().call();
    this.setState({ winner: gagnant.description });  
  }



  

  render() {
    const {  winner,accounts, Status,isElecteur,proposals, Electeurs} = this.state;
    
   
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
  
    return (
      
      
      <div className="App">

        

          <div style={{display: 'flex', justifyContent: 'center'}}>
              <Card style={{ width: '50rem' }}>
                <Card.Header><strong>Le Status est </strong></Card.Header>
                <Card.Body>
                   {Status}
                </Card.Body>
              </Card>
          </div>
          <br></br>


      
        

          {accounts == this.state.owner &&
          
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <Card style={{ width: '50rem' }}>
                <Card.Header><strong>Autorisation de nouveau compte</strong></Card.Header>
                <Card.Body>
                  <Form.Group controlId="formAddress">
                    <Form.Control type="text" id="address"
                    ref={(input) => { this.address = input }}
                    />
                  </Form.Group>
                  <Button onClick={ this.whitelist } variant="dark" > Autoriser </Button>
                </Card.Body>
              </Card>
            </div>
          }
           <br></br>

        
          
          {isElecteur == 1 &&
            <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Whitelist</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>@</th>
                      </tr>
                    </thead>
                    <tbody>
                      
                    {Electeurs !== null && 
                        Electeurs.map((a,index) => 
                          <tr key={index}>
                          <td>{a}</td>
                          </tr>)                     
                     }
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div> }

          {accounts == this.state.owner &&
            <div style={{display: 'flex', justifyContent: 'center'}}>       
              <Card style={{ width: '50rem' }}>
                <Button onClick={ this.StartEnregistrement } variant="dark">Commencer l'enregistrement des proposition</Button>   
              </Card>
            </div>
          }
          <br></br>

          {isElecteur == 1 &&
            <div style={{display: 'flex', justifyContent: 'center'}}>       
              <Card style={{ width: '50rem' }}>
                <Card.Header><strong>Rajout de proposition</strong></Card.Header>
                <Card.Body>
                  <Form.Group controlId="formAddress">
                    <Form.Control type="text" id="addProposal"
                    ref={(input) => { this.addProposal = input }}
                    />
                  </Form.Group>
                  <Card.Footer>
                  <button onClick={this.Proposal } variant="dark"> Add </button>   
                  </Card.Footer >                      
                </Card.Body>
                
              </Card>         
            </div>
          }
          
          { isElecteur == 1 &&
          <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Liste des proposition</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Id Proposition</th>
                        <th>Description</th>
                        <th>Nombre de Vote</th>
                      </tr>
                    </thead>
                    <tbody>
                      
                      {proposals !== null && 
                       
                        proposals.map((a,index) => 
                          <tr key={index}>
                          <td>{index}</td>
                          <td>{a.description}</td>
                          <td>{a.voteCount}</td>
                          </tr>)  
                      }
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div> 
        }
        
        <br></br>

          {accounts == this.state.owner &&
            <div style={{display: 'flex', justifyContent: 'center'}}>       
              <Card style={{ width: '50rem' }}>
                <Button onClick={ this.endEnregistrement } variant="dark">Fin de l'enregistrement des proposition</Button>   
              </Card>
            </div>
          }

          <br></br>

        
          {accounts == this.state.owner &&
            <div style={{display: 'flex', justifyContent: 'center'}}>       
              <Card style={{ width: '50rem' }}>
                <Button onClick={ this.StartVote} variant="dark">Debut de l'enregistrement des votes</Button>   
              </Card>
            </div>
          }

          <br></br>
          
          {isElecteur == 1 &&
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <Card style={{ width: '50rem' }}>
                <Card.Header><strong>Voter pour une proposition</strong></Card.Header>
                <Card.Body>
                  <Form.Group controlId="formAddress">
                    <Form.Control type="text" id="vote"
                    ref={(input) => { this.vote = input }}
                    />
                  </Form.Group>
                  <Button onClick={ this.Vote } variant="dark" > Voter </Button>
                </Card.Body>
              </Card>
            </div>
          }
          <br></br>


          {accounts == this.state.owner &&
            <div style={{display: 'flex', justifyContent: 'center'}}>       
              <Card style={{ width: '50rem' }}>
                <Button onClick={ this.EndVote} variant="dark">Fin de l'enregistrement des votes</Button>   
              </Card>
            </div>
          }

          <br></br>




          <br></br>


          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Qui est le gagnant ?</strong></Card.Header>
              <Card.Body>
                <Button onClick={ this.winner } variant="dark" > Le Gagnant est  </Button>
              </Card.Body>
              <Card.Body>
                <h2>{winner}</h2>
              </Card.Body>
            </Card>
          </div>


          <br></br>                  
        </div>
    );
  }
}

export default App;
