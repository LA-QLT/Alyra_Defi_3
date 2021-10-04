import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';



 
class Component_Whitelist extends Component {
   
  
    
  render (){ 
        return  (
          
            
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
            
         
        )
    }
    
}

  export default Component_Whitelist;