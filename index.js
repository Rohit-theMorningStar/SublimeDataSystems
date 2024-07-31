const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());


const customers = require('./customers.json');
const port = 6589;

//function used to read and write customers.json fime 
const writeCustomersToFile = (data) => {
    fs.writeFileSync('./customers.json', JSON.stringify(data, null, 2));
  };



  // 1. List API with search and pagination
app.get('/customers', (req, res) => {
    const { first_name, last_name, city, page = 1, limit = 10 } = req.query;
    let results = customers.filter(customer => {
      return (!first_name || customer.first_name.toLowerCase().includes(first_name.toLowerCase())) &&
             (!last_name || customer.last_name.toLowerCase().includes(last_name.toLowerCase())) &&
             (!city || customer.city.toLowerCase().includes(city.toLowerCase()));
    });
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    res.json(results.slice(startIndex, endIndex));
  });





//  single customer data by ID
app.get('/customers/:id', (req, res) => {
    const customer = customers.find(c => c.id == req.params.id);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).send('Customer not found');
    }
  });



  //API to list all the unique cities with number of customers from a particular city.
  app.get('/cities', (req, res) => {
    const cityCounts = customers.reduce((acc, customer) => {
      acc[customer.city] = (acc[customer.city] || 0) + 1;
      return acc;
    }, {});
    res.json(cityCounts);
  });



  
//add a customer with validations
app.post('/customers', (req, res) => {
    const { first_name, last_name, city, company } = req.body;
    if (!first_name || !last_name || !city || !company) {
      return res.status(400).send('All fields are required');
    }

    const newCustomer = {
      id: customers.length + 1,
      first_name,
      last_name,
      city,
      company
    };
    customers.push(newCustomer);
    writeCustomersToFile(customers);
    res.status(201).json(newCustomer);
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port} `);
  });