import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
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
    isElecteur: null
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
          
      // Interaction pour recupere l'adresse de l'admin
      const admin = await instance.methods.owner().call();

     
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, owner : admin}, this.runInit);
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
    
    // Interaction avec le smart contract pour verifier le status 
    const status = await contract.methods.Status().call();
    
    // Interaction avec le smart contract pour verifier si l'utilisateur est bien un electeur
    const electeur = await contract.methods.isWhitelisted(accounts[0]).call();
    
    // Update state with the result.
    this.setState({ Status: status, isElecteur: electeur });
  };


  whitelist = async() => {
    const { accounts, contract } = this.state;
    const address = this.address.value;
  
    // Interaction avec le smart contract pour ajouter un compte 
    await contract.methods.whitelist(address).send({from: accounts[0]});       

    //Mettre a jour a notre liste d'electeur 
    this.runInit();
  }

  isWhitelist = async() => {
    const {contract } = this.state;
    const addressVerif = this.addressVerif.value;
    
    // Interaction avec le smart contract pour verifier la presence de l'adresse dans la whitelist
    let isWhite = await contract.methods.isWhitelisted(addressVerif).call();

    if(isWhite==0){
      isWhite=`${addressVerif}  Ne fait pas partie de la whiteliste`
    }else {
      isWhite=`${addressVerif}  Fait partie de la whiteliste`
    }
    // Update state with the result.
    this.setState({ isWhitelist: isWhite });
    
  }

  StartEnregistrement = async() => {
    const { accounts, contract } = this.state;
    
    // Interaction avec le smart contract pour changer le status
    await contract.methods.StartEnregristrement().send({from: accounts[0]});
    
    //Recuperer le nouveau status
    this.runInit();

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
    
    //Recuperer le nouveau status
    this.runInit();
  }

  StartVote = async() => {
    const { accounts, contract } = this.state;
    
    // Interaction avec le smart contract pour changer le status
    await contract.methods.StartVote().send({from: accounts[0]});

    //Recuperer le nouveau status
    this.runInit();

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
      
    //Recuperer le nouveau status
    this.runInit();
   
  }

  Comptabiliser = async() => {
    const { accounts, contract } = this.state;
    
    // Interaction avec le smart contract pour comptabiliser les votes
    await contract.methods.Comptabilise().send({from: accounts[0]});
      
    //Recuperer le nouveau status
    this.runInit();

  }
  winner = async() => {
    const { contract } = this.state;
    
    // Interaction avec le smart contract pour verifier le gagnant
    const gagnant = await contract.methods.CheckWinner().call();
   
    this.setState({ winner: gagnant.description }); 
   
  }


  render() {
    const { isWhitelist , winner,accounts, Status,isElecteur} = this.state;
    var Etat=[
      "Enregistrement des Electeurs",
      "L'enregistrement des propositions a commencé",
      "L'enregistrement des propositions a pris fin",
      "L'enregistrement des votes a commencé",
      "L'enregistrement des votes a pris fin",
      "Le vote a été comptabilisé"
    ];
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
   
    return (
      
      
      <div className="App">

        

          <div style={{display: 'flex', justifyContent: 'center'}}>
              <Card style={{ width: '50rem' }}>
                <Card.Header><strong>Le Status est </strong></Card.Header>
                <Card.Body>
                   {Etat[Status]}
                </Card.Body>
              </Card>
          </div>
          <br></br>


      
        

          {accounts == this.state.owner &&
          
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <Card style={{ width: '50rem' }}>
                <Card.Header><strong>Autoriser un nouveau compte</strong></Card.Header>
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
        


          <div style={{display: 'flex', justifyContent: 'center'}}>       
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Verification</strong></Card.Header>
              <Card.Body>
                <Form.Group controlId="formAddress">
                  <Form.Control type="text" id="addressVerif"
                  ref={(input) => { this.addressVerif = input }}
                  />
                </Form.Group>
                <Button onClick={ this.isWhitelist } variant="dark" > Verifier </Button>                         
              </Card.Body>
              <Card.Body>
                <h2>
                  {isWhitelist}
                </h2>                      
              </Card.Body>
            </Card>         
          </div>
          <br></br>


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


          {accounts == this.state.owner &&
            <div style={{display: 'flex', justifyContent: 'center'}}>       
              <Card style={{ width: '50rem' }}>
                <Button onClick={ this.Comptabiliser} variant="dark">Comptabilise les votes</Button>   
              </Card>
            </div>
          }


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
