const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test("Create an issue with every field", function (done) {
    let testData = {
        "issue_title": "Test 1",
        "issue_text": "Text 1",
        "created_by": "Joe",
        "assigned_to": "Joe",
        "open": true,
        "status_text": "Stat text 1"
    };
    chai
      .request(server)
      .post("/api/issues/:test-pr")
      .send(testData)
      .end(function (err, res) {
        assert.isObject(res.body);
        assert.nestedInclude(res.body, testData);
        done();
      });
  });
  test("Create an issue with only required fields", function (done) {
    let testData = {
        "issue_title": "Test 2",
        "issue_text": "Text 2",
        "created_by": "Joe"
    };
    chai
      .request(server)
      .post("/api/issues/:test-pr")
      .send(testData)
      .end(function (err, res) {
        assert.isObject(res.body);
        assert.nestedInclude(res.body, testData);
        done();
      });
  });
  test("Create an issue with missing required fields", function (done) {
    let testData = {
        "issue_title": "Test 1",
    };
    chai
      .request(server)
      .post("/api/issues/:test-pr")
      .send(testData)
      .end(function (err, res) {
        assert.isObject(res.body);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });
  test("View issues on a project", function (done) {
    chai
      .request(server)
      .get("/api/issues/:test-pr")
      .end(function (err, res) {
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.property(issue, 'issue_title');
          assert.property(issue, 'issue_text');
          assert.property(issue, 'created_by');
          assert.property(issue, 'assigned_to');
          assert.property(issue, 'status_text');
          assert.property(issue, 'open');
          assert.property(issue, 'created_on');
          assert.property(issue, 'updated_on');
          assert.property(issue, '_id');
        });
        done();
      });
  });
  test("View issues on a project with one filter", function (done) {
    chai
      .request(server)
      .get("/api/issues/:test-pr?created_by=Joe")
      .end(function (err, res) {
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.created_by, 'Joe');
          assert.property(issue, 'issue_title');
          assert.property(issue, 'issue_text');
          assert.property(issue, 'created_by');
          assert.property(issue, 'assigned_to');
          assert.property(issue, 'status_text');
          assert.property(issue, 'open');
          assert.property(issue, 'created_on');
          assert.property(issue, 'updated_on');
          assert.property(issue, '_id');
        });
        done();
      });
  });
  test("View issues on a project with multiple filters", function (done) {
    chai
      .request(server)
      .get("/api/issues/:test-pr?created_by=Joe&assigned_to=Joe")
      .end(function (err, res) {
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.created_by, 'Joe');
          assert.equal(issue.assigned_to, 'Joe');
          assert.property(issue, 'issue_title');
          assert.property(issue, 'issue_text');
          assert.property(issue, 'created_by');
          assert.property(issue, 'assigned_to');
          assert.property(issue, 'status_text');
          assert.property(issue, 'open');
          assert.property(issue, 'created_on');
          assert.property(issue, 'updated_on');
          assert.property(issue, '_id');
        });
        done();
      });
  });
  test("Update one field on an issue", function (done) {
    let testData = {
      "issue_title": "Test 3",
      "issue_text": "Text 3",
      "created_by": "Joe"
    };
    chai
      .request(server)
      .post("/api/issues/:test-pr")
      .send(testData)
      .end((err, res) => {
        assert.isObject(res.body);
        assert.nestedInclude(res.body, testData);
        assert.isNotNull(res.body._id);
        let _id = res.body._id;
        chai
          .request(server)
          .put("/api/issues/:test-pr")
          .send({ "_id" : _id, "issue_title": "Updated" })
          .end(function (err, res) {
            assert.deepEqual(res.body, { result: 'successfully updated', _id : _id })
            chai.request(server).get("/api/issues/:test-pr?_id=" + _id).end((err, res) => {
              assert.isNotNull(res.body[0]);
              assert.isDefined(res.body[0]);
              let issue = res.body[0];
              assert.equal(issue.issue_title, 'Updated');
              assert.isAtLeast(
                Date.parse(issue.updated_on),
                Date.parse(issue.created_on)
              );
              done();
            })
          });
      });
  });
  test("Update multiple fields on an issue", function (done) {
    let testData = {
      "issue_title": "Test 4",
      "issue_text": "Text 4",
      "created_by": "Joe"
    };
    chai
      .request(server)
      .post("/api/issues/:test-pr")
      .send(testData)
      .end((err, res) => {
        assert.isObject(res.body);
        assert.nestedInclude(res.body, testData);
        assert.isNotNull(res.body._id);
        let _id = res.body._id;
        chai
          .request(server)
          .put("/api/issues/:test-pr")
          .send({ "_id" : _id, "issue_title": "Updated", "issue_text":"Updated" })
          .end(function (err, res) {
            assert.deepEqual(res.body, { result: 'successfully updated', _id : _id })
            chai.request(server).get("/api/issues/:test-pr?_id=" + _id).end((err, res) => {
              assert.isNotNull(res.body[0]);
              assert.isDefined(res.body[0]);
              let issue = res.body[0];
              assert.equal(issue.issue_title, 'Updated');
              assert.equal(issue.issue_text, 'Updated');
              assert.isAtLeast(
                Date.parse(issue.updated_on),
                Date.parse(issue.created_on)
              );
              done();
            })
          });
      });
  });
  test("Update an issue with missing _id", function (done) {
    chai
      .request(server)
      .put("/api/issues/:test-pr")
      .send({"issue_title": "Updated", "issue_text":"Updated"})
      .end((err, res) => {
        assert.isObject(res.body);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  }); 
  test("Update an issue with no fields to update", function (done) {
    let testData = {
      "issue_title": "Test 5",
      "issue_text": "Text 5",
      "created_by": "Joe"
    };
    chai
      .request(server)
      .post("/api/issues/:test-pr")
      .send(testData)
      .end((err, res) => {
        assert.isObject(res.body);
        assert.nestedInclude(res.body, testData);
        assert.isNotNull(res.body._id);
        let _id = res.body._id;
        chai
          .request(server)
          .put("/api/issues/:test-pr")
          .send({ "_id" : _id })
          .end(function (err, res) {
            assert.isObject(res.body);
            assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: _id });
            done();
            })
      });
  });
  test("Update an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .put("/api/issues/:test-pr")
      .send({_id : 'a' , created_by : "Updated"})
      .end((err, res) => {
        assert.isObject(res.body);
        assert.deepEqual(res.body, { error: 'could not update', '_id': 'a' });
        done();
      });
  });
test("Delete an issue", function (done) {
    let testData = {
      "issue_title": "Test 6",
      "issue_text": "Text 6",
      "created_by": "Joe"
    };
    chai
      .request(server)
      .post("/api/issues/:test-pr")
      .send(testData)
      .end((err, res) => {
        assert.isObject(res.body);
        assert.nestedInclude(res.body, testData);
        assert.isNotNull(res.body._id);
        let _id = res.body._id;
        chai
          .request(server)
          .delete("/api/issues/:test-pr")
          .send({ "_id" : _id })
          .end(function (err, res) {
            assert.isObject(res.body);
            assert.deepEqual(res.body, { result: 'successfully deleted', '_id': _id });
            done();
            })
      });
  });
  test("Delete an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .delete("/api/issues/:test-pr")
      .send({ _id : 'a' })
      .end((err, res) => {
        assert.isObject(res.body);
        assert.deepEqual(res.body, { error: 'could not delete', '_id': 'a' });
        done();
      });
  });
  test("Delete an issue with missing _id", function (done) {
    chai
      .request(server)
      .delete("/api/issues/:test-pr")
      .send({})
      .end((err, res) => {
        assert.isObject(res.body);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });    
});
