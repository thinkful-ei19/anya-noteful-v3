'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const seedNotes = require('../db/seed/notes');

const expect = chai.expect;

//hooks function
describe ('Notes API resources', function() {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI);
  });
    
  beforeEach(function () {
    return Note.insertMany(seedNotes);
    // .then(() => { console.log('works');
    //   return Note.createIndexes(); 
    // });
      
    
  });
    
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
    
  after(function () {
    return mongoose.disconnect();
  });

  // GET all
  describe('GET /api/notes', function () {

    //1st version
    // it('should return all existing restaurants', function() {
    //   let res;
    //   return chai.request(app)
    //     .get('/api/notes')
    //     .then(function(_res) {
    //     // so subsequent .then blocks can access response object
    //       res = _res;
    //       expect(res).to.have.status(200);
    //       expect(res).to.be.json;
    //       expect(res.body).to.be.a('array');
    //       //expect(res.body.notes).to.have.length.of.at.least(1);
    //       return Note.count();
    //     })
    //     .then(function(count) {
    //       expect(res.body).to.have.lengthOf(count);
    //     });
    // });

    it('should return the correct number of Notes', function () {
      // 1) Call the database and the API
      const dbPromise = Note.find();
      const apiPromise = chai.request(app).get('/api/notes');
      // 2) Wait for both promises to resolve using `Promise.all`
      return Promise.all([dbPromise, apiPromise])
      // 3) **then** compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
  });

  describe('GET /api/notes/:id', function() {
    it('should return correct notes', function () {
      let data;
      return Note.findOne().select('id title content')
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'created');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });
  });
 
  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'tags': []
      };
      let body;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.include.keys('id', 'title', 'content', 'created');
          // 2) **then** call the database
          return Note.findById(body.id);
        })
        // 3) **then** compare
        .then(data => {
          expect(body.title).to.equal(data.title);
          expect(body.content).to.equal(data.content);
        });
    });
  });

  describe('PUT api/notes/:id', function() {
    it('sshould update the note', function () {
      const updateData = {
        title: 'PUT end point',
        content: 'Update please'
      };
      let data;
      return Note.findOne().select('id title content')
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .send(updateData);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(updateData.title);
          expect(res.body.content).to.equal(updateData.content);
        });
    });
  });

  describe.only('DELETE api/notes/:id', function() {
    it('should delete an item by id', function() {
      let data;
      return Note.findOne().select('id title content')
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/notes/${data.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
        });
    });
  });



});

