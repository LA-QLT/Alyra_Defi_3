import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
 
class iswhitelist extends React.Component  {
    
    isWhitelist = async() => {
        const { accounts, contract } = this.state;
        const addressVerif = this.addressVerif.value;
        console.log("adreess est ",addressVerif);
        // Interaction avec le smart contract pour ajouter un compte 
        const isWhite = await contract.methods.isWhitelisted(addressVerif).call();
        // Update state with the result.
        this.setState({ whitelist: isWhite });
      
      }

    render(){
        return  (
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
                    <h2>{whitelist}</h2>                      
                </Card.Body>
          </Card>         
        </div>
        )
    }
    
}

export default whitelist;