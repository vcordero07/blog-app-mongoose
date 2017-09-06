const chai = require('chai');
const chaiHttp = require('chai-http');

const {
  app,
  runServer,
  closeServer
} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Blog Posts', function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should list items on GET', function() {
    return chai.request(app)
      .get('/blog-post')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.above(0);
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.have.all.keys(
            'id', 'title', 'content', 'author', 'publishDate')
        });
      });
  });


  it('should add an item on POST', function() {
    const newItem = {
      title: 'mangu',
      content: 'platano\' verde',
      author: 'hatuey'
    };

    const expectedKeys = ['id', 'publishDate'].concat(Object.keys(newItem));

    return chai.request(app)
      .post('/blog-post')
      .send(newItem)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.all.keys(expectedKeys);
        res.body.title.should.equal(newItem.title);
        res.body.content.should.equal(newItem.content);
        res.body.author.should.equal(newItem.author)
      });
  });

  it('should error if POST missing expected values', function() {
    const badRequestData = {};
    return chai.request(app)
      .post('/blog-post')
      .send(badRequestData)
      .catch(function(res) {
        res.should.have.status(400);
      });
  });

  it('should update blog posts on PUT', function() {

    return chai.request(app)
      .get('/blog-post')
      .then(function(res) {
        const updatedPost = Object.assign(res.body[0], {
          title: 'Mangu',
          content: 'aplatanado'
        });
        return chai.request(app)
          .put(`/blog-post/${res.body[0].id}`)
          .send(updatedPost)
          .then(function(res) {
            res.should.have.status(204);
          });
      });
  });


  it('should delete posts on DELETE', function() {
    return chai.request(app)
      .get('/blog-post')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-post/${res.body[0].id}`)
          .then(function(res) {
            res.should.have.status(204);
          });
      });
  });

});
